import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return <AdminPanel onClose={() => navigate('/')} />;
}
