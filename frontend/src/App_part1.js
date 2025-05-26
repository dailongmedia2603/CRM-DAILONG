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
  MessageCircle, FolderOpen, CalendarDays, Banknote
} from 'lucide-react';
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
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [accountDeleteLoading, setAccountDeleteLoading] = useState(false);
  const [showAccountDeleteConfirm, setShowAccountDeleteConfirm] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [accountDeleteLoading, setAccountDeleteLoading] = useState(false);
  const [showAccountDeleteConfirm, setShowAccountDeleteConfirm] = useState(false);

  const confirmDeleteUser = async () => {
    if (!accountToDelete) return;
    
    setAccountDeleteLoading(true);
    try {
      const response = await axios.delete(`${API}/users/${accountToDelete.id}`);
      console.log('Delete response:', response.data);
      fetchUsers();
      setShowAccountDeleteConfirm(false);
      setAccountToDelete(null);
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
      setAccountDeleteLoading(false);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      setBulkActionLoading(true);
      await Promise.all(
        selectedClients.map(id => axios.delete(`${API}/users/${id}`))
      );
      setClients(clients.filter(client => !selectedClients.includes(client.id)));
      setSelectedClients([]);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error('Error performing bulk delete:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
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
                      <div className="text-sm text-slate-900">{client.contact_person}</div>
                      <div className="text-sm text-slate-500">{client.email}</div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Xóa tài khoản
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Bạn có chắc chắn muốn xóa tài khoản của{' '}
                <span className="font-semibold text-gray-900">
                  {userToDelete?.full_name || userToDelete?.username}
                </span>?
              </p>
              <p className="text-xs text-red-600 mb-6">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Xóa nhiều tài khoản
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Bạn có chắc chắn muốn xóa{' '}
                <span className="font-semibold text-gray-900">
                  {selectedUsers.length} tài khoản
                </span>{' '}
                đã chọn?
              </p>
              <p className="text-xs text-red-600 mb-6">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkActionLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={bulkActionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {bulkActionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  'Xóa tất cả'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Xóa tài khoản
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Bạn có chắc chắn muốn xóa tài khoản của{' '}
                <span className="font-semibold text-gray-900">
                  {userToDelete?.full_name || userToDelete?.username}
                </span>?
              </p>
              <p className="text-xs text-red-600 mb-6">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Xóa nhiều tài khoản
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Bạn có chắc chắn muốn xóa{' '}
                <span className="font-semibold text-gray-900">
                  {selectedUsers.length} tài khoản
                </span>{' '}
                đã chọn?
              </p>
              <p className="text-xs text-red-600 mb-6">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkActionLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={bulkActionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {bulkActionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  'Xóa tất cả'
                )}
              </button>
            </div>
          </div>
        </div>
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
