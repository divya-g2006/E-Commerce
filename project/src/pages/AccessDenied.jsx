import { Link } from 'react-router-dom';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <Link
          to="/"
          className="inline-block w-full bg-[#7C3AED] text-white py-2 px-4 rounded-lg hover:bg-[#6D28D9] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

