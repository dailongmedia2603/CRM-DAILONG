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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {client.comment_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {client.post_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.work_file_link ? (
                        <a 
                          href={client.work_file_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-cyan-600 hover:text-cyan-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Link File
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">Chưa có</span>
                      )}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Trạng thái
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status === 'completed' ? 'Hoàn thành' : 
                       assignment.status === 'in_progress' ? 'Đang làm' :
                       assignment.status === 'pending' ? 'Chờ xử lý' : 'Quá hạn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status === 'completed' ? 'Hoàn thành' : 
                       assignment.status === 'in_progress' ? 'Đang làm' :
                       assignment.status === 'pending' ? 'Chờ xử lý' : 'Quá hạn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {assignment.comment_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {assignment.post_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assignment.work_link ? (
                      <a 
                        href={assignment.work_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-cyan-600 hover:text-cyan-800 text-sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Link File
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="text-cyan-600 hover:text-cyan-900 mr-3"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600">
                      <Edit className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Giao việc mới</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Nhập tiêu đề công việc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                  <textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Mô tả chi tiết công việc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link làm việc</label>
                  <input
                    type="url"
                    value={newAssignment.work_link}
                    onChange={(e) => setNewAssignment({...newAssignment, work_link: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="https://docs.google.com/... hoặc https://trello.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thực tập sinh</label>
                  <select
                    value={newAssignment.intern_id}
                    onChange={(e) => setNewAssignment({...newAssignment, intern_id: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="">Chọn thực tập sinh...</option>
                    {interns.map((intern) => (
                      <option key={intern.id} value={intern.id}>{intern.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={newAssignment.deadline}
                    onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ưu tiên</label>
                  <select
                    value={newAssignment.priority}
                    onChange={(e) => setNewAssignment({...newAssignment, priority: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="low">Thấp</option>
                    <option value="normal">Bình thường</option>
                    <option value="high">Cao</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng Comment</label>
                    <input
                      type="number"
                      min="0"
                      value={newAssignment.comment_count}
                      onChange={(e) => setNewAssignment({...newAssignment, comment_count: parseInt(e.target.value) || 0})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng Post</label>
                    <input
                      type="number"
                      min="0"
                      value={newAssignment.post_count}
                      onChange={(e) => setNewAssignment({...newAssignment, post_count: parseInt(e.target.value) || 0})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateAssignment}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  Tạo công việc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internship Performance Page - Hiệu suất thực tập sinh
const InternshipPerformance = () => {
  const { user } = useAuth();
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInternPerformance();
  }, [selectedPeriod]);

  const fetchInternPerformance = async () => {
    try {
      setLoading(true);
      // Mock data for intern performance - replace with real API call
      const mockPerformance = [
        {
          id: 'intern1',
          name: 'Nguyễn Văn A',
          email: 'a.nguyen@intern.com',
          avatar: null,
          department: 'Marketing',
          supervisor: 'Trần Thanh Hòa',
          start_date: '2024-11-01',
          tasks_completed: 12,
          tasks_in_progress: 3,
          tasks_overdue: 1,
          completion_rate: 85,
          quality_score: 8.5,
          attendance_rate: 95,
          feedback_count: 5,
          average_rating: 4.2
        },
        {
          id: 'intern2',
          name: 'Trần Thị B',
          email: 'b.tran@intern.com',
          avatar: null,
          department: 'Sales',
          supervisor: 'Lê Minh Tuấn',
          start_date: '2024-10-15',
          tasks_completed: 18,
          tasks_in_progress: 2,
          tasks_overdue: 0,
          completion_rate: 92,
          quality_score: 9.0,
          attendance_rate: 98,
          feedback_count: 8,
          average_rating: 4.6
        },
        {
          id: 'intern3',
          name: 'Lê Văn C',
          email: 'c.le@intern.com',
          avatar: null,
          department: 'IT',
          supervisor: 'Phạm Văn D',
          start_date: '2024-12-01',
          tasks_completed: 5,
          tasks_in_progress: 4,
          tasks_overdue: 2,
          completion_rate: 65,
          quality_score: 7.0,
          attendance_rate: 88,
          feedback_count: 2,
          average_rating: 3.5
        }
      ];
      setInterns(mockPerformance);
    } catch (error) {
      console.error('Failed to fetch intern performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 75) return 'Tốt';
    if (score >= 60) return 'Khá';
    return 'Cần cải thiện';
  };

  const filteredInterns = interns.filter(intern =>
    intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageCompletionRate = interns.reduce((sum, intern) => sum + intern.completion_rate, 0) / interns.length || 0;
  const averageQualityScore = interns.reduce((sum, intern) => sum + intern.quality_score, 0) / interns.length || 0;
  const totalTasksCompleted = interns.reduce((sum, intern) => sum + intern.tasks_completed, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hiệu suất thực tập sinh</h1>
          <p className="text-slate-600 mt-1">Theo dõi và đánh giá hiệu suất làm việc của thực tập sinh</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">Tổng thực tập sinh</p>
              <p className="text-2xl font-semibold text-slate-900">{interns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">Tỷ lệ hoàn thành TB</p>
              <p className="text-2xl font-semibold text-slate-900">{averageCompletionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100">
              <Star className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">Điểm chất lượng TB</p>
              <p className="text-2xl font-semibold text-slate-900">{averageQualityScore.toFixed(1)}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">Công việc hoàn thành</p>
              <p className="text-2xl font-semibold text-slate-900">{totalTasksCompleted}</p>
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
            placeholder="Tìm kiếm thực tập sinh hoặc phòng ban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInterns.map((intern) => (
          <div key={intern.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {intern.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-900">{intern.name}</h3>
                  <p className="text-sm text-slate-600">{intern.department} • {intern.supervisor}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceBadge(intern.completion_rate)}`}>
                {getPerformanceLabel(intern.completion_rate)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-semibold text-slate-900">{intern.tasks_completed}</p>
                <p className="text-sm text-slate-600">Hoàn thành</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-semibold text-slate-900">{intern.tasks_in_progress}</p>
                <p className="text-sm text-slate-600">Đang làm</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Tỷ lệ hoàn thành</span>
                <span className={`text-sm font-medium ${getPerformanceColor(intern.completion_rate)}`}>
                  {intern.completion_rate}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${intern.completion_rate}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Điểm chất lượng</span>
                <span className={`text-sm font-medium ${getPerformanceColor(intern.quality_score * 10)}`}>
                  {intern.quality_score}/10
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${intern.quality_score * 10}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Tỷ lệ chuyên cần</span>
                <span className={`text-sm font-medium ${getPerformanceColor(intern.attendance_rate)}`}>
                  {intern.attendance_rate}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${intern.attendance_rate}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span>⭐ {intern.average_rating}/5</span>
                <span>💬 {intern.feedback_count} feedback</span>
              </div>
              <button className="text-teal-600 hover:text-teal-800 text-sm font-medium">
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [filterStatus, setFilterStatus] = useState('active'); // 'active' or 'completed'
  const [taskStatusFilter, setTaskStatusFilter] = useState(''); // 'todo', 'in_progress', 'completed'
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deadlineFilter, setDeadlineFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // 'today', 'yesterday', 'last_7_days', 'custom'
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [statistics, setStatistics] = useState({
    urgent: 0,
    todo: 0,
    inProgress: 0,
    dueToday: 0,
    overdue: 0
  });
  const [taskCommentCounts, setTaskCommentCounts] = useState({});

  useEffect(() => {
    fetchTasks();
    fetchStatistics();
    fetchCommentCounts();
    fetchUsers();
  }, [filterStatus, priorityFilter, deadlineFilter]);

  useEffect(() => {
    // Check if there are active filters
    const hasFilters = priorityFilter || deadlineFilter || filterStatus === 'completed' || dateFilter;
    setHasActiveFilters(hasFilters);
  }, [priorityFilter, deadlineFilter, filterStatus, dateFilter]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (deadlineFilter) params.append('deadline_filter', deadlineFilter);
      if (dateFilter) {
        params.append('date_filter', dateFilter);
        if (dateFilter === 'custom' && customDateFrom && customDateTo) {
          params.append('date_from', customDateFrom);
          params.append('date_to', customDateTo);
        }
      }
      
      const response = await axios.get(`${API}/tasks?${params.toString()}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFilter) {
        params.append('date_filter', dateFilter);
        if (dateFilter === 'custom' && customDateFrom && customDateTo) {
          params.append('date_from', customDateFrom);
          params.append('date_to', customDateTo);
        }
      }
      
      const response = await axios.get(`${API}/tasks/statistics?${params.toString()}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchCommentCounts = async () => {
    try {
      const response = await axios.get(`${API}/tasks/comment-counts`);
      setTaskCommentCounts(response.data);
    } catch (error) {
      console.error('Failed to fetch comment counts:', error);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId, checked) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedTasks.length} công việc?`)) return;
    
    try {
      await axios.post(`${API}/tasks/bulk-delete`, {
        task_ids: selectedTasks
      });
      
      await fetchTasks();
      await fetchStatistics();
      setSelectedTasks([]);
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;
    
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      await fetchTasks();
      await fetchStatistics();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await axios.post(`${API}/tasks`, taskData);
      await fetchTasks();
      await fetchStatistics();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await axios.put(`${API}/tasks/${selectedTask.id}`, taskData);
      await fetchTasks();
      await fetchStatistics();
      setShowEditModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, { status: newStatus });
      await fetchTasks();
      await fetchStatistics();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleUpdateTaskExecution = async (taskId, status) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, { 
        status: status  // Direct status update
      });
      await fetchTasks();
      await fetchStatistics();
    } catch (error) {
      console.error('Failed to update task execution:', error);
    }
  };

  const handleWidgetFilter = (filterType) => {
    // Clear other filters when clicking widgets
    setDeadlineFilter('');
    setPriorityFilter('');
    setTaskStatusFilter('');
    setFilterStatus('active');
    
    switch (filterType) {
      case 'urgent':
        setPriorityFilter('urgent');
        break;
      case 'todo':
        setTaskStatusFilter('todo');
        break;
      case 'in_progress':
        setTaskStatusFilter('in_progress');
        break;
      case 'due_today':
        setDeadlineFilter('today');
        break;
      case 'overdue':
        setDeadlineFilter('overdue');
        break;
    }
  };

  const handleClearFilters = () => {
    setPriorityFilter('');
    setDeadlineFilter('');
    setTaskStatusFilter('');
    setFilterStatus('active');
    setDateFilter('');
    setCustomDateFrom('');
    setCustomDateTo('');
    setShowCustomDatePicker(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'active' ? task.status !== 'completed' : task.status === 'completed';
    
    const matchesTaskStatus = !taskStatusFilter || task.status === taskStatusFilter;
    
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    
    const matchesDeadline = !deadlineFilter || (() => {
      if (deadlineFilter === 'today') {
        const today = new Date();
        const taskDeadline = new Date(task.deadline);
        return taskDeadline.toDateString() === today.toDateString();
      }
      if (deadlineFilter === 'overdue') {
        const now = new Date();
        const taskDeadline = new Date(task.deadline);
        return taskDeadline < now && task.status !== 'completed';
      }
      return true;
    })();
    
    return matchesSearch && matchesStatus && matchesTaskStatus && matchesPriority && matchesDeadline;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const vnDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return vnDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'in_progress': return 'Đang làm';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
          <h2 className="text-2xl font-bold text-slate-900">Quản lý Công việc</h2>
          <p className="text-slate-600 mt-1">Quản lý các công việc nội bộ giữa các bộ phận</p>
        </div>
      </div>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => handleWidgetFilter('urgent')}
          className="bg-red-50 rounded-xl p-4 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">CLICK TO FILTER</span>
          </div>
          <div>
            <p className="text-sm font-medium text-red-700 mb-1">Gấp</p>
            <p className="text-2xl font-bold text-red-900">{statistics.urgent}</p>
            <p className="text-xs text-red-600 mt-1">Ưu tiên cao</p>
          </div>
        </div>

        <div 
          onClick={() => handleWidgetFilter('todo')}
          className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs text-yellow-600 font-medium">CLICK TO FILTER</span>
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-700 mb-1">Chưa làm</p>
            <p className="text-2xl font-bold text-yellow-900">{statistics.todo}</p>
            <p className="text-xs text-yellow-600 mt-1">Chờ xử lý</p>
          </div>
        </div>

        <div 
          onClick={() => handleWidgetFilter('in_progress')}
          className="bg-blue-50 rounded-xl p-4 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">CLICK TO FILTER</span>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">Đang làm</p>
            <p className="text-2xl font-bold text-blue-900">{statistics.inProgress}</p>
            <p className="text-xs text-blue-600 mt-1">Đang thực hiện</p>
          </div>
        </div>

        <div 
          onClick={() => handleWidgetFilter('due_today')}
          className="bg-orange-50 rounded-xl p-4 border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs text-orange-600 font-medium">CLICK TO FILTER</span>
          </div>
          <div>
            <p className="text-sm font-medium text-orange-700 mb-1">Đến deadline</p>
            <p className="text-2xl font-bold text-orange-900">{statistics.dueToday}</p>
            <p className="text-xs text-orange-600 mt-1">Hôm nay</p>
          </div>
        </div>

        <div 
          onClick={() => handleWidgetFilter('overdue')}
          className="bg-purple-50 rounded-xl p-4 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-medium">CLICK TO FILTER</span>
          </div>
          <div>
            <p className="text-sm font-medium text-purple-700 mb-1">Trễ deadline</p>
            <p className="text-2xl font-bold text-purple-900">{statistics.overdue}</p>
            <p className="text-xs text-purple-600 mt-1">Quá hạn</p>
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
                placeholder="Tìm kiếm công việc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
              className="flex items-center px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {viewMode === 'list' ? (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Kanban
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4 mr-2" />
                  List
                </>
              )}
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Xóa bộ lọc
              </button>
            )}

            {/* Bulk Delete */}
            {selectedTasks.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa ({selectedTasks.length})
              </button>
            )}

            {/* Completed Tasks */}
            <button
              onClick={() => setFilterStatus(filterStatus === 'completed' ? 'active' : 'completed')}
              className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                filterStatus === 'completed'
                  ? 'border-green-300 bg-green-50 text-green-600'
                  : 'border-slate-300 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {filterStatus === 'completed' ? 'Xem tất cả' : 'Đã hoàn thành'}
            </button>
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm công việc
          </button>
        </div>
      </div>

      {/* Tasks Display */}
      {viewMode === 'list' ? (
        <TasksListView
          tasks={filteredTasks}
          selectedTasks={selectedTasks}
          taskCommentCounts={taskCommentCounts}
          onSelectAll={handleSelectAll}
          onSelectTask={handleSelectTask}
          onUpdateStatus={handleUpdateTaskStatus}
          onUpdateExecution={handleUpdateTaskExecution}
          onEdit={(task) => {
            setSelectedTask(task);
            setShowEditModal(true);
          }}
          onDelete={handleDeleteTask}
          onViewDetail={(task) => {
            setSelectedTask(task);
            setShowDetailModal(true);
          }}
          onOpenFeedback={(task) => {
            setSelectedTask(task);
            setShowFeedbackModal(true);
          }}
          formatDate={formatDateTime}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          truncateText={truncateText}
        />
      ) : (
        <TasksKanbanView
          tasks={filteredTasks}
          onUpdateStatus={handleUpdateTaskStatus}
          onEdit={(task) => {
            setSelectedTask(task);
            setShowEditModal(true);
          }}
          onDelete={handleDeleteTask}
          onViewDetail={(task) => {
            setSelectedTask(task);
            setShowDetailModal(true);
          }}
          formatDate={formatDateTime}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          truncateText={truncateText}
        />
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <TaskModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTask}
          title="Thêm Công việc mới"
          users={users}
        />
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <TaskModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleEditTask}
          task={selectedTask}
          title="Sửa Công việc"
          users={users}
        />
      )}

      {/* Detail Task Modal */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          formatDate={formatDateTime}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          users={users}
        />
      )}

      {/* Feedback/Chat Modal */}
      {showFeedbackModal && selectedTask && (
        <TaskFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          currentUser={user}
        />
      )}
    </div>
  );
};

// Tasks List View Component
const TasksListView = ({
  tasks, selectedTasks, taskCommentCounts, onSelectAll, onSelectTask, onUpdateStatus, onUpdateExecution,
  onEdit, onDelete, onViewDetail, onOpenFeedback, formatDate, getPriorityColor, getStatusColor, getStatusText, truncateText
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === tasks.length && tasks.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tên công việc
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nội dung chi tiết
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Ưu tiên
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                POST
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                COMMENT
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                FILE LÀM VIỆC
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                TIẾN ĐỘ
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={(e) => onSelectTask(task.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{task.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 max-w-xs">
                      {truncateText(task.description)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'urgent' ? 'Gấp' : 'Bình thường'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {task.deadline ? formatDate(task.deadline) : 'Không có'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {task.post_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {task.comment_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.work_file_link ? (
                      <a 
                        href={task.work_file_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        Link File
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">Chưa có file</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateExecution(task.id, e.target.value)}
                      className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="in_progress">Đang làm</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewDetail(task)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(task)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
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
                <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                  <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">Không có công việc nào</p>
                  <p className="text-sm">Hãy thêm công việc đầu tiên của bạn</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Tasks Kanban View Component
const TasksKanbanView = ({
  tasks, onUpdateStatus, onEdit, onDelete, onViewDetail, 
  formatDate, getPriorityColor, getStatusColor, getStatusText, truncateText
}) => {
  const columns = [
    { id: 'todo', title: 'Chưa làm', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'in_progress', title: 'Đang làm', color: 'bg-blue-50 border-blue-200' },
    { id: 'completed', title: 'Hoàn thành', color: 'bg-green-50 border-green-200' }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.id} className={`rounded-xl border-2 ${column.color} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">{column.title}</h3>
            <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-slate-600">
              {getTasksByStatus(column.id).length}
            </span>
          </div>
          
          <div className="space-y-3">
            {getTasksByStatus(column.id).map((task) => (
              <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-slate-900">{task.title}</h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'urgent' ? 'Gấp' : 'Bình thường'}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-sm text-slate-600 mb-3">{truncateText(task.description, 80)}</p>
                )}
                
                {task.deadline && (
                  <div className="flex items-center text-xs text-slate-500 mb-3">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(task.deadline)}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetail(task)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1 text-yellow-600 hover:bg-yellow-100 rounded transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                    className="text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="todo">Chưa làm</option>
                    <option value="in_progress">Đang làm</option>
                    <option value="completed">Hoàn thành</option>
                  </select>
                </div>
              </div>
            ))}
            
            {getTasksByStatus(column.id).length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Không có công việc</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Task Modal Component for Add/Edit
const TaskModal = ({ isOpen, onClose, onSubmit, task = null, title, users = [] }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'normal',
    deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
    assigned_to: task?.assigned_to || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting task:', error);
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tên công việc *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên công việc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nội dung chi tiết
            </label>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-300 p-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.querySelector('[name="description"]');
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = textarea.value;
                    const selectedText = text.substring(start, end);
                    if (selectedText) {
                      const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                      setFormData(prev => ({ ...prev, description: newText }));
                    }
                  }}
                  className="px-2 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.querySelector('[name="description"]');
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = textarea.value;
                    const selectedText = text.substring(start, end);
                    if (selectedText) {
                      const newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                      setFormData(prev => ({ ...prev, description: newText }));
                    }
                  }}
                  className="px-2 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.querySelector('[name="description"]');
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = textarea.value;
                    const selectedText = text.substring(start, end);
                    if (selectedText) {
                      const newText = text.substring(0, start) + `__${selectedText}__` + text.substring(end);
                      setFormData(prev => ({ ...prev, description: newText }));
                    }
                  }}
                  className="px-2 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Mô tả chi tiết công việc"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sử dụng **text** cho in đậm, *text* cho in nghiêng, __text__ cho gạch chân
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ưu tiên
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="normal">Bình thường</option>
                <option value="urgent">Gấp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Deadline (Ngày và giờ)
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Giao cho
            </label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn người thực hiện</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
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
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {task ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Feedback/Chat Modal Component
const TaskFeedbackModal = ({ isOpen, onClose, task, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      fetchComments();
    }
  }, [isOpen, task]);

  const fetchComments = async () => {
    try {
      setFetchingComments(true);
      const response = await axios.get(`${API}/tasks/${task.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setFetchingComments(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/tasks/${task.id}/comments`, {
        message: newMessage
      });
      
      setComments(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (commentId) => {
    try {
      await axios.delete(`${API}/tasks/${task.id}/comments/${commentId}`);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Feedback: {task.title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Cuộc trò chuyện giữa người giao và người nhận
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {fetchingComments ? (
            <div className="text-center text-slate-500 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm">Đang tải tin nhắn...</p>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`flex ${comment.user_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  comment.user_id === currentUser.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${
                      comment.user_id === currentUser.id ? 'text-blue-100' : 'text-slate-600'
                    }`}>
                      {comment.user_name}
                    </span>
                    {comment.user_id === currentUser.id && (
                      <button
                        onClick={() => deleteMessage(comment.id)}
                        className="text-blue-200 hover:text-white ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm">{comment.message}</p>
                  <p className={`text-xs mt-1 ${
                    comment.user_id === currentUser.id ? 'text-blue-200' : 'text-slate-500'
                  }`}>
                    {formatTime(comment.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500 py-8">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
              <p className="text-sm">Hãy bắt đầu cuộc trò chuyện về công việc này</p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-slate-200">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Task Detail Modal Component
const TaskDetailModal = ({ isOpen, onClose, task, formatDate, getPriorityColor, getStatusColor, getStatusText, users = [] }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Chi tiết Công việc</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-slate-900 mb-2">{task.title}</h4>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'urgent' ? 'Gấp' : 'Bình thường'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Deadline</label>
                <p className="text-sm text-slate-900">
                  {task.deadline ? formatDate(task.deadline) : 'Không có deadline'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Người thực hiện</label>
                <p className="text-sm text-slate-900">
                  {task.assigned_to ? 
                    users.find(u => u.id === task.assigned_to)?.full_name || task.assigned_to 
                    : 'Chưa phân công'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Ngày tạo</label>
                <p className="text-sm text-slate-900">{formatDate(task.created_at)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Trạng thái</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Ưu tiên</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'urgent' ? 'Gấp' : 'Bình thường'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Nội dung chi tiết</label>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
          )}

          {/* Feedback */}
          {task.feedback && (
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Feedback</label>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.feedback}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Component - Detailed Reports and Analytics
const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/analytics?range=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const customerStatusData = Object.entries(analytics?.customers_by_status || {}).map(([status, count]) => {
    const statusMap = {
      'lead': 'Khách tiềm năng',
      'prospect': 'Triển vọng', 
      'active': 'Đang hoạt động',
      'inactive': 'Không hoạt động',
      'closed': 'Đã đóng'
    };
    return {
      name: statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: status === 'active' ? '#10B981' : status === 'lead' ? '#3B82F6' : status === 'prospect' ? '#F59E0B' : '#EF4444'
    };
  });

  const monthlyRevenueData = Object.entries(analytics?.monthly_revenue || {}).map(([month, revenue]) => ({
    month: month.split('-')[1],
    revenue,
    target: revenue * 1.2
  }));

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Báo cáo & Phân tích</h2>
          <p className="text-slate-600 mt-1">Chi tiết hiệu suất bán hàng và khách hàng</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">12 tháng qua</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Tổng khách hàng</p>
            <p className="text-2xl font-bold text-slate-900">{analytics?.total_customers || 0}</p>
            <p className="text-sm text-green-600 mt-1">+12% so với kỳ trước</p>
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
            <p className="text-sm font-medium text-slate-600 mb-1">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-slate-900">{(analytics?.total_revenue || 0).toLocaleString()} VNĐ</p>
            <p className="text-sm text-green-600 mt-1">+23% so với kỳ trước</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Doanh thu tiềm năng</p>
            <p className="text-2xl font-bold text-slate-900">{(analytics?.potential_revenue || 0).toLocaleString()} VNĐ</p>
            <p className="text-sm text-green-600 mt-1">+8% so với kỳ trước</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-100">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Tổng tương tác</p>
            <p className="text-2xl font-bold text-slate-900">{analytics?.total_interactions || 0}</p>
            <p className="text-sm text-green-600 mt-1">+15% so với kỳ trước</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Xu hướng doanh thu</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          {monthlyRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} VNĐ`, 'Doanh thu']}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Chưa có dữ liệu doanh thu</p>
              </div>
            </div>
          )}
        </div>

        {/* Customer Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Phân bổ khách hàng</h3>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>
          {customerStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Chưa có dữ liệu khách hàng</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Tables */}
      {user?.role !== 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Hiệu suất nhân viên</h3>
            <div className="space-y-4">
              {analytics?.sales_performance?.map((person, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">
                        {person.sales_person.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{person.sales_person}</p>
                      <p className="text-sm text-slate-500">{person.customer_count} khách hàng</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{person.total_revenue.toLocaleString()} VNĐ</p>
                    <p className="text-sm text-slate-500">
                      {Math.round((person.total_revenue / person.target) * 100)}% mục tiêu
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>Chưa có dữ liệu hiệu suất</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Khách hàng hàng đầu</h3>
            <div className="space-y-4">
              {analytics?.top_customers?.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">
                        {customer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                      <p className="text-sm text-slate-500">{customer.company || 'Cá nhân'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{customer.potential_value.toLocaleString()} VNĐ</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                      customer.status === 'lead' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status === 'active' ? 'Hoạt động' : 
                       customer.status === 'lead' ? 'Tiềm năng' : 'Triển vọng'}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>Chưa có dữ liệu khách hàng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Account Management Component - Quản lý Tài khoản
const AccountManagement = () => {
  const { user, token, setUser, setToken } = useAuth();
  const [loading, setLoading] = useState(false);

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

// Login Component - Professional Design
const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'sales',
    phone: '',
    target_monthly: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = isLogin 
        ? await login(formData.email, formData.password)
        : await register(formData);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Chào mừng đến CRM</h1>
          <p className="text-slate-600">Nền tảng Quản lý Bán hàng Chuyên nghiệp</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                isLogin 
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                !isLogin 
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nhập địa chỉ email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vai trò</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="sales">Nhân viên Bán hàng</option>
                      <option value="manager">Quản lý Bán hàng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  {formData.role === 'sales' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Mục tiêu hàng tháng (VNĐ)</label>
                      <input
                        type="number"
                        name="target_monthly"
                        value={formData.target_monthly}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="100000000"
                      />
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Vui lòng đợi...
                  </div>
                ) : (
                  isLogin ? 'Đăng nhập' : 'Tạo tài khoản'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Nền tảng CRM Chuyên nghiệp • Bảo mật & Tin cậy
        </div>
      </div>
    </div>
  );
};

// Dashboard Layout Component - Modern Design
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [internshipDropdownOpen, setInternshipDropdownOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/dashboard', color: 'text-blue-600' },
    { icon: Building2, label: 'Client', path: '/clients', color: 'text-blue-500' },
    { 
      icon: FileText, 
      label: 'Dự án', 
      path: '/projects',
      color: 'text-purple-600'
    },
    { 
      icon: Building2, 
      label: 'Bán hàng', 
      color: 'text-green-600',
      hasSubmenu: true,
      submenu: [
        { icon: Users, label: 'Lead', path: '/customers', color: 'text-green-600' },
        ...(user?.role !== 'sales' ? [
          { icon: TrendingUp, label: 'Hiệu suất', path: '/sales', color: 'text-orange-600' }
        ] : [])
      ]
    },
    { 
      icon: GraduationCap, 
      label: 'Thực tập sinh', 
      color: 'text-cyan-600',
      hasSubmenu: true,
      submenu: [
        { icon: ClipboardList, label: 'Giao việc', path: '/internship/assignments', color: 'text-cyan-600' },
        { icon: BarChart3, label: 'Hiệu suất', path: '/internship/performance', color: 'text-teal-600' }
      ]
    },
    { icon: CheckCircle, label: 'Công việc', path: '/tasks', color: 'text-indigo-600' },
    { icon: BarChart3, label: 'Báo cáo', path: '/analytics', color: 'text-purple-600' },
    { icon: Users, label: 'Nhân sự', path: '/staff', color: 'text-blue-600' },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    // Check main menu items first
    for (const item of menuItems) {
      if (item.path === currentPath) {
        return item.label;
      }
      // Check submenu items
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (subItem.path === currentPath) {
            return subItem.label;
          }
        }
      }
    }
    return 'Trang chủ';
  };

  const isActiveMenu = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.submenu) {
      return item.submenu.some(subItem => location.pathname === subItem.path);
    }
    return false;
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg border-r border-slate-200 transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-slate-900">CRM Pro</h1>
                  <p className="text-xs text-slate-500">Quản lý Bán hàng</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-slate-400" /> : <Menu className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = isActiveMenu(item);
            
            // Menu item with submenu (dropdown)
            if (item.hasSubmenu) {
              const isProjectMenu = item.label === 'Dự án';
              const isSalesMenu = item.label === 'Bán hàng';
              const isInternshipMenu = item.label === 'Thực tập sinh';
              const currentDropdownOpen = isProjectMenu ? projectDropdownOpen : 
                                        isSalesMenu ? salesDropdownOpen :
                                        isInternshipMenu ? internshipDropdownOpen : false;
              const toggleDropdown = () => {
                if (isProjectMenu) {
                  setProjectDropdownOpen(!projectDropdownOpen);
                } else if (isSalesMenu) {
                  setSalesDropdownOpen(!salesDropdownOpen);
                } else if (isInternshipMenu) {
                  setInternshipDropdownOpen(!internshipDropdownOpen);
                }
              };
              
              return (
                <div key={index} className="relative">
                  <button
                    onClick={toggleDropdown}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all group ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : item.color} group-hover:scale-110 transition-transform`} />
                    {sidebarOpen && (
                      <>
                        <span className="ml-3 font-medium flex-1 text-left">{item.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${currentDropdownOpen ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  {sidebarOpen && currentDropdownOpen && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.submenu.map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <button
                            key={subIndex}
                            onClick={() => navigate(subItem.path)}
                            className={`w-full flex items-center px-4 py-2 rounded-lg transition-all group ${
                              isSubActive 
                                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <subItem.icon className={`w-4 h-4 ${isSubActive ? 'text-blue-600' : subItem.color} group-hover:scale-110 transition-transform`} />
                            <span className="ml-3 font-medium text-sm">{subItem.label}</span>
                            {isSubActive && (
                              <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            // Regular menu item (no submenu)
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : item.color} group-hover:scale-110 transition-transform`} />
                {sidebarOpen && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
                {sidebarOpen && isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={logout}
              className="mt-3 w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-2 text-sm">Đăng xuất</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{getPageTitle()}</h1>
              <p className="text-sm text-slate-500 mt-1">Chào mừng trở lại, {user?.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Settings className="w-6 h-6" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cài đặt tài khoản</a>
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Tùy chọn</a>
                    <hr className="my-1" />
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

// Dashboard Overview Component - Professional Cards & Charts
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API}/dashboard/analytics`);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng khách hàng',
      value: analytics?.total_customers || 0,
      icon: Users,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Tổng doanh thu',
      value: `${(analytics?.total_revenue || 0).toLocaleString()} VNĐ`,
      icon: DollarSign,
      color: 'green',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Doanh thu tiềm năng',
      value: `${(analytics?.potential_revenue || 0).toLocaleString()} VNĐ`,
      icon: Target,
      color: 'purple',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: user?.role === 'sales' ? 'Tương tác của tôi' : 'Đội bán hàng',
      value: user?.role === 'sales' ? (analytics?.total_interactions || 0) : (analytics?.total_sales_team || 0),
      icon: Activity,
      color: 'orange',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  const customerStatusData = Object.entries(analytics?.customers_by_status || {}).map(([status, count]) => {
    const statusMap = {
      'lead': 'Khách tiềm năng',
      'prospect': 'Triển vọng', 
      'active': 'Đang hoạt động',
      'inactive': 'Không hoạt động',
      'closed': 'Đã đóng'
    };
    return {
      name: statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: status === 'active' ? '#10B981' : status === 'lead' ? '#3B82F6' : status === 'prospect' ? '#F59E0B' : '#EF4444'
    };
  });

  const monthlyRevenueData = Object.entries(analytics?.monthly_revenue || {}).map(([month, revenue]) => ({
    month: month.split('-')[1],
    revenue,
    target: revenue * 1.2
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className={`flex items-center text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Phân bổ khách hàng</h3>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>
          {customerStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Chưa có dữ liệu</p>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Xu hướng doanh thu</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          {monthlyRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} VNĐ`, 'Doanh thu']}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Chưa có dữ liệu</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Performance Table (for Admins/Managers) */}
      {user?.role !== 'sales' && analytics?.sales_performance && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Hiệu suất đội bán hàng</h3>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Nhân viên bán hàng</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Khách hàng</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Doanh thu</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Mục tiêu</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Hiệu suất</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sales_performance.map((person, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {person.sales_person.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-slate-900">{person.sales_person}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{person.customer_count}</td>
                    <td className="py-4 px-4 text-slate-900 font-medium">{person.total_revenue.toLocaleString()} VNĐ</td>
                    <td className="py-4 px-4 text-slate-600">{person.target.toLocaleString()} VNĐ</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-slate-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((person.total_revenue / person.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {Math.round((person.total_revenue / person.target) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Thêm khách hàng mới</h4>
              <p className="text-blue-100 text-sm">Mở rộng cơ sở khách hàng của bạn</p>
            </div>
            <Plus className="w-8 h-8 text-blue-200" />
          </div>
          <button 
            onClick={() => navigate('/customers')}
            className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all"
          >
            Bắt đầu
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Xem phân tích</h4>
              <p className="text-green-100 text-sm">Khám phá chi tiết hiệu suất</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-200" />
          </div>
          <button 
            onClick={() => navigate('/analytics')}
            className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all"
          >
            Xem báo cáo
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Tổng quan đội nhóm</h4>
              <p className="text-purple-100 text-sm">Quản lý đội bán hàng của bạn</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
          <button 
            onClick={() => navigate('/sales')}
            className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all"
          >
            Xem đội nhóm
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer Management Component - wrapper for new LeadManagement
const CustomerManagement = () => {
  return <LeadManagement />;
};

// Customer List Component - Enhanced Lead Management
const CustomerList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]); // Sales team for filtering
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Enhanced filters
  const [filters, setFilters] = useState({
    assignedSales: '', // Bộ lọc theo nhân sự
    status: '', // Tiềm năng filter
    careStatus: '', // Trạng thái chăm sóc filter  
    salesResult: '', // Kết quả bán hàng filter
    activeStatus: 'active' // Hoạt động/Lưu trữ filter
  });
  
  // Widget filter state
  const [activeWidget, setActiveWidget] = useState('');
  
  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      // Filter only sales team members
      const salesUsers = response.data.filter(u => 
        ['sales', 'manager', 'admin'].includes(u.role)
      );
      setUsers(salesUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Apply all filters
  const filteredCustomers = customers.filter(customer => {
    // Search filter
    const matchesSearch = !searchTerm || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.source && customer.source.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Sales filter
    const matchesSales = !filters.assignedSales || customer.assigned_sales_id === filters.assignedSales;
    
    // Status filters
    const matchesStatus = !filters.status || customer.status === filters.status;
    const matchesCareStatus = !filters.careStatus || customer.care_status === filters.careStatus;
    const matchesSalesResult = !filters.salesResult || customer.sales_result === filters.salesResult;
    
    // Widget filters
    let matchesWidget = true;
    if (activeWidget === 'signed_contract') {
      matchesWidget = customer.sales_result === 'signed_contract';
    } else if (activeWidget === 'high_potential') {
      matchesWidget = customer.status === 'high';
    } else if (activeWidget === 'thinking') {
      matchesWidget = customer.care_status === 'thinking';
    } else if (activeWidget === 'working') {
      matchesWidget = customer.care_status === 'working';
    } else if (activeWidget === 'silent') {
      matchesWidget = customer.care_status === 'silent';
    } else if (activeWidget === 'rejected') {
      matchesWidget = customer.care_status === 'rejected';
    }
    
    return matchesSearch && matchesSales && matchesStatus && matchesCareStatus && matchesSalesResult && matchesWidget;
  });

  // Calculate statistics
  const getStats = () => {
    const filteredBySales = filters.assignedSales 
      ? customers.filter(c => c.assigned_sales_id === filters.assignedSales)
      : customers;
      
    return {
      totalLeads: filteredBySales.length,
      contractValue: filteredBySales
        .filter(c => c.sales_result === 'signed_contract')
        .reduce((sum, c) => sum + (c.potential_value || 0), 0),
      highPotential: filteredBySales.filter(c => c.status === 'high').length,
      thinking: filteredBySales.filter(c => c.care_status === 'thinking').length,
      working: filteredBySales.filter(c => c.care_status === 'working').length,
      silent: filteredBySales.filter(c => c.care_status === 'silent').length,
      rejected: filteredBySales.filter(c => c.care_status === 'rejected').length
    };
  };

  const stats = getStats();

  // Widget click handlers
  const handleWidgetClick = (widgetType) => {
    setActiveWidget(activeWidget === widgetType ? '' : widgetType);
  };

  // Bulk select handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(filteredCustomers.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name || user.username : 'Không xác định';
  };

  // Helper functions for status badges
  // Helper functions for status badges
  // Helper functions for status badges
  // Helper functions for status badges
  const getLeadStatusBadge = (status) => {
    const statusStyles = {
      high: 'bg-green-100 text-green-800 border-green-200',
      normal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const statusLabels = {
      high: 'Tiềm năng',
      normal: 'Bình thường', 
      low: 'Thấp'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.normal}`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'high' ? 'bg-green-500' : status === 'normal' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCareStatusBadge = (careStatus) => {
    const statusStyles = {
      potential_close: 'bg-green-100 text-green-800 border-green-200',
      thinking: 'bg-blue-100 text-blue-800 border-blue-200',
      working: 'bg-orange-100 text-orange-800 border-orange-200',
      silent: 'bg-gray-100 text-gray-800 border-gray-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const statusLabels = {
      potential_close: 'Khả năng chốt',
      thinking: 'Đang suy nghĩ',
      working: 'Đang làm việc',
      silent: 'Im ru',
      rejected: 'Từ chối'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[careStatus] || statusStyles.thinking}`}>
        {statusLabels[careStatus] || careStatus}
      </span>
    );
  };

  const getSalesResultBadge = (salesResult) => {
    if (!salesResult) return <span className="text-gray-500 text-xs">Chưa có</span>;
    
    const statusStyles = {
      signed_contract: 'bg-green-100 text-green-800 border-green-200',
      not_interested: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const statusLabels = {
      signed_contract: 'Ký hợp đồng',
      not_interested: 'Không quan tâm'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[salesResult]}`}>
        {statusLabels[salesResult] || salesResult}
      </span>
    );
  };

  // Care History Modal Component
  const CareHistoryModal = ({ customer, onClose }) => {
    const [careHistory, setCareHistory] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (customer?.id) {
        fetchCareHistory();
      }
    }, [customer]);

    const fetchCareHistory = async () => {
      setLoading(true);
      console.log('Fetching care history for customer:', customer.id);
      
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/api/customers/${customer.id}/interactions`;
        console.log('API URL:', url);
        console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response status:', response.status);

        if (response.ok) {
          const interactions = await response.json();
          console.log('Received interactions:', interactions);
          
          // Convert backend format to frontend format
          const formattedHistory = interactions.map(interaction => ({
            id: interaction.id,
            date: interaction.date,
            note: interaction.description || interaction.title,
            user: interaction.sales_id, // Will need to resolve to username later
            type: interaction.type
          }));
          console.log('Formatted history:', formattedHistory);
          setCareHistory(formattedHistory);
        } else {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`Failed to fetch care history: ${response.status} ${errorText}`);
        }
      } catch (error) {
        console.error('Failed to fetch care history:', error);
        // Only show alert if there's a real error, not just empty data
        alert('Không thể tải lịch sử chăm sóc. Sẽ hiển thị danh sách trống.');
        setCareHistory([]);
      } finally {
        setLoading(false);
      }
    };

    const addCareNote = async () => {
      if (!newNote.trim()) return;
      
      console.log('Adding care note:', newNote.trim());
      console.log('Customer ID:', customer.id);
      
      try {
        const interactionData = {
          customer_id: customer.id,
          type: "follow_up", // Default type for manual notes
          title: "Ghi chú chăm sóc",
          description: newNote.trim()
        };

        console.log('Sending interaction data:', interactionData);

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/interactions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(interactionData)
        });

        console.log('Add note response status:', response.status);

        if (response.ok) {
          const newInteraction = await response.json();
          console.log('New interaction created:', newInteraction);
          
          // Add the new note to the beginning of the history
          const newCareNote = {
            id: newInteraction.id,
            date: newInteraction.date,
            note: newInteraction.description || newInteraction.title,
            user: user?.full_name || 'Admin',
            type: newInteraction.type
          };
          
          console.log('Adding to care history:', newCareNote);
          setCareHistory([newCareNote, ...careHistory]);
          setNewNote('');
          
          // Optionally refresh the entire history to ensure consistency
          await fetchCareHistory();
        } else {
          const errorText = await response.text();
          console.error('Add note API Error:', response.status, errorText);
          throw new Error(`Failed to save care note: ${response.status} ${errorText}`);
        }
      } catch (error) {
        console.error('Failed to add care note:', error);
        alert('Không thể lưu ghi chú. Vui lòng thử lại.');
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'call': return '📞';
        case 'email': return '📧';
        case 'meeting': return '🤝';
        case 'note': return '📝';
        default: return '💬';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">
              Lịch sử chăm sóc - {customer?.name}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Add new note */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Thêm ghi chú chăm sóc mới..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <button
                onClick={addCareNote}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm ghi chú
              </button>
            </div>

            {/* History timeline */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-slate-500">Đang tải...</div>
              ) : careHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Chưa có lịch sử chăm sóc</div>
              ) : (
                careHistory.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="text-2xl">{getTypeIcon(item.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900">{item.user}</span>
                        <span className="text-sm text-slate-500">
                          {new Date(item.date).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm">{item.note}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full bg-slate-600 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };
    const [formData, setFormData] = useState({
      name: customer?.name || '',
      phone: customer?.phone || '',
      company: customer?.company || '', // Sẽ đổi thành Sản phẩm
      status: customer?.status || 'high', // Đổi thành Tiềm năng
      potential_value: customer?.potential_value || 0, // Đổi thành Giá trị hợp đồng
      care_status: customer?.care_status || 'potential_close', // Trạng thái chăm sóc
      sales_result: customer?.sales_result || '', // Kết quả bán hàng
      notes: customer?.notes || '',
      source: customer?.source || '',
      assigned_sales_id: customer?.assigned_sales_id || user?.id || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (customer) {
          await axios.put(`${API}/customers/${customer.id}`, formData);
        } else {
          await axios.post(`${API}/customers`, formData);
        }
        onSave();
        onClose();
      } catch (error) {
        console.error('Failed to save customer:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl w-full max-w-4xl mx-auto my-8 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-xl font-semibold text-slate-900">
              {customer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
            </h3>
            <p className="text-slate-500 mt-1">Điền thông tin khách hàng bên dưới</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tên khách hàng *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Tên Zalo/Facebook"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sản phẩm</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tiềm năng</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="high">Tiềm năng</option>
                    <option value="normal">Bình thường</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Giá trị hợp đồng (VNĐ)</label>
                  <input
                    type="text"
                    value={formData.potential_value ? Number(formData.potential_value).toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      // Remove all non-numeric characters except dots and commas
                      const value = e.target.value.replace(/[^\d]/g, '');
                      setFormData({...formData, potential_value: value ? parseInt(value) : 0});
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái chăm sóc</label>
                  <select
                    value={formData.care_status}
                    onChange={(e) => setFormData({...formData, care_status: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="potential_close">Khả năng chốt</option>
                    <option value="thinking">Đang suy nghĩ</option>
                    <option value="working">Đang làm việc</option>
                    <option value="silent">Im ru</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kết quả bán hàng</label>
                  <select
                    value={formData.sales_result}
                    onChange={(e) => setFormData({...formData, sales_result: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Chọn kết quả</option>
                    <option value="signed_contract">Ký hợp đồng</option>
                    <option value="not_interested">Không quan tâm</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nguồn</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Website, Giới thiệu, Gọi điện, v.v."
                  />
                </div>
              </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Thêm ghi chú bổ sung..."
              />
            </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 bg-slate-50 border-t border-slate-200 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                {customer ? 'Cập nhật khách hàng' : 'Tạo khách hàng'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

// Sales Team Component - Enhanced với Performance Modal
const SalesTeam = () => {
  const { user } = useAuth();
  const [salesTeam, setSalesTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSales, setSelectedSales] = useState(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  useEffect(() => {
    fetchSalesTeam();
  }, []);

  const fetchSalesTeam = async () => {
    try {
      const response = await axios.get(`${API}/sales`);
      setSalesTeam(response.data);
    } catch (error) {
      console.error('Failed to fetch sales team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPerformance = async (salesPerson) => {
    setSelectedSales(salesPerson);
    setShowPerformanceModal(true);
    setPerformanceLoading(true);
    
    try {
      const response = await axios.get(`${API}/sales/${salesPerson.id}/analytics`);
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  // Add Sales Modal Component
  const AddSalesModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      full_name: '',
      role: 'sales',
      phone: '',
      target_monthly: ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      
      try {
        await axios.post(`${API}/auth/register`, formData);
        onSave();
        onClose();
      } catch (error) {
        console.error('Failed to create sales person:', error);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto my-8 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-xl font-semibold text-slate-900">Thêm Nhân viên Bán hàng</h3>
            <p className="text-slate-500 mt-1">Tạo tài khoản mới cho nhân viên bán hàng</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email hoặc Tài khoản *</label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập email hoặc tài khoản"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Tạo mật khẩu"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vai trò</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="sales">Nhân viên Bán hàng</option>
                    <option value="manager">Quản lý Bán hàng</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mục tiêu hàng tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.target_monthly}
                    onChange={(e) => setFormData({...formData, target_monthly: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="100000000"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 bg-slate-50 border-t border-slate-200 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {saving ? 'Đang tạo...' : 'Tạo nhân viên'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Performance Modal Component
  const PerformanceModal = ({ salesPerson, data, loading, onClose }) => {
    if (!salesPerson) return null;

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl w-full max-w-6xl mx-auto my-8 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-lg font-medium">
                    {salesPerson.full_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Hiệu suất: {salesPerson.full_name}</h3>
                  <p className="text-slate-500">{salesPerson.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-blue-200" />
                      <span className="text-blue-100 text-sm">Tổng số</span>
                    </div>
                    <div className="text-2xl font-bold">{data.total_customers}</div>
                    <div className="text-blue-100 text-sm">Khách hàng</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="w-8 h-8 text-green-200" />
                      <span className="text-green-100 text-sm">Đạt được</span>
                    </div>
                    <div className="text-2xl font-bold">{(data.total_revenue || 0).toLocaleString()}</div>
                    <div className="text-green-100 text-sm">VNĐ doanh thu</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Target className="w-8 h-8 text-purple-200" />
                      <span className="text-purple-100 text-sm">Tiềm năng</span>
                    </div>
                    <div className="text-2xl font-bold">{(data.potential_revenue || 0).toLocaleString()}</div>
                    <div className="text-purple-100 text-sm">VNĐ tiềm năng</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Activity className="w-8 h-8 text-orange-200" />
                      <span className="text-orange-100 text-sm">Hoạt động</span>
                    </div>
                    <div className="text-2xl font-bold">{data.total_interactions || 0}</div>
                    <div className="text-orange-100 text-sm">Tương tác</div>
                  </div>
                </div>

                {/* Target Progress */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Tiến độ Mục tiêu Tháng</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Mục tiêu tháng:</span>
                      <span className="font-semibold">{(salesPerson.target_monthly || 0).toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Đã đạt được:</span>
                      <span className="font-semibold text-green-600">{(data.total_revenue || 0).toLocaleString()} VNĐ</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((data.total_revenue / (salesPerson.target_monthly || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">
                        Hoàn thành: {Math.round((data.total_revenue / (salesPerson.target_monthly || 1)) * 100)}%
                      </span>
                      <span className="text-slate-500">
                        Còn lại: {Math.max((salesPerson.target_monthly || 0) - (data.total_revenue || 0), 0).toLocaleString()} VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Status Distribution */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Phân bổ Khách hàng</h4>
                    {Object.keys(data.status_distribution || {}).length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={Object.entries(data.status_distribution || {}).map(([status, count]) => {
                              const statusMap = {
                                'lead': 'Khách tiềm năng',
                                'prospect': 'Triển vọng', 
                                'active': 'Đang hoạt động',
                                'inactive': 'Không hoạt động',
                                'closed': 'Đã đóng'
                              };
                              return {
                                name: statusMap[status] || status,
                                value: count,
                                color: status === 'active' ? '#10B981' : status === 'lead' ? '#3B82F6' : status === 'prospect' ? '#F59E0B' : '#EF4444'
                              };
                            })}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {Object.entries(data.status_distribution || {}).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-slate-500">
                        <div className="text-center">
                          <PieChartIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p>Chưa có dữ liệu khách hàng</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Monthly Activity Trend */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Tương tác theo Tháng</h4>
                    {Object.keys(data.monthly_interactions || {}).length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={Object.entries(data.monthly_interactions || {}).map(([month, count]) => ({
                          month: month.split('-')[1],
                          interactions: count
                        }))}>
                          <defs>
                            <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                          <YAxis stroke="#64748B" fontSize={12} />
                          <Tooltip 
                            formatter={(value) => [value, 'Tương tác']}
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="interactions" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorInteractions)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-slate-500">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p>Chưa có dữ liệu tương tác</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Hoạt động Gần đây</h4>
                  {data.recent_interactions && data.recent_interactions.length > 0 ? (
                    <div className="space-y-4">
                      {data.recent_interactions.slice(0, 5).map((interaction, index) => (
                        <div key={index} className="flex items-center p-4 bg-slate-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            {interaction.type === 'call' && <Phone className="w-5 h-5 text-blue-600" />}
                            {interaction.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                            {interaction.type === 'meeting' && <Calendar className="w-5 h-5 text-blue-600" />}
                            {interaction.type === 'sale' && <DollarSign className="w-5 h-5 text-green-600" />}
                            {!['call', 'email', 'meeting', 'sale'].includes(interaction.type) && <Activity className="w-5 h-5 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-slate-900">{interaction.title}</h5>
                                <p className="text-sm text-slate-500 mt-1">
                                  {interaction.description || 'Không có mô tả'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-slate-600">
                                  {new Date(interaction.date).toLocaleDateString('vi-VN')}
                                </p>
                                {interaction.revenue_generated > 0 && (
                                  <p className="text-sm font-medium text-green-600">
                                    +{interaction.revenue_generated.toLocaleString()} VNĐ
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p>Chưa có hoạt động nào được ghi nhận</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Không thể tải dữ liệu hiệu suất</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Đội Bán hàng</h2>
          <p className="text-slate-600 mt-1">Quản lý và theo dõi hiệu suất đội bán hàng</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center transition-all shadow-lg hover:shadow-xl"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Thêm Nhân viên
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesTeam.map((salesPerson) => (
          <div key={salesPerson.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-lg font-medium">
                  {salesPerson.full_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{salesPerson.full_name}</h3>
                <p className="text-sm text-slate-500">{salesPerson.email}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" title="Đang hoạt động"></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Mục tiêu tháng:</span>
                <span className="text-sm font-medium text-slate-900">
                  {(salesPerson.target_monthly || 0).toLocaleString()} VNĐ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Điện thoại:</span>
                <span className="text-sm text-slate-900">{salesPerson.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Ngày tham gia:</span>
                <span className="text-sm text-slate-900">{new Date(salesPerson.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button 
                onClick={() => handleViewPerformance(salesPerson)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg transition-colors font-medium"
              >
                Xem Hiệu suất
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Sales Modal */}
      {showAddModal && (
        <AddSalesModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            fetchSalesTeam();
            setShowAddModal(false);
          }}
        />
      )}

      {/* Performance Modal */}
      {showPerformanceModal && (
        <PerformanceModal
          salesPerson={selectedSales}
          data={performanceData}
          loading={performanceLoading}
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedSales(null);
            setPerformanceData(null);
          }}
        />
      )}
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ClientsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:clientId"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ClientDetailPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProjectsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <StaffPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CustomerManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SalesTeam />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/internship/assignments"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <InternshipAssignments />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/internship/performance"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <InternshipPerformance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <TasksPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Analytics />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AccountManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
