import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import api from './lib/api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import AccessDenied from './pages/AccessDenied';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
function AppContent() {
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCartCount();
    } else {
      setCartItemsCount(0);
    }
  }, [user]);

  const loadCartCount = async () => {
    if (!user) return;

    try {
      const response = await api.get('/cart');
      const count = response.data?.products?.length || 0;
      setCartItemsCount(count);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', { productId });
      alert('Item added to cart!');
      loadCartCount();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add item to cart');
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
      <Navbar
        onLoginClick={() => navigate('/login')}
        onAdminLoginClick={() => navigate('/login?mode=admin')}
        onSignupClick={() => navigate('/register')}
        onProfileClick={() => navigate('/profile')}
        onCartClick={() => navigate('/cart')}
        onMyOrdersClick={() => navigate('/orders')}
        onAdminClick={() => navigate('/admin')}
        onHomeClick={() => navigate('/')}
        cartItemsCount={cartItemsCount}
      />

      <Routes>
        <Route
          path="/"
          element={
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to ShopHub</h1>
                <p className="text-gray-600">Discover amazing products at great prices</p>
              </div>

              <ProductList
                onAddToCart={handleAddToCart}
                onLoginPrompt={() => navigate('/login')}
              />
            </main>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
