import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  Users, UserPlus, TrendingUp, Phone, Mail, Calendar, 
  DollarSign, Target, Activity, MoreHorizontal, Plus,
  Search, Filter, Edit, Trash2, Eye, LogOut, Home,
  BarChart3, Settings, Bell, ChevronDown, ChevronRight,
  Menu, X, User, Building2, FileText, CheckCircle,
  Clock, AlertCircle, Zap, Star, ArrowUpRight,
  PieChart as PieChartIcon, TrendingDown, ExternalLink,
  Archive, MapPin, Save, Upload, Download, Link2,
  ArrowLeft, Tag, Briefcase, Send, Bold, Italic, Underline,
  MessageCircle, FolderOpen, CalendarDays, Banknote,
  GraduationCap, ClipboardList
} from 'lucide-react';
import LeadManagement from './LeadManagement';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Setup axios interceptor
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`);
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (emailOrUsername, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { login: emailOrUsername, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      const { access_token, user: newUser } = response.data;
      
      setToken(access_token);
      setUser(newUser);
      localStorage.setItem('token', access_token);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Placeholder components for new routes
const ClientsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClients, setSelectedClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalClients: 0,
    totalContractValue: 0,
    clientsThisMonth: 0,
    contractValueThisMonth: 0
  });

  useEffect(() => {
    fetchClients();
    fetchStatistics();
  }, [statusFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/clients?status=${statusFilter}`);
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API}/clients/statistics`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedClients(filteredClients.map(client => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId, checked) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedClients.length === 0) return;
    
    try {
      await axios.post(`${API}/clients/bulk-action`, {
        action,
        client_ids: selectedClients
      });
      
      await fetchClients();
      await fetchStatistics();
      setSelectedClients([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa client này?')) return;
    
    try {
      await axios.delete(`${API}/clients/${clientId}`);
      await fetchClients();
      await fetchStatistics();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      await axios.post(`${API}/clients`, clientData);
      await fetchClients();
      await fetchStatistics();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  };

  const handleEditClient = async (clientData) => {
    try {
      await axios.put(`${API}/clients/${selectedClient.id}`, clientData);
      await fetchClients();
      await fetchStatistics();
      setShowEditModal(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý Client</h2>
          <p className="text-slate-600 mt-1">Quản lý danh sách khách hàng đã ký hợp đồng</p>
        </div>
      </div>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Tổng Client</p>
            <p className="text-2xl font-bold text-slate-900">{statistics.totalClients}</p>
            <p className="text-sm text-slate-500 mt-1">Tổng khách hàng</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Giá trị hợp đồng</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(statistics.totalContractValue)}</p>
            <p className="text-sm text-slate-500 mt-1">Tổng giá trị</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Client trong tháng</p>
            <p className="text-2xl font-bold text-slate-900">{statistics.clientsThisMonth}</p>
            <p className="text-sm text-slate-500 mt-1">Tháng này</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-100">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Giá trị HĐ tháng</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(statistics.contractValueThisMonth)}</p>
            <p className="text-sm text-slate-500 mt-1">Tháng này</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Bulk Actions */}
            {selectedClients.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="flex items-center px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa / Lưu trữ
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                
                {showBulkActions && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-t-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      Xóa đã chọn
                    </button>
                    <button
                      onClick={() => handleBulkAction('archive')}
                      className="w-full text-left px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-b-lg transition-colors"
                    >
                      <Archive className="w-4 h-4 inline mr-2" />
                      Lưu trữ đã chọn
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>

          {/* Add Client Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm Client
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tên Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Người liên hệ
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Giá trị hợp đồng
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Link hợp đồng
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={(e) => handleSelectClient(client.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 cursor-pointer hover:text-blue-600"
                               onClick={() => navigate(`/clients/${client.id}`)}>
                            {client.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700">{client.contact_person || 'Chưa có'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {formatCurrency(client.contract_value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.contract_link ? (
                        <a
                          href={client.contract_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Xem hợp đồng
                        </a>
                      ) : (
                        <span className="text-slate-400">Không có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">Không có client nào</p>
                    <p className="text-sm">Hãy thêm client đầu tiên của bạn</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <ClientModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddClient}
          title="Thêm Client mới"
        />
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <ClientModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
          }}
          onSubmit={handleEditClient}
          client={selectedClient}
          title="Sửa thông tin Client"
        />
      )}
    </div>
  );
};
const ClientModal = ({ isOpen, onClose, onSubmit, client = null, title }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    contact_person: client?.contact_person || '',
    email: client?.email || '',
    phone: client?.phone || '',
    contract_link: client?.contract_link || '',
    address: client?.address || '',
    notes: client?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        company: '', // Set empty company
        contract_value: 0 // Set default contract value
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tên Client
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên client"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Người liên hệ
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên người liên hệ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Link hợp đồng
            </label>
            <input
              type="url"
              name="contract_link"
              value={formData.contract_link}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập link hợp đồng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập ghi chú"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {client ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Client Detail Page Component - Full Detail View
const ClientDetailPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (clientId) {
      fetchClientDetail();
      fetchClientDocuments();
      fetchClientProjects();
    }
  }, [clientId]);

  const fetchClientDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/clients/${clientId}`);
      setClient(response.data);
    } catch (error) {
      console.error('Failed to fetch client detail:', error);
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDocuments = async () => {
    try {
      const response = await axios.get(`${API}/clients/${clientId}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const fetchClientProjects = async () => {
    try {
      const response = await axios.get(`${API}/clients/${clientId}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleUpdateClient = async (clientData) => {
    try {
      await axios.put(`${API}/clients/${clientId}`, clientData);
      await fetchClientDetail(); // Refresh client data
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  const handleAddDocument = async (documentData) => {
    try {
      await axios.post(`${API}/clients/${clientId}/documents`, documentData);
      await fetchClientDocuments();
      setShowAddDocument(false);
    } catch (error) {
      console.error('Failed to add document:', error);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) return;
    
    try {
      await axios.delete(`${API}/clients/${clientId}/documents/${documentId}`);
      await fetchClientDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateVN = (dateString) => {
    const date = new Date(dateString);
    // Convert to Vietnam timezone (UTC+7)
    const vnDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return vnDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-slate-900 mb-2">Client không tồn tại</h3>
        <button
          onClick={() => navigate('/clients')}
          className="text-blue-600 hover:text-blue-800"
        >
          Quay lại danh sách Client
        </button>
      </div>
    );
  }

  const totalContractValue = projects.reduce((sum, project) => sum + (project.contract_value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Chi tiết Client</h2>
            <p className="text-slate-600 mt-1">Thông tin chi tiết và quản lý client</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Client Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-medium">
                  {client.name?.charAt(0) || 'C'}
                </span>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </button>
            </div>

            {/* Client Info Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tên Client</label>
                <p className="text-sm font-medium text-slate-900">{client.name || 'Chưa có'}</p>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Người liên hệ</label>
                <p className="text-sm text-slate-700">{client.contact_person || 'Chưa có'}</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</label>
                <p className="text-sm text-slate-700">{client.email || 'Chưa có'}</p>
              </div>

              {/* Invoice Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Mail nhận hoá đơn</label>
                <p className="text-sm text-slate-700">{client.invoice_email || 'Chưa có'}</p>
              </div>

              {/* Contract Value (calculated from projects) */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Giá trị hợp đồng</label>
                <p className="text-sm font-semibold text-green-600">{formatCurrency(totalContractValue)}</p>
              </div>

              {/* Client Type */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Phân loại</label>
                <p className="text-sm text-slate-700">
                  {client.client_type === 'business' ? 'Doanh nghiệp' : 'Cá nhân'}
                </p>
              </div>

              {/* Source */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nguồn</label>
                <p className="text-sm text-slate-700">{client.source || 'Chưa có'}</p>
              </div>

              {/* Created Date */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ngày tạo</label>
                <p className="text-sm text-slate-700">{formatDateVN(client.created_at)}</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ghi chú</label>
                <p className="text-sm text-slate-700">{client.notes || 'Chưa có ghi chú'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Tabs */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-slate-200 bg-slate-50">
              <nav className="flex space-x-0">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Tổng quan
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === 'projects'
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Dự án ({projects.length})
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === 'documents'
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Hồ sơ ({documents.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <ClientOverviewTab
                  totalContractValue={totalContractValue}
                  projectCount={projects.length}
                  client={client}
                  documents={documents}
                  projects={projects}
                />
              )}

              {activeTab === 'projects' && (
                <ClientProjectsTab
                  projects={projects}
                  clientId={clientId}
                />
              )}

              {activeTab === 'documents' && (
                <ClientDocumentsTab
                  documents={documents}
                  onAddDocument={handleAddDocument}
                  onDeleteDocument={handleDeleteDocument}
                  showAddDocument={showAddDocument}
                  setShowAddDocument={setShowAddDocument}
                  fetchDocuments={fetchClientDocuments}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      {showEditModal && (
        <ClientEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateClient}
          client={client}
          title="Chỉnh sửa thông tin Client"
        />
      )}
    </div>
  );
};

// Client Edit Modal Component
const ClientEditModal = ({ isOpen, onClose, onSubmit, client = null, title }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    contact_person: client?.contact_person || '',
    email: client?.email || '',
    phone: client?.phone || '',
    contract_link: client?.contract_link || '',
    address: client?.address || '',
    notes: client?.notes || '',
    invoice_email: client?.invoice_email || '',
    client_type: client?.client_type || 'individual',
    source: client?.source || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tên Client
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên client"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Người liên hệ
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên người liên hệ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mail nhận hoá đơn
              </label>
              <input
                type="email"
                name="invoice_email"
                value={formData.invoice_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập email nhận hoá đơn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phân loại
              </label>
              <select
                name="client_type"
                value={formData.client_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="individual">Cá nhân</option>
                <option value="business">Doanh nghiệp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nguồn
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập nguồn khách hàng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Link hợp đồng
            </label>
            <input
              type="url"
              name="contract_link"
              value={formData.contract_link}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập link hợp đồng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập ghi chú"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Client Overview Tab Component
const ClientOverviewTab = ({ totalContractValue, projectCount, client, documents, projects }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateVN = (dateString) => {
    const date = new Date(dateString);
    const vnDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return vnDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'KH check';
      case 'signed': return 'Đã ký';
      case 'shipped': return 'Đã Ship';
      case 'completed': return 'Hoàn thành';
      default: return 'KH check';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-700 mb-1">Giá trị hợp đồng</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(totalContractValue)}</p>
            <p className="text-sm text-green-600 mt-1">Tổng giá trị từ các dự án</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">Dự án</p>
            <p className="text-2xl font-bold text-blue-900">{projectCount}</p>
            <p className="text-sm text-blue-600 mt-1">Tổng số dự án</p>
          </div>
        </div>
      </div>

      {/* Recent Projects Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
            Dự án gần đây
          </h3>
          <span className="text-sm text-slate-500">{projects.length} dự án</span>
        </div>
        
        {projects.length > 0 ? (
          <div className="space-y-3">
            {projects.slice(0, 3).map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {project.name?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{project.name || 'Dự án không tên'}</p>
                    <p className="text-xs text-slate-500">{formatDateVN(project.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(project.contract_value || 0)}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status === 'active' ? 'Đang thực hiện' :
                     project.status === 'completed' ? 'Hoàn thành' : 'Tạm dừng'}
                  </span>
                </div>
              </div>
            ))}
            {projects.length > 3 && (
              <p className="text-center text-sm text-slate-500 py-2">
                và {projects.length - 3} dự án khác...
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm">Chưa có dự án nào</p>
          </div>
        )}
      </div>

      {/* Recent Documents Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 text-green-600 mr-2" />
            Hồ sơ gần đây
          </h3>
          <span className="text-sm text-slate-500">{documents.length} hồ sơ</span>
        </div>
        
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.slice(0, 3).map((document, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{document.name}</p>
                    <p className="text-xs text-slate-500">{formatDateVN(document.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                    {getStatusText(document.status)}
                  </span>
                  {document.link && (
                    <a
                      href={document.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {documents.length > 3 && (
              <p className="text-center text-sm text-slate-500 py-2">
                và {documents.length - 3} hồ sơ khác...
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm">Chưa có hồ sơ nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Client Projects Tab Component
const ClientProjectsTab = ({ projects, clientId }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Danh sách Dự án</h3>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Dự án
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tên Dự án
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{project.name}</div>
                    <div className="text-sm text-slate-500">{project.description}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {formatCurrency(project.contract_value || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status === 'active' ? 'Đang thực hiện' :
                       project.status === 'completed' ? 'Hoàn thành' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                    {formatDate(project.created_at)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium">Chưa có dự án nào</p>
          <p className="text-sm">Thêm dự án đầu tiên cho client này</p>
        </div>
      )}
    </div>
  );
};

// Client Documents Tab Component
const ClientDocumentsTab = ({ 
  documents, 
  onAddDocument, 
  onDeleteDocument, 
  showAddDocument, 
  setShowAddDocument,
  fetchDocuments 
}) => {
  const [editingDocument, setEditingDocument] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'KH check';
      case 'signed': return 'Đã ký';
      case 'shipped': return 'Đã Ship';
      case 'completed': return 'Hoàn thành';
      default: return 'KH check';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Hồ sơ</h3>
        <button
          onClick={() => setShowAddDocument(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Hồ sơ
        </button>
      </div>

      {documents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tên hồ sơ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Link hồ sơ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Thời gian tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {documents.map((document) => (
                <tr key={document.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{document.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {document.link ? (
                      <a
                        href={document.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Xem hồ sơ
                      </a>
                    ) : (
                      <span className="text-slate-400">Không có</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {getStatusText(document.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                    {formatDate(document.created_at)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingDocument(document)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDocument(document.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium">Chưa có hồ sơ nào</p>
          <p className="text-sm">Thêm hồ sơ đầu tiên cho client này</p>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocument && (
        <DocumentModal
          isOpen={showAddDocument}
          onClose={() => setShowAddDocument(false)}
          onSubmit={onAddDocument}
          title="Thêm Hồ sơ mới"
        />
      )}

      {/* Edit Document Modal */}
      {editingDocument && (
        <DocumentModal
          isOpen={!!editingDocument}
          onClose={() => setEditingDocument(null)}
          onSubmit={async (data) => {
            try {
              await axios.put(`${API}/clients/${editingDocument.client_id}/documents/${editingDocument.id}`, data);
              await fetchDocuments();
              setEditingDocument(null);
            } catch (error) {
              console.error('Failed to update document:', error);
            }
          }}
          document={editingDocument}
          title="Sửa Hồ sơ"
        />
      )}
    </div>
  );
};

// Document Modal Component
const DocumentModal = ({ isOpen, onClose, onSubmit, document = null, title }) => {
  const [formData, setFormData] = useState({
    name: document?.name || '',
    link: document?.link || '',
    status: document?.status || 'pending'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tên hồ sơ
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên hồ sơ (vd: Hợp đồng, BBNT, DNTT...)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Link hồ sơ
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập link hồ sơ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">KH check</option>
              <option value="signed">Đã ký</option>
              <option value="shipped">Đã Ship</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {document ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total_projects: 0,
    in_progress: 0,
    completed: 0,
    contract_value: 0,
    debt: 0
  });
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState('month');
  const [timeValue, setTimeValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [progressFilter, setProgressFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Dropdown data
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [progressOptions, setProgressOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  
  // Bulk selection
  const [selectedProjects, setSelectedProjects] = useState([]);
  
  // Form data
  const [createProjectData, setCreateProjectData] = useState({
    client_id: '',
    name: '',
    work_file_link: '',
    start_date: '',
    end_date: '',
    contract_value: 0,
    debt: 0,
    account_id: '',
    content_id: '',
    seeder_id: '',
    progress: 'in_progress',
    notes: ''
  });
  
  const [editProjectData, setEditProjectData] = useState({
    client_id: '',
    name: '',
    work_file_link: '',
    start_date: '',
    end_date: '',
    contract_value: 0,
    debt: 0,
    account_id: '',
    content_id: '',
    seeder_id: '',
    progress: 'in_progress',
    notes: ''
  });

  // Initialize default time value
  useEffect(() => {
    const now = new Date();
    if (timeFilter === 'month') {
      setTimeValue(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    } else if (timeFilter === 'year') {
      setTimeValue(now.getFullYear().toString());
    } else if (timeFilter === 'quarter') {
      const quarter = Math.ceil((now.getMonth() + 1) / 3);
      setTimeValue(`${now.getFullYear()}-Q${quarter}`);
    } else if (timeFilter === 'week') {
      const week = getWeekNumber(now);
      setTimeValue(`${now.getFullYear()}-W${String(week).padStart(2, '0')}`);
    }
  }, [timeFilter]);

  // Fetch data when filters change
  useEffect(() => {
    if (timeValue) {
      fetchProjects();
      fetchStatistics();
    }
  }, [timeFilter, timeValue, statusFilter, progressFilter, searchTerm]);

  useEffect(() => {
    fetchClients();
    fetchUsers();
    fetchProgressOptions();
    fetchStatusOptions();
  }, []);

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (timeFilter && timeValue) {
        params.append('time_filter', timeFilter);
        params.append('time_value', timeValue);
      }
      if (statusFilter) params.append('status', statusFilter);
      if (progressFilter) params.append('progress', progressFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(`${API}/projects?${params.toString()}`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (timeFilter && timeValue) {
        params.append('time_filter', timeFilter);
        params.append('time_value', timeValue);
      }
      
      const response = await axios.get(`${API}/projects/statistics?${params.toString()}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchProgressOptions = async () => {
    try {
      const response = await axios.get(`${API}/projects/progress-options`);
      setProgressOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch progress options:', error);
    }
  };

  const fetchStatusOptions = async () => {
    try {
      const response = await axios.get(`${API}/projects/status-options`);
      setStatusOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch status options:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/projects`, createProjectData);
      setShowCreateModal(false);
      setCreateProjectData({
        client_id: '', name: '', work_file_link: '', start_date: '', end_date: '',
        contract_value: 0, debt: 0, account_id: '', content_id: '', seeder_id: '',
        progress: 'in_progress', notes: ''
      });
      fetchProjects();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Lỗi tạo dự án: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/projects/${selectedProject.id}`, editProjectData);
      setShowEditModal(false);
      setSelectedProject(null);
      fetchProjects();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Lỗi cập nhật dự án: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Bạn có chắc chắn muốn lưu trữ dự án này?')) return;
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      fetchProjects();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Lỗi xóa dự án: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setEditProjectData({
      client_id: project.client_id || '',
      name: project.name || '',
      work_file_link: project.work_file_link || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      contract_value: project.contract_value || 0,
      debt: project.debt || 0,
      account_id: project.account_id || '',
      content_id: project.content_id || '',
      seeder_id: project.seeder_id || '',
      progress: project.progress || 'in_progress',
      notes: project.notes || ''
    });
    setShowEditModal(true);
  };

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VND';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getProgressBadge = (progress) => {
    const progressMap = {
      'in_progress': { label: 'Đang chạy', color: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      'accepted': { label: 'Nghiệm thu', color: 'bg-purple-100 text-purple-800' }
    };
    const progressInfo = progressMap[progress] || { label: progress, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${progressInfo.color}`}>
        {progressInfo.label}
      </span>
    );
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Chưa chọn';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? (user.full_name || user.username) : 'Chưa phân công';
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProjects(projects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId, checked) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    }
  };

  const generateTimeOptions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const options = [];

    if (timeFilter === 'week') {
      // Generate weeks for current year
      for (let week = 1; week <= 52; week++) {
        const weekStr = `${currentYear}-W${String(week).padStart(2, '0')}`;
        options.push({
          value: weekStr,
          label: `Tuần ${week}, ${currentYear}`
        });
      }
    } else if (timeFilter === 'month') {
      // Generate months for current year
      for (let month = 1; month <= 12; month++) {
        const monthStr = `${currentYear}-${String(month).padStart(2, '0')}`;
        options.push({
          value: monthStr,
          label: `Tháng ${month}, ${currentYear}`
        });
      }
    } else if (timeFilter === 'quarter') {
      // Generate quarters for current year
      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterStr = `${currentYear}-Q${quarter}`;
        const months = ['1-3', '4-6', '7-9', '10-12'][quarter - 1];
        options.push({
          value: quarterStr,
          label: `Quý ${quarter} (Tháng ${months}), ${currentYear}`
        });
      }
    } else if (timeFilter === 'year') {
      // Generate last 5 years and next 2 years
      for (let year = currentYear - 5; year <= currentYear + 2; year++) {
        options.push({
          value: year.toString(),
          label: `Năm ${year}`
        });
      }
    }

    return options;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý Dự án</h2>
          <p className="text-slate-600 mt-1">Theo dõi và quản lý các dự án đang triển khai</p>
        </div>
      </div>

      {/* Time Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Bộ lọc thời gian:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="quarter">Quý</option>
              <option value="year">Năm</option>
            </select>
            
            <select
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn {timeFilter === 'week' ? 'tuần' : timeFilter === 'month' ? 'tháng' : timeFilter === 'quarter' ? 'quý' : 'năm'}</option>
              {generateTimeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng dự án</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.total_projects}</p>
            </div>
            <FolderOpen className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Đang thực hiện</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.in_progress}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Hoàn thành</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.completed}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Giá trị hợp đồng</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(statistics.contract_value)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Công nợ</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(statistics.debt)}</p>
            </div>
            <Banknote className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Progress Filter */}
            <select
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả tiến độ</option>
              {progressOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm dự án
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProjects.length === projects.length && projects.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tên dự án
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    File làm việc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Giá trị HĐ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Công nợ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={(e) => handleSelectProject(project.id, e.target.checked)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {getClientName(project.client_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.work_file_link ? (
                        <a
                          href={project.work_file_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Link2 className="w-4 h-4 mr-1" />
                          Link
                        </a>
                      ) : (
                        <span className="text-slate-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div>{formatDate(project.start_date)} - {formatDate(project.end_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatCurrency(project.contract_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatCurrency(project.debt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="space-y-1">
                        <div><span className="text-slate-500">Account:</span> {getUserName(project.account_id)}</div>
                        <div><span className="text-slate-500">Content:</span> {getUserName(project.content_id)}</div>
                        <div><span className="text-slate-500">Seeder:</span> {getUserName(project.seeder_id)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getProgressBadge(project.progress)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailModal(project)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() => openEditModal(project)}
                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Archive className="w-4 h-4 mr-1" />
                        Lưu trữ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {projects.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy dự án</h3>
                <p className="text-slate-500">Không có dự án nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">Tạo dự án mới</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Client
                    </label>
                    <select
                      value={createProjectData.client_id}
                      onChange={(e) => setCreateProjectData({...createProjectData, client_id: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên dự án <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createProjectData.name}
                      onChange={(e) => setCreateProjectData({...createProjectData, name: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên dự án"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      File làm việc (Link)
                    </label>
                    <input
                      type="url"
                      value={createProjectData.work_file_link}
                      onChange={(e) => setCreateProjectData({...createProjectData, work_file_link: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/document"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={createProjectData.start_date}
                      onChange={(e) => setCreateProjectData({...createProjectData, start_date: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={createProjectData.end_date}
                      onChange={(e) => setCreateProjectData({...createProjectData, end_date: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Giá trị hợp đồng (VND)
                    </label>
                    <input
                      type="number"
                      value={createProjectData.contract_value}
                      onChange={(e) => setCreateProjectData({...createProjectData, contract_value: parseFloat(e.target.value) || 0})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Công nợ (VND)
                    </label>
                    <input
                      type="number"
                      value={createProjectData.debt}
                      onChange={(e) => setCreateProjectData({...createProjectData, debt: parseFloat(e.target.value) || 0})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Account
                    </label>
                    <select
                      value={createProjectData.account_id}
                      onChange={(e) => setCreateProjectData({...createProjectData, account_id: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn Account</option>
                      {users.filter(u => u.role === 'account' || u.role === 'admin').map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Content
                    </label>
                    <select
                      value={createProjectData.content_id}
                      onChange={(e) => setCreateProjectData({...createProjectData, content_id: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn Content</option>
                      {users.filter(u => u.role === 'content' || u.role === 'admin').map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Seeder
                    </label>
                    <select
                      value={createProjectData.seeder_id}
                      onChange={(e) => setCreateProjectData({...createProjectData, seeder_id: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn Seeder</option>
                      {users.filter(u => u.role === 'seeder' || u.role === 'admin').map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tiến độ
                    </label>
                    <select
                      value={createProjectData.progress}
                      onChange={(e) => setCreateProjectData({...createProjectData, progress: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {progressOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={createProjectData.notes}
                      onChange={(e) => setCreateProjectData({...createProjectData, notes: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Ghi chú về dự án..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tạo dự án
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal - Similar structure to Create Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">Chỉnh sửa dự án</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Client
                    </label>
                    <select
                      value={editProjectData.client_id}
                      onChange={(e) => setEditProjectData({...editProjectData, client_id: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên dự án
                    </label>
                    <input
                      type="text"
                      value={editProjectData.name}
                      onChange={(e) => setEditProjectData({...editProjectData, name: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên dự án"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      File làm việc (Link)
                    </label>
                    <input
                      type="url"
                      value={editProjectData.work_file_link}
                      onChange={(e) => setEditProjectData({...editProjectData, work_file_link: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/document"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={editProjectData.start_date}
                      onChange={(e) => setEditProjectData({...editProjectData, start_date: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={editProjectData.end_date}
                      onChange={(e) => setEditProjectData({...editProjectData, end_date: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Giá trị hợp đồng (VND)
                    </label>
                    <input
                      type="number"
                      value={editProjectData.contract_value}
                      onChange={(e) => setEditProjectData({...editProjectData, contract_value: parseFloat(e.target.value) || 0})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Công nợ (VND)
                    </label>
                    <input
                      type="number"
                      value={editProjectData.debt}
                      onChange={(e) => setEditProjectData({...editProjectData, debt: parseFloat(e.target.value) || 0})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Account
                    </label>
                    <select
                      value={editProjectData.account_id}
                      onChange={(e) => setEditProjectData({...editProjectData, account_id: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn Account</option>
                      {users.filter(u => u.role === 'account' || u.role === 'admin').map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Content
                    </label>
                    <select
                      value={editProjectData.content_id}
                      onChange={(e) => setEditProjectData({...editProjectData, content_id: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn Content</option>
                      {users.filter(u => u.role === 'content' || u.role === 'admin').map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Seeder
                    </label>
                    <select
                      value={editProjectData.seeder_id}
                      onChange={(e) => setEditProjectData({...editProjectData, seeder_id: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn Seeder</option>
                      {users.filter(u => u.role === 'seeder' || u.role === 'admin').map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tiến độ
                    </label>
                    <select
                      value={editProjectData.progress}
                      onChange={(e) => setEditProjectData({...editProjectData, progress: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {progressOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={editProjectData.notes}
                      onChange={(e) => setEditProjectData({...editProjectData, notes: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Ghi chú về dự án..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Project Modal */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">Chi tiết dự án</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4">Thông tin cơ bản</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-slate-500">Tên dự án:</span>
                        <p className="font-medium">{selectedProject.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Client:</span>
                        <p className="font-medium">{getClientName(selectedProject.client_id)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">File làm việc:</span>
                        {selectedProject.work_file_link ? (
                          <a
                            href={selectedProject.work_file_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Link2 className="w-4 h-4 mr-1" />
                            Mở file
                          </a>
                        ) : (
                          <p className="font-medium text-slate-400">Chưa có</p>
                        )}
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Tiến độ:</span>
                        <div className="mt-1">{getProgressBadge(selectedProject.progress)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 mb-4">Thông tin tài chính</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-slate-500">Thời gian:</span>
                        <p className="font-medium">
                          {formatDate(selectedProject.start_date)} - {formatDate(selectedProject.end_date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Giá trị hợp đồng:</span>
                        <p className="font-medium text-green-600">{formatCurrency(selectedProject.contract_value)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Công nợ:</span>
                        <p className="font-medium text-red-600">{formatCurrency(selectedProject.debt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-medium text-slate-900 mb-4">Phân công nhân sự</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-slate-500">Account:</span>
                        <p className="font-medium">{getUserName(selectedProject.account_id)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Content:</span>
                        <p className="font-medium">{getUserName(selectedProject.content_id)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Seeder:</span>
                        <p className="font-medium">{getUserName(selectedProject.seeder_id)}</p>
                      </div>
                    </div>
                  </div>

                  {selectedProject.notes && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-slate-900 mb-4">Ghi chú</h4>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{selectedProject.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedProject);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StaffPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bulk selection states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [createUserData, setCreateUserData] = useState({
    full_name: '',
    position: '',
    email: '',
    username: '',
    password: '',
    role: '',
    phone: '',
    target_monthly: 0
  });

  const [editUserData, setEditUserData] = useState({
    full_name: '',
    position: '',
    email: '',
    username: '',
    role: '',
    phone: '',
    target_monthly: 0,
    is_active: true
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
      setSelectedUsers([]); // Clear selection when refreshing
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const response = await axios.get(`${API}/users/roles/list`);
      setUserRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserRoles();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/users`, createUserData);
      setShowCreateModal(false);
      setCreateUserData({
        full_name: '', position: '', email: '', username: '', password: '', role: '', phone: '', target_monthly: 0
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Lỗi tạo tài khoản: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/users/${selectedUser.id}`, editUserData);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Lỗi cập nhật tài khoản: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await axios.delete(`${API}/users/${userToDelete.id}`);
      console.log('Delete response:', response.data);
      fetchUsers();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      alert('Xóa tài khoản thành công!');
    } catch (error) {
      console.error('Failed to delete user:', error);
      if (error.response?.status === 403) {
        alert('Lỗi: Bạn không có quyền xóa tài khoản này. Chỉ admin mới có thể xóa tài khoản.');
      } else if (error.response?.status === 400) {
        alert('Lỗi: ' + (error.response?.data?.detail || 'Không thể xóa tài khoản này'));
      } else {
        alert('Lỗi xóa tài khoản: ' + (error.response?.data?.detail || 'Unknown error'));
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      alert('Vui lòng chọn ít nhất một tài khoản để xóa.');
      return;
    }
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    setShowBulkDeleteConfirm(false);
    setBulkActionLoading(true);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      for (const userId of selectedUsers) {
        try {
          await axios.delete(`${API}/users/${userId}`);
          successCount++;
        } catch (error) {
          errorCount++;
          const user = users.find(u => u.id === userId);
          const username = user ? (user.full_name || user.username) : userId;
          if (error.response?.status === 403) {
            errors.push(`${username}: Không có quyền xóa`);
          } else if (error.response?.status === 400) {
            errors.push(`${username}: ${error.response?.data?.detail || 'Không thể xóa'}`);
          } else {
            errors.push(`${username}: Lỗi không xác định`);
          }
        }
      }

      // Show results
      let message = '';
      if (successCount > 0) {
        message += `✅ Đã xóa thành công ${successCount} tài khoản.`;
      }
      if (errorCount > 0) {
        message += `\n❌ Không thể xóa ${errorCount} tài khoản:\n${errors.join('\n')}`;
      }
      alert(message);

      // Refresh data
      fetchUsers();
      setSelectedUsers([]);

    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Có lỗi xảy ra trong quá trình xóa hàng loạt.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditUserData({
      full_name: user.full_name || '',
      position: user.position || '',
      email: user.email || '',
      username: user.username || '',
      role: user.role || '',
      phone: user.phone || '',
      target_monthly: user.target_monthly || 0,
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const getRoleLabel = (role) => {
    const roleObj = userRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Hoạt động
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Tạm dừng
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.position && user.position.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý Nhân sự</h2>
          <p className="text-slate-600 mt-1">Quản lý thông tin nhân viên và phân công công việc</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {selectedUsers.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 flex items-center transition-colors"
            >
              {bulkActionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa {selectedUsers.length} tài khoản
                </>
              )}
            </button>
          )}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center transition-all shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Tạo tài khoản mới
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, username, email, vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {selectedUsers.length > 0 && (
            <div className="text-sm text-slate-600">
              Đã chọn {selectedUsers.length} tài khoản
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tên nhân sự
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thông tin liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-slate-50 ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {user.full_name || 'Chưa cập nhật'}
                          </div>
                          <div className="text-sm text-slate-500">
                            @{user.username}
                          </div>
                          {user.position && (
                            <div className="text-xs text-slate-400">
                              {user.position}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {user.email && (
                          <div className="flex items-center mb-1">
                            <Mail className="w-4 h-4 text-slate-400 mr-2" />
                            {user.email}
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-slate-400 mr-2" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailModal(user)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy nhân sự</h3>
                <p className="text-slate-500">Không có nhân sự nào phù hợp với từ khóa tìm kiếm.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">Tạo tài khoản mới</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên nhân sự <span className="text-slate-400">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      value={createUserData.full_name}
                      onChange={(e) => setCreateUserData({...createUserData, full_name: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Vị trí <span className="text-slate-400">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      value={createUserData.position}
                      onChange={(e) => setCreateUserData({...createUserData, position: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sales Executive"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email <span className="text-slate-400">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="email"
                      value={createUserData.email}
                      onChange={(e) => setCreateUserData({...createUserData, email: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tài khoản đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createUserData.username}
                      onChange={(e) => setCreateUserData({...createUserData, username: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={createUserData.password}
                      onChange={(e) => setCreateUserData({...createUserData, password: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quyền hạn <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createUserData.role}
                      onChange={(e) => setCreateUserData({...createUserData, role: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Chọn quyền hạn</option>
                      {userRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={createUserData.phone}
                      onChange={(e) => setCreateUserData({...createUserData, phone: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0901234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mục tiêu doanh số tháng
                    </label>
                    <input
                      type="number"
                      value={createUserData.target_monthly}
                      onChange={(e) => setCreateUserData({...createUserData, target_monthly: parseFloat(e.target.value) || 0})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tạo tài khoản
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">Chỉnh sửa tài khoản</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên nhân sự
                    </label>
                    <input
                      type="text"
                      value={editUserData.full_name}
                      onChange={(e) => setEditUserData({...editUserData, full_name: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Vị trí
                    </label>
                    <input
                      type="text"
                      value={editUserData.position}
                      onChange={(e) => setEditUserData({...editUserData, position: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sales Executive"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editUserData.email}
                      onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tài khoản đăng nhập
                    </label>
                    <input
                      type="text"
                      value={editUserData.username}
                      onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quyền hạn
                    </label>
                    <select
                      value={editUserData.role}
                      onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn quyền hạn</option>
                      {userRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={editUserData.phone}
                      onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0901234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mục tiêu doanh số tháng
                    </label>
                    <input
                      type="number"
                      value={editUserData.target_monthly}
                      onChange={(e) => setEditUserData({...editUserData, target_monthly: parseFloat(e.target.value) || 0})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={editUserData.is_active}
                      onChange={(e) => setEditUserData({...editUserData, is_active: e.target.value === 'true'})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Tạm dừng</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail User Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">Chi tiết tài khoản</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium text-xl">
                      {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : selectedUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900">
                      {selectedUser.full_name || 'Chưa cập nhật tên'}
                    </h4>
                    <p className="text-slate-600">@{selectedUser.username}</p>
                    {selectedUser.position && (
                      <p className="text-sm text-slate-500">{selectedUser.position}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-slate-900 mb-3">Thông tin cơ bản</h5>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-slate-500">Email:</span>
                        <p className="font-medium">{selectedUser.email || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Số điện thoại:</span>
                        <p className="font-medium">{selectedUser.phone || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Vai trò:</span>
                        <p className="font-medium">{getRoleLabel(selectedUser.role)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-slate-900 mb-3">Thông tin công việc</h5>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-slate-500">Ngày tham gia:</span>
                        <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Mục tiêu doanh số:</span>
                        <p className="font-medium">
                          {selectedUser.target_monthly?.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Trạng thái:</span>
                        <div className="mt-1">
                          {getStatusBadge(selectedUser.is_active)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedUser);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internship Assignments Page - Giao việc cho thực tập sinh
const InternshipAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    intern_id: '',
    deadline: '',
    priority: 'normal',
    work_link: '',
    comment_count: 0,
    post_count: 0
  });

  useEffect(() => {
    fetchAssignments();
    fetchInterns();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with real API call
      const mockAssignments = [
        {
          id: 1,
          title: 'Tạo báo cáo khách hàng tháng 12',
          description: 'Tổng hợp và phân tích dữ liệu khách hàng trong tháng 12',
          intern_name: 'Nguyễn Văn A',
          intern_id: 'intern1',
          deadline: '2024-12-15',
          priority: 'high',
          status: 'in_progress',
          created_at: '2024-12-01',
          completion_percentage: 65,
          work_link: 'https://docs.google.com/spreadsheets/d/abc123',
          comment_count: 8,
          post_count: 3
        },
        {
          id: 2,
          title: 'Cập nhật database khách hàng',
          description: 'Làm sạch và cập nhật thông tin liên lạc khách hàng',
          intern_name: 'Trần Thị B',
          intern_id: 'intern2',
          deadline: '2024-12-20',
          priority: 'normal',
          status: 'pending',
          created_at: '2024-12-02',
          completion_percentage: 20,
          work_link: 'https://trello.com/b/xyz789',
          comment_count: 3,
          post_count: 1,
          work_link: 'https://trello.com/b/xyz789',
          comment_count: 3,
          post_count: 1
        },
        {
          id: 3,
          title: 'Nghiên cứu thị trường sản phẩm mới',
          description: 'Phân tích đối thủ cạnh tranh và xu hướng thị trường',
          intern_name: 'Lê Văn C',
          intern_id: 'intern3',
          deadline: '2024-12-25',
          priority: 'low',
          status: 'completed',
          created_at: '2024-12-03',
          completion_percentage: 100,
          work_link: 'https://notion.so/market-research-456',
          comment_count: 12,
          post_count: 5
        }
      ];
      setAssignments(mockAssignments);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterns = async () => {
    try {
      // Mock data for interns - replace with real API call
      const mockInterns = [
        { id: 'intern1', name: 'Nguyễn Văn A', email: 'a.nguyen@intern.com' },
        { id: 'intern2', name: 'Trần Thị B', email: 'b.tran@intern.com' },
        { id: 'intern3', name: 'Lê Văn C', email: 'c.le@intern.com' }
      ];
      setInterns(mockInterns);
    } catch (error) {
      console.error('Failed to fetch interns:', error);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      // Mock creation - replace with real API call
      const newId = Math.max(...assignments.map(a => a.id), 0) + 1;
      const intern = interns.find(i => i.id === newAssignment.intern_id);
      
      const assignment = {
        id: newId,
        ...newAssignment,
        intern_name: intern?.name || '',
        status: 'pending',
        created_at: new Date().toISOString(),
        completion_percentage: 0
      };

      setAssignments([assignment, ...assignments]);
      setNewAssignment({
        title: '',
        description: '',
        intern_id: '',
        deadline: '',
        priority: 'normal',
        work_link: '',
        comment_count: 0,
        post_count: 0
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.intern_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Giao việc thực tập sinh</h1>
          <p className="text-slate-600 mt-1">Quản lý và theo dõi công việc được giao cho thực tập sinh</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Giao việc mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">Tổng số việc</p>
              <p className="text-2xl font-semibold text-slate-900">{assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">Đang thực hiện</p>
              <p className="text-2xl font-semibold text-slate-900">
                {assignments.filter(a => a.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">Hoàn thành</p>
              <p className="text-2xl font-semibold text-slate-900">
                {assignments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">Quá hạn</p>
              <p className="text-2xl font-semibold text-slate-900">
                {assignments.filter(a => a.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc hoặc thực tập sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-72">
                  Công việc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Thực tập sinh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ưu tiên
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  File làm việc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tiến độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div 
                        className="text-sm font-medium text-slate-900 cursor-pointer hover:text-cyan-600 transition-colors"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowDetailModal(true);
                        }}
                      >
                        {assignment.title}
                      </div>
                      <div className="text-sm text-slate-500 truncate max-w-xs">{assignment.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {assignment.intern_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(assignment.deadline).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority === 'high' ? 'Cao' : assignment.priority === 'normal' ? 'Bình thường' : 'Thấp'}
                    </span>
                  </td>
