import { ShoppingCart, User, LogOut, ShoppingBag, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ onLoginClick, onAdminLoginClick, onSignupClick, onProfileClick, onCartClick, onMyOrdersClick, onAdminClick, onHomeClick, cartItemsCount }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={onHomeClick}
            className="flex items-center space-x-2 text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
          >
            <ShoppingBag size={28} />
            <span className="text-2xl font-bold">ShopHub</span>
          </button>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={onHomeClick}
                  className="px-4 py-2 text-gray-700 hover:text-[#7C3AED] transition-colors"
                >
                  Home
                </button>

                {isAdmin && (
                  <button
                    onClick={onAdminClick}
                    className="flex items-center space-x-1 px-4 py-2 text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                  >
                    <Shield size={20} />
                    <span className="hidden sm:inline">Admin Dashboard</span>
                  </button>
                )}

                {!isAdmin && (
                  <>
                    <button
                      onClick={onCartClick}
                      className="relative flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-[#7C3AED] transition-colors"
                    >
                      <ShoppingCart size={24} />
                      {cartItemsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#7C3AED] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItemsCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={onMyOrdersClick}
                      className="px-4 py-2 text-gray-700 hover:text-[#7C3AED] transition-colors"
                    >
                      My Orders
                    </button>
                  </>
                )}

                <button
                  onClick={onProfileClick}
                  className="flex items-center space-x-2 text-gray-700 hover:text-[#7C3AED] transition-colors"
                >
                  <User size={20} />
                  <span className="hidden sm:inline">{user.name || 'User'}</span>
                  {isAdmin && (
                    <span className="hidden sm:inline text-xs bg-[#7C3AED] text-white px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </button>

                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onHomeClick}
                  className="px-4 py-2 text-gray-700 hover:text-[#7C3AED] transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 text-gray-700 hover:text-[#7C3AED] transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={onSignupClick}
                  className="px-4 py-2 text-gray-700 hover:text-[#7C3AED] transition-colors"
                >
                  Signup
                </button>
                <button
                  onClick={onAdminLoginClick}
                  className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors"
                >
                  Admin Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
