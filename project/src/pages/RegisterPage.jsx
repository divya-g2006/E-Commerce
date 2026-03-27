import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Register from '../components/Register';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (!justRegistered) return;
    if (!user) return;

    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [justRegistered, user, navigate]);

  return (
    <Register
      onToggleLogin={() => navigate('/login')}
      onClose={() => navigate('/')}
      onRegistered={() => setJustRegistered(true)}
    />
  );
}
