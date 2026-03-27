// src/components/AdminPanel.tsx
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../lib/format';
import AdminOrders from './AdminOrders'; // Orders component

export default function AdminPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Electronics',
    stock: '',
  });

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'products') loadProducts();
  }, [isAdmin, activeTab]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error loading products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category,
      stock: parseInt(formData.stock),
    };
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productData);
        alert('Product updated successfully!');
      } else {
        await api.post('/products', productData);
        alert('Product created successfully!');
      }
      resetForm();
      loadProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      stock: product.stock.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      alert('Product deleted successfully!');
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'Electronics',
      stock: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Access Denied
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this panel.</p>
          <button onClick={onClose} className="w-full bg-[#7C3AED] text-white py-2 px-4 rounded-lg hover:bg-[#6D28D9]">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full p-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full p-8 my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#7C3AED]">Admin Panel</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 space-x-4">
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg ${activeTab === 'products' ? 'bg-[#7C3AED] text-white' : 'bg-gray-200'}`}>
            Products
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-[#7C3AED] text-white' : 'bg-gray-200'}`}>
            Orders
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {/* Add Product Button */}
            <div className="mb-6">
              <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 bg-[#7C3AED] text-white px-4 py-2 rounded-lg hover:bg-[#6D28D9]">
                <Plus size={20} /> <span>Add Product</span>
              </button>
            </div>

            {/* Product Form */}
            {showForm && (
              <div className="mb-8 p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Product Name" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  <input type="number" placeholder="Price" value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Books</option>
                    <option>Home</option>
                    <option>Sports</option>
                    <option>Other</option>
                  </select>
                  <input type="number" placeholder="Stock" value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  <textarea placeholder="Description" value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="md:col-span-2 w-full px-3 py-2 border rounded-lg" />
                  <input type="text" placeholder="Image URL" value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })} required className="md:col-span-2 w-full px-3 py-2 border rounded-lg" />
                  <div className="md:col-span-2 flex space-x-4">
                    <button type="submit" className="bg-[#7C3AED] text-white px-6 py-2 rounded-lg hover:bg-[#6D28D9]">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    <button type="button" onClick={resetForm} className="bg-gray-300 px-6 py-2 rounded-lg">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Image</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Stock</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} className="border-b">
                      <td className="p-2"><img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" /></td>
                      <td className="p-2">{product.name}</td>
                      <td className="p-2">{formatINR(product.price)}</td>
                      <td className="p-2">{product.category}</td>
                      <td className="p-2">{product.stock}</td>
                      <td className="p-2 flex space-x-2">
                        <button onClick={() => handleEdit(product)} className="text-blue-600"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(product._id)} className="text-red-600"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && <AdminOrders />}
      </div>
    </div>
  );
}
