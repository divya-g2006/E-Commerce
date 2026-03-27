import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
  },
  address: {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  paymentMethod: {
    type: String,
    enum: ['UPI'],
    default: 'UPI',
  },
  paymentStatus: {
    type: String,
    enum: ['Paid'],
    default: 'Paid',
  },
  status: {
    type: String,
    enum: ['Pending', 'Out for Delivery', 'Shipped', 'Delivered', 'Completed'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Order', orderSchema);
