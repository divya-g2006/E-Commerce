import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import { useAuth } from '../contexts/AuthContext';

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

export default function LoginPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const mode = query.get('mode') === 'admin' ? 'admin' : 'user';
  const { user } = useAuth();
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (!justLoggedIn) return;
    if (!user) return;

    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [justLoggedIn, user, navigate]);

  return (
    <Login
      mode={mode}
      onToggleRegister={() => navigate('/register')}
      onClose={() => navigate('/')}
      onLoggedIn={() => setJustLoggedIn(true)}
    />
  );
}
