// src/components/AdminOrders.tsx
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { formatINR } from '../lib/format';
import { useAuth } from '../contexts/AuthContext';
import { getExpectedDeliveryDate, getOrderMessage, isDelayed } from '../lib/delivery';

export default function AdminOrders() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageClasses = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-orange-700';
      case 'Completed':
        return 'text-green-700';
      case 'Out for Delivery':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadOrders();
  }, [isAdmin]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const candidates = ['/orders/admin', '/orders/all', '/orders'];
      let data = null;

      for (const path of candidates) {
        try {
          const res = await api.get(path);
          data = res.data;
          break;
        } catch (inner) {
          const status = inner.response?.status;
          if (status === 404) continue; // try next candidate
          throw inner;
        }
      }

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response shape while loading admin orders');
      }

      setOrders(data);
    } catch (e) {
      console.error('Error loading orders', e);
      const status = e.response?.status;
      const serverMessage = e.response?.data?.message;
      const networkHint = e.code === 'ERR_NETWORK' ? 'Network/CORS error. Is the backend running and CORS allowed?' : null;
      const message = serverMessage || networkHint || e.message || 'Failed to load admin orders';
      const requestedUrl = e.config?.baseURL && e.config?.url ? `${e.config.baseURL}${e.config.url}` : null;
      const detail = requestedUrl ? `Request: ${requestedUrl}` : null;
      const combined = [status ? `${message} (HTTP ${status})` : message, detail].filter(Boolean).join(' | ');
      setError(combined);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return <div>Access Denied</div>;
  if (loading) return <div>Loading Orders...</div>;

  return (
    <div className="mt-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-[#7C3AED] mb-4">Orders List</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      {orders.length === 0 ? (
        <div>{error ? 'Could not load orders.' : 'No orders found.'}</div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Image</th>
              <th className="p-2 text-left">Order ID</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Location</th>
              <th className="p-2 text-left">City</th>
              <th className="p-2 text-left">Pincode</th>
              <th className="p-2 text-left">Products</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Message</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Expected</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b">
                <td className="p-2">
                  {order.items?.[0]?.product?.image ? (
                    <img
                            src={order.items[0].product.image}
                            alt={order.items[0].product.name || 'Product'}
                            className="w-12 h-12 object-cover rounded border border-gray-200"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded border border-gray-200 bg-gray-50" />
                        )}
                </td>
                <td className="p-2">{order._id}</td>
                <td className="p-2">{order.user?.name || order.address?.fullName || 'N/A'}</td>
                <td className="p-2">{order.user?.email || 'N/A'}</td>
                <td className="p-2">{order.address?.phone || 'N/A'}</td>
                <td className="p-2">{order.address?.addressLine || 'N/A'}</td>
                <td className="p-2">{order.address?.city || 'N/A'}</td>
                <td className="p-2">{order.address?.pincode || 'N/A'}</td>
                <td className="p-2">
                  {order.items?.length ? (
                    order.items.map((p, idx) => (
                      <div key={p.product?._id || idx} className="flex items-center gap-2">
                        {p.product?.image ? (
                          <img
                            src={p.product.image}
                            alt={p.product?.name || 'Product'}
                            className="w-10 h-10 object-cover rounded border border-gray-200"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div>
                          <div>{p.product?.name || 'Unknown product'} x {p.quantity}</div>
                          <div className="text-xs text-gray-500">{formatINR(p.price)} each</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No items</div>
                  )}
                </td>
                <td className="p-2">{formatINR(order.totalAmount)}</td>
                <td className="p-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className={`p-2 ${getMessageClasses(order.status)}`}>
                  {order.message ?? getOrderMessage(order.status, order.createdAt)}
                </td>
                <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
