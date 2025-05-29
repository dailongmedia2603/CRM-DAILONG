import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  X, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Clock,
  MessageCircle,
  UserX,
  Archive,
  History
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Enhanced Lead Management Component
const LeadManagement = () => {
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
  const getStatusBadge = (status) => {
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
      try {
        // Mock data for now - you can implement actual API call
        const mockHistory = [
          {
            id: 1,
            date: new Date().toISOString(),
            note: 'Đã gọi điện thoại để tư vấn sản phẩm',
            user: 'Admin',
            type: 'call'
          },
          {
            id: 2,
            date: new Date(Date.now() - 86400000).toISOString(),
            note: 'Gửi thông tin báo giá qua email',
            user: 'Admin',
            type: 'email'
          },
          {
            id: 3,
            date: new Date(Date.now() - 172800000).toISOString(),
            note: 'Khách hàng quan tâm đến sản phẩm, hẹn gặp vào tuần sau',
            user: user?.full_name || 'Admin',
            type: 'meeting'
          }
        ];
        setCareHistory(mockHistory);
      } catch (error) {
        console.error('Failed to fetch care history:', error);
      } finally {
        setLoading(false);
      }
    };

    const addCareNote = async () => {
      if (!newNote.trim()) return;
      
      const newCareNote = {
        id: Date.now(),
        date: new Date().toISOString(),
        note: newNote,
        user: user?.full_name || 'Admin',
        type: 'note'
      };
      
      setCareHistory([newCareNote, ...careHistory]);
      setNewNote('');
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

  // Lead Modal Component (for Add/Edit)
  const LeadModal = ({ customer, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      name: customer?.name || '',
      phone: customer?.phone || '',
      company: customer?.company || '', 
      status: customer?.status || 'high',
      potential_value: customer?.potential_value || 0,
      care_status: customer?.care_status || 'potential_close',
      sales_result: customer?.sales_result || '',
      notes: customer?.notes || '',
      source: customer?.source || '',
      assigned_sales_id: customer?.assigned_sales_id || user?.id || ''
    });

    const handleSave = async () => {
      try {
        if (customer?.id) {
          // Update existing customer
          await axios.put(`${API}/customers/${customer.id}`, formData);
        } else {
          // Create new customer
          await axios.post(`${API}/customers`, formData);
        }
        await fetchCustomers();
        onClose();
      } catch (error) {
        console.error('Failed to save customer:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">
              {customer?.id ? 'Sửa Lead' : 'Thêm Lead'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
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

          <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {customer?.id ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Quản lý Lead</h1>
          <p className="text-slate-600">Quản lý và theo dõi khách hàng tiềm năng</p>
        </div>

        {/* Sales Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Bộ lọc theo nhân sự</label>
          <select
            value={filters.assignedSales}
            onChange={(e) => setFilters({...filters, assignedSales: e.target.value})}
            className="w-full max-w-xs px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả nhân sự</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.username}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
              activeWidget === '' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:shadow-md'
            }`}
            onClick={() => handleWidgetClick('')}
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-slate-600">Tổng Lead</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
              activeWidget === 'signed_contract' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:shadow-md'
            }`}
            onClick={() => handleWidgetClick('signed_contract')}
          >
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-slate-600">Giá trị HĐ</p>
                <p className="text-xl font-bold text-slate-900">{stats.contractValue.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
              activeWidget === 'high_potential' ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 hover:shadow-md'
            }`}
            onClick={() => handleWidgetClick('high_potential')}
          >
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-slate-600">Lead tiềm năng</p>
                <p className="text-2xl font-bold text-slate-900">{stats.highPotential}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
              activeWidget === 'thinking' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:shadow-md'
            }`}
            onClick={() => handleWidgetClick('thinking')}
          >
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-slate-600">Đang suy nghĩ</p>
                <p className="text-2xl font-bold text-slate-900">{stats.thinking}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
              activeWidget === 'working' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:shadow-md'
            }`}
            onClick={() => handleWidgetClick('working')}
          >
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-slate-600">Đang làm việc</p>
                <p className="text-2xl font-bold text-slate-900">{stats.working}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
              activeWidget === 'silent' ? 'border-gray-500 bg-gray-50' : 'border-slate-200 hover:shadow-md'
            }`}
            onClick={() => handleWidgetClick('silent')}
          >
            <div className="flex items-center">
              <Archive className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-slate-600">Im ru</p>
                <p className="text-2xl font-bold text-slate-900">{stats.silent}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
              activeWidget === 'rejected' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:shadow-md'
            }`}
            onClick={() => handleWidgetClick('rejected')}
          >
            <div className="flex items-center">
              <UserX className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-slate-600">Từ chối</p>
                <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả tiềm năng</option>
                <option value="high">Tiềm năng</option>
                <option value="normal">Bình thường</option>
                <option value="low">Thấp</option>
              </select>

              <select
                value={filters.careStatus}
                onChange={(e) => setFilters({...filters, careStatus: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái chăm sóc</option>
                <option value="potential_close">Khả năng chốt</option>
                <option value="thinking">Đang suy nghĩ</option>
                <option value="working">Đang làm việc</option>
                <option value="silent">Im ru</option>
                <option value="rejected">Từ chối</option>
              </select>

              <select
                value={filters.salesResult}
                onChange={(e) => setFilters({...filters, salesResult: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả kết quả</option>
                <option value="signed_contract">Ký hợp đồng</option>
                <option value="not_interested">Không quan tâm</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {selectedIds.length > 0 && (
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa ({selectedIds.length})
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Lead
              </button>
            </div>
          </div>
        </div>

        {/* Lead Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tên Lead
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Lịch sử chăm sóc
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Sale tạo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tiềm năng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Trạng thái chăm sóc
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Kết quả bán hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(customer.id)}
                        onChange={(e) => handleSelectOne(customer.id, e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white text-sm font-medium">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{customer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{customer.phone || 'Không có'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{customer.company || 'Không có'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowHistoryModal(true);
                        }}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors flex items-center"
                      >
                        <History className="w-3 h-3 mr-1" />
                        Lịch sử
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{getUserName(customer.assigned_sales_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCareStatusBadge(customer.care_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSalesResultBadge(customer.sales_result)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowAddModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-2">Không có lead nào</div>
              <p className="text-slate-500">Hãy thêm lead mới để bắt đầu quản lý</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {showAddModal && (
          <LeadModal
            customer={selectedCustomer}
            onClose={() => {
              setShowAddModal(false);
              setSelectedCustomer(null);
            }}
            onSave={() => {
              setShowAddModal(false);
              setSelectedCustomer(null);
            }}
          />
        )}

        {showHistoryModal && selectedCustomer && (
          <CareHistoryModal
            customer={selectedCustomer}
            onClose={() => {
              setShowHistoryModal(false);
              setSelectedCustomer(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LeadManagement;