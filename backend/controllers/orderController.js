import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { body, validationResult } from 'express-validator';
import { getExpectedDeliveryDate, isDelayedOrder } from '../utils/delivery.js';

const AUTO_OUT_FOR_DELIVERY_DAYS = 9;

const autoUpdateOutForDelivery = async () => {
  const cutoff = new Date(Date.now() - AUTO_OUT_FOR_DELIVERY_DAYS * 24 * 60 * 60 * 1000);
  await Order.updateMany(
    { status: { $ne: 'Completed' }, createdAt: { $lt: cutoff } },
    { $set: { status: 'Out for Delivery' } }
  );
};

const withDerivedOrderFields = (order) => {
  const plain = typeof order?.toObject === 'function' ? order.toObject() : order;
  const expected = getExpectedDeliveryDate(plain?.createdAt);
  const delayed = isDelayedOrder(plain?.createdAt);

  let status = plain?.status;
  let message = 'Product processing for delivery';

  if (status === 'Completed') {
    message = 'Order successfully completed';
  } else if (delayed) {
    status = 'Out for Delivery';
    message = 'Out for delivery';
  }

  return {
    ...plain,
    status,
    expectedDeliveryDate: expected ? expected.toISOString() : null,
    message,
  };
};

export const createOrder = async (req, res) => {
  try {
    const { address, items } = req.body;
    if (!address) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    const required = ['fullName', 'phone', 'addressLine', 'city', 'pincode'];
    for (const key of required) {
      if (!String(address?.[key] || '').trim()) {
        return res.status(400).json({ message: `Missing address field: ${key}` });
      }
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');

    const requestedItems = Array.isArray(items) && items.length
      ? items
      : (cart?.products || []).map((ci) => ({ product: ci.product?._id || ci.product, quantity: ci.quantity }));

    if (!requestedItems.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const productIds = requestedItems.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productById = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    for (const reqItem of requestedItems) {
      const productId = reqItem.product?.toString();
      const quantity = Number(reqItem.quantity);

      if (!productId) {
        return res.status(400).json({ message: 'Invalid product in items' });
      }
      if (!Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity in items' });
      }

      const product = productById.get(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        quantity,
        price: product.price,
      });
    }

    const totalAmount = orderItems.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      address: {
        fullName: String(address.fullName).trim(),
        phone: String(address.phone).trim(),
        addressLine: String(address.addressLine).trim(),
        city: String(address.city).trim(),
        pincode: String(address.pincode).trim(),
        state: address.state ? String(address.state).trim() : undefined,
        country: address.country ? String(address.country).trim() : undefined,
      },
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
    });

    await order.save();

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    if (cart) {
      cart.products = [];
      await cart.save();
    }

    await order.populate('items.product', 'name price image');

    res.status(201).json({
      message: 'Order placed successfully',
      order: withDerivedOrderFields(order),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const receiveOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!['Pending', 'Out for Delivery'].includes(order.status)) {
      return res.status(400).json({ message: 'Only pending/out-for-delivery orders can be marked as completed' });
    }

    order.status = 'Completed';
    await order.save();

    await order.populate('items.product', 'name price image');

    res.json({
      message: 'Order marked as completed',
      order: withDerivedOrderFields(order),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    await autoUpdateOutForDelivery();
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    
    res.json(orders.map(withDerivedOrderFields));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    await autoUpdateOutForDelivery();
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    
    res.json(orders.map(withDerivedOrderFields));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin-only: fetch all orders (not user-specific)
export const getAdminOrders = async (req, res) => {
  try {
    await autoUpdateOutForDelivery();
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.json(orders.map(withDerivedOrderFields));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateOrderStatus = [
  body('status')
    .isIn(['Pending', 'Out for Delivery', 'Shipped', 'Delivered', 'Completed'])
    .withMessage('Invalid status'),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.body;
      const { id } = req.params;

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).populate('items.product', 'name price image').populate('user', 'name email');
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json({
        message: 'Order status updated successfully',
        order: withDerivedOrderFields(order),
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];
