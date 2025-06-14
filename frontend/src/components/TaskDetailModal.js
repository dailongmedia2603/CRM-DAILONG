import React from 'react';
import { X, Calendar, User, AlertCircle, FileText, MessageSquare, Paperclip, Clock, ExternalLink } from 'lucide-react';

const TaskDetailModal = ({ 
  isOpen, 
  onClose, 
  task, 
  formatDate, 
  getPriorityColor, 
  getStatusColor, 
  getStatusText, 
  users = [] 
}) => {
  if (!isOpen || !task) return null;

  const assignedUser = users.find(u => u.id === task.assigned_to || u.email === task.assigned_to);
  const createdUser = users.find(u => u.id === task.created_by);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Chi tiết công việc</h2>
              <p className="text-sm text-slate-600">Thông tin đầy đủ về task</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Task Title and Status */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                {task.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'urgent' ? 'Khẩn cấp' : 
                   task.priority === 'high' ? 'Cao' :
                   task.priority === 'normal' ? 'Bình thường' : 'Thấp'}
                </span>
              </div>
            </div>
            
            {task.description && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">Mô tả:</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}
          </div>

          {/* Task Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Assigned User */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Thực tập sinh</p>
                  <p className="text-slate-800 font-semibold">
                    {assignedUser ? `${assignedUser.full_name} (${assignedUser.email})` : task.assigned_to}
                  </p>
                </div>
              </div>
            </div>

            {/* Created By */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Người tạo</p>
                  <p className="text-slate-800 font-semibold">
                    {createdUser ? `${createdUser.full_name}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Deadline</p>
                  <p className="text-slate-800 font-semibold">
                    {task.deadline ? formatDate(task.deadline) : 'Không có'}
                  </p>
                </div>
              </div>
            </div>

            {/* Post Count */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Số lượng Post</p>
                  <p className="text-slate-800 font-semibold text-2xl">
                    {task.post_count || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Comment Count */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Số lượng Comment</p>
                  <p className="text-slate-800 font-semibold text-2xl">
                    {task.comment_count || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Work File Link */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Paperclip className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">File làm việc</p>
                  {task.work_file_link ? (
                    <a 
                      href={task.work_file_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Xem file
                    </a>
                  ) : (
                    <p className="text-slate-400">Chưa có file</p>
                  )}
                </div>
              </div>
            </div>

            {/* Created At */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Ngày tạo</p>
                  <p className="text-slate-800 font-semibold">
                    {formatDate(task.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Updated At */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Cập nhật lần cuối</p>
                  <p className="text-slate-800 font-semibold">
                    {formatDate(task.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed At (if completed) */}
            {task.status === 'completed' && task.completed_at && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Ngày hoàn thành</p>
                    <p className="text-slate-800 font-semibold">
                      {formatDate(task.completed_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="border-t border-slate-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Progress Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Tổng quan tiến độ
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Trạng thái:</span>
                    <span className={`font-semibold ${
                      task.status === 'completed' ? 'text-green-600' :
                      task.status === 'in_progress' ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Độ ưu tiên:</span>
                    <span className={`font-semibold ${
                      task.priority === 'urgent' ? 'text-red-600' :
                      task.priority === 'high' ? 'text-orange-600' :
                      task.priority === 'normal' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {task.priority === 'urgent' ? 'Khẩn cấp' : 
                       task.priority === 'high' ? 'Cao' :
                       task.priority === 'normal' ? 'Bình thường' : 'Thấp'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Hoạt động:</span>
                    <span className="font-semibold text-slate-800">
                      {(task.post_count || 0) + (task.comment_count || 0)} tương tác
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Required */}
              {task.status !== 'completed' && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                    Cần chú ý
                  </h4>
                  <div className="space-y-2">
                    {task.deadline && new Date(task.deadline) < new Date() && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Quá hạn deadline</span>
                      </div>
                    )}
                    {task.priority === 'urgent' && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Nhiệm vụ khẩn cấp</span>
                      </div>
                    )}
                    {(task.post_count || 0) === 0 && (task.comment_count || 0) === 0 && (
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Chưa có hoạt động nào</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;