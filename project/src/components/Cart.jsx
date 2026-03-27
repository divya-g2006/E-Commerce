import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../lib/format';

export default function Cart({ onClose, onCartUpdate }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`/cart/${productId}`, { quantity: newQuantity });
      loadCart();
      onCartUpdate();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      loadCart();
      onCartUpdate();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const goToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const total = cart?.products?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-8 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#7C3AED]">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {!cart?.products?.length ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {cart.products.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center space-x-4 border border-gray-200 rounded-lg p-4"
                >
                  <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.product?.name}</h3>
                    <p className="text-[#7C3AED] font-bold">{formatINR(item.product?.price || 0)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-gray-800">
                      {formatINR((item.product?.price || 0) * item.quantity)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-[#7C3AED]">
                  {formatINR(total)}
                </span>
              </div>

              <button
                onClick={goToCheckout}
                disabled={!cart?.products?.length}
                className="w-full bg-[#7C3AED] text-white py-3 px-6 rounded-lg hover:bg-[#6D28D9] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
