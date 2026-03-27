import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../lib/format';
import { getExpectedDeliveryDate, getOrderMessage, isDelayed } from '../lib/delivery';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    setError('');
    try {
      const response = await api.get('/orders/myorders');
      setOrders(response.data);
    } catch (e) {
      console.error('Error loading orders:', e);
      const status = e.response?.status;
      const serverMessage = e.response?.data?.message;
      const networkHint = e.code === 'ERR_NETWORK' ? 'Network/CORS error. Is the backend running and CORS allowed?' : null;
      const message = serverMessage || networkHint || e.message || 'Failed to load orders';
      const requestedUrl = e.config?.baseURL && e.config?.url ? `${e.config.baseURL}${e.config.url}` : null;
      const detail = requestedUrl ? `Request: ${requestedUrl}` : null;
      const combined = [status ? `${message} (HTTP ${status})` : message, detail].filter(Boolean).join(' | ');
      setError(combined);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markReceived = async (orderId) => {
    try {
      await api.put(`/orders/receive/${orderId}`);
      alert('Order Completed');
      setLoading(true);
      await loadOrders();
    } catch (e) {
      const status = e.response?.status;
      const serverMessage = e.response?.data?.message;
      const requestedUrl = e.config?.baseURL && e.config?.url ? `${e.config.baseURL}${e.config.url}` : null;
      const networkHint = e.code === 'ERR_NETWORK' ? 'Network/CORS error. Is the backend running and CORS allowed?' : null;
      const message = serverMessage || networkHint || e.message || 'Failed to update order';
      const detail = requestedUrl ? `Request: ${requestedUrl}` : null;
      const combined = [status ? `${message} (HTTP ${status})` : message, detail].filter(Boolean).join(' | ');
      alert(combined);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7C3AED]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Orders</h1>

        {error && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-red-200">
            <p className="text-red-700 font-semibold mb-1">Could not load orders</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet</p>
            <Link
              to="/"
              className="inline-block bg-[#7C3AED] text-white px-6 py-2 rounded-lg hover:bg-[#6D28D9]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expected:{' '}
                        {(() => {
                          const expected =
                            order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : getExpectedDeliveryDate(order.createdAt);
                          if (!expected) return <span className="text-gray-500">N/A</span>;

                          const delayed = isDelayed(order.createdAt);
                          return (
                            <span className={delayed ? 'text-red-600 font-semibold' : undefined}>
                              {expected.toLocaleDateString()}
                            </span>
                          );
                        })()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className={`mt-2 text-sm font-medium ${order.status === 'Completed' ? 'text-green-700' : order.status === 'Out for Delivery' ? 'text-blue-700' : 'text-orange-700'}`}>
                        {order.message ?? getOrderMessage(order.status, order.createdAt)}
                      </p>
                      <p className="text-lg font-bold text-gray-800 mt-2">
                        {formatINR(order.totalAmount)}
                      </p>

                      {(order.status === 'Pending' || order.status === 'Out for Delivery') && (
                        <button
                          onClick={() => markReceived(order._id)}
                          className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Product Received
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
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
                          <h4 className="font-medium text-gray-800">{item.product?.name}</h4>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">
                            {formatINR(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-600">{formatINR(item.price)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
