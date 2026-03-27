import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!isAdmin) {
      setError('Only admins can update email/password here.');
      return;
    }

    const payload = {};
    if (email?.trim()) payload.email = email.trim();
    if (password?.trim()) payload.password = password.trim();

    if (!payload.email && !payload.password) {
      setError('Enter a new email and/or a new password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/admin/update-profile', payload);
      const updatedUser = res.data?.user;
      if (updatedUser) {
        updateUser(updatedUser);
        setEmail(updatedUser.email || '');
      }
      setPassword('');
      setSuccess(res.data?.message || 'Profile updated');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <p className="text-gray-700">
              <span className="font-semibold">Role:</span> {user?.role}
            </p>
            <p className="text-gray-700 mt-2">
              <span className="font-semibold">Name:</span> {user?.name}
            </p>
            <p className="text-gray-700 mt-2">
              <span className="font-semibold">Current Email:</span> {user?.email}
            </p>
          </div>

          {success && <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded">{success}</div>}
          {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                disabled={!isAdmin || loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                disabled={!isAdmin || loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={!isAdmin || loading}
              className="w-full bg-[#7C3AED] text-white py-2 px-4 rounded-lg hover:bg-[#6D28D9] transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
