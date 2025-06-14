import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const DateFilter = ({ 
  dateFilter, 
  setDateFilter, 
  customDateFrom, 
  setCustomDateFrom, 
  customDateTo, 
  setCustomDateTo, 
  showCustomDatePicker, 
  setShowCustomDatePicker,
  onFilterChange 
}) => {
  
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    if (value === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setCustomDateFrom('');
      setCustomDateTo('');
    }
    if (onFilterChange) onFilterChange();
  };

  const handleCustomDateChange = () => {
    if (customDateFrom && customDateTo) {
      if (onFilterChange) onFilterChange();
    }
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Hôm nay';
      case 'yesterday': return 'Hôm qua';
      case 'last_7_days': return '7 ngày trước';
      case 'custom': 
        if (customDateFrom && customDateTo) {
          return `${new Date(customDateFrom).toLocaleDateString('vi-VN')} - ${new Date(customDateTo).toLocaleDateString('vi-VN')}`;
        }
        return 'Tuỳ chỉnh';
      default: return 'Lọc theo thời gian';
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              dateFilter 
                ? 'border-blue-300 bg-blue-50 text-blue-600' 
                : 'border-slate-300 hover:bg-slate-50'
            }`}
            onClick={() => {
              // Toggle dropdown logic here
              const dropdown = document.getElementById('date-filter-dropdown');
              dropdown.classList.toggle('hidden');
            }}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {getDateFilterLabel()}
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          
          {/* Dropdown Menu */}
          <div 
            id="date-filter-dropdown"
            className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 hidden"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  handleDateFilterChange('');
                  document.getElementById('date-filter-dropdown').classList.add('hidden');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50"
              >
                Tất cả
              </button>
              <button
                onClick={() => {
                  handleDateFilterChange('today');
                  document.getElementById('date-filter-dropdown').classList.add('hidden');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50"
              >
                Hôm nay
              </button>
              <button
                onClick={() => {
                  handleDateFilterChange('yesterday');
                  document.getElementById('date-filter-dropdown').classList.add('hidden');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50"
              >
                Hôm qua
              </button>
              <button
                onClick={() => {
                  handleDateFilterChange('last_7_days');
                  document.getElementById('date-filter-dropdown').classList.add('hidden');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50"
              >
                7 ngày trước
              </button>
              <button
                onClick={() => {
                  handleDateFilterChange('custom');
                  document.getElementById('date-filter-dropdown').classList.add('hidden');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50"
              >
                Tuỳ chỉnh
              </button>
            </div>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {showCustomDatePicker && (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={customDateFrom}
              onChange={(e) => {
                setCustomDateFrom(e.target.value);
                setTimeout(handleCustomDateChange, 100);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Từ ngày"
            />
            <span className="text-slate-500">đến</span>
            <input
              type="date"
              value={customDateTo}
              onChange={(e) => {
                setCustomDateTo(e.target.value);
                setTimeout(handleCustomDateChange, 100);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Đến ngày"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateFilter;