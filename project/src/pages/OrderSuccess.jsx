import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="text-green-600" size={72} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully</h1>
        <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>

        {state.orderId && (
          <div className="mb-6 p-3 bg-gray-50 border rounded">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono text-sm text-gray-800 break-all">{state.orderId}</p>
          </div>
        )}

        <button
          onClick={() => navigate('/orders')}
          className="w-full bg-[#7C3AED] text-white py-2 px-4 rounded-lg hover:bg-[#6D28D9] transition-colors"
        >
          Go to My Orders
        </button>
      </div>
    </div>
  );
}
