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
    const hasFilters = priorityFilter || deadlineFilter || filterStatus === 'completed';
    setHasActiveFilters(hasFilters);
  }, [priorityFilter, deadlineFilter, filterStatus]);

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
      const response = await axios.get(`${API}/tasks/statistics`);
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

  const handleUpdateTaskExecution = async (taskId, execution) => {
    try {
      // Convert execution to status
      const statusMapping = {
        'doing': 'in_progress',
        'done': 'completed'
      };
      
      await axios.put(`${API}/tasks/${taskId}`, { 
        status: statusMapping[execution] || 'in_progress'
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
      case 'todo': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'todo': return 'Chưa làm';
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
                Feedback
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Thực hiện
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onOpenFeedback(task)}
                      className={`inline-flex items-center px-3 py-1.5 border text-sm rounded-lg transition-colors ${
                        taskCommentCounts[task.id] && taskCommentCounts[task.id] > 0
                          ? 'border-red-300 text-red-600 hover:bg-red-50'
                          : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Feedback {taskCommentCounts[task.id] && taskCommentCounts[task.id] > 0 && (
                        <span className="ml-1 bg-red-100 text-red-600 text-xs rounded-full px-1.5 py-0.5">
                          {taskCommentCounts[task.id]}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={task.status === 'completed' ? 'done' : task.status === 'in_progress' ? 'doing' : ''}
                      onChange={(e) => onUpdateExecution(task.id, e.target.value)}
                      className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn...</option>
                      <option value="doing">Đang làm</option>
                      <option value="done">Hoàn thành</option>
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
  const { user, token } = useAuth();

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
