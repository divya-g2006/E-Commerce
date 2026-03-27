import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../lib/format';

const UPI_ID = '8940307512@ibl';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: 'Divya',
    phone: '8940307512',
    addressLine: '',
    city: 'Coimbatore',
    pincode: '',
    state: 'Tamil Nadu',
    country: 'India',
  });

  useEffect(() => {
    if (!user) return;
    loadCart();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (isAdmin) {
      navigate('/access-denied', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const loadCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (e) {
      console.error('Error loading cart:', e);
    } finally {
      setLoading(false);
    }
  };

  const items = cart?.products || [];

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  }, [items]);

  const upiLink = useMemo(() => {
    const am = total.toFixed(2);
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('ShopHub')}&am=${encodeURIComponent(am)}&cu=INR`;
  }, [total]);

  const qrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;
  }, [upiLink]);

  const placeOrder = async () => {
    setError('');
    setSuccess('');

    if (!items.length) {
      setError('Your cart is empty');
      return;
    }

    if (!form.fullName.trim() || !form.phone.trim() || !form.addressLine.trim() || !form.city.trim() || !form.pincode.trim()) {
      setError('Please fill all required delivery fields');
      return;
    }

    setPlacing(true);
    try {
      const response = await api.post('/orders', {
        address: {
          fullName: form.fullName,
          phone: form.phone,
          addressLine: form.addressLine,
          city: form.city,
          pincode: form.pincode,
          state: form.state,
          country: form.country,
        },
      });

      const orderId = response.data?.order?._id;
      navigate('/order-success', { state: { orderId } });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7C3AED]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <Link to="/cart" className="text-[#7C3AED] hover:text-[#6D28D9]">Back to Cart</Link>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={form.addressLine}
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              {items.length === 0 ? (
                <p className="text-gray-600">Your cart is empty.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm text-gray-700">
                      <span>{item.product?.name} x {item.quantity}</span>
                      <span className="font-medium">{formatINR((item.product?.price || 0) * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-[#7C3AED]">{formatINR(total)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Pay via UPI</h2>
              <p className="text-gray-600 text-sm mb-4">UPI ID: {UPI_ID}</p>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div>
                  <img src={qrUrl} alt="UPI QR" className="w-[220px] h-[220px] border rounded" />
                </div>
                <div className="flex-1">
                  <a
                    href={upiLink}
                    className="inline-block bg-[#7C3AED] text-white px-4 py-2 rounded-lg hover:bg-[#6D28D9] transition-colors"
                  >
                    Open UPI Payment
                  </a>
                  <p className="text-xs text-gray-500 mt-2 break-all">{upiLink}</p>

                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="mt-4 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {placing ? 'Placing Order...' : 'I Have Completed Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
