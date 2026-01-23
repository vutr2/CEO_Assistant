'use client'
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Award,
  UserCheck,
  UserX,
  Calendar,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { employeeAPI } from '@/lib/api';

export default function PeopleDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Technology',
    position: '',
    status: 'active'
  });
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Icon mapping for stats
  const iconMap = {
    Users,
    UserCheck,
    Calendar,
    UserX,
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all employee data in parallel
        // Always fetch all employees count for "Tất cả" tab, plus filtered employees for display
        const [statsData, allEmployeesData, filteredEmployeesData, departmentsData, performersData] = await Promise.all([
          employeeAPI.getStats(),
          employeeAPI.getAll({}), // Get all employees for total count
          selectedDepartment !== 'all'
            ? employeeAPI.getAll({ department: selectedDepartment })
            : Promise.resolve(null), // Skip if already getting all
          employeeAPI.getDepartments(),
          employeeAPI.getTopPerformers(3),
        ]);

        // Process stats with icons
        const processedStats = statsData.data?.map(stat => ({
          ...stat,
          icon: iconMap[stat.iconName] || Users,
        })) || [];

        // Use filtered data if a specific department is selected, otherwise use all data
        const displayEmployees = selectedDepartment !== 'all' && filteredEmployeesData
          ? filteredEmployeesData.data
          : allEmployeesData.data;

        setStats(processedStats);
        setEmployees(displayEmployees || []);
        // Always use allEmployeesData.total for "Tất cả" count
        setDepartments([{ name: 'all', label: 'Tất cả', count: allEmployeesData.total || 0 }, ...(departmentsData.data || [])]);
        setTopPerformers(performersData.data || []);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError(err.message);
        // No fallback mock data - show error state instead
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [selectedDepartment]);

  // Handle add employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (!newEmployee.name || !newEmployee.email || !newEmployee.position) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await employeeAPI.create(newEmployee);

      if (result.success) {
        alert('Thêm nhân viên thành công!');
        setShowAddModal(false);
        setNewEmployee({
          name: '',
          email: '',
          phone: '',
          department: 'Technology',
          position: '',
          status: 'active'
        });
        // Refresh data
        window.location.reload();
      } else {
        alert(result.message || 'Không thể thêm nhân viên');
      }
    } catch (err) {
      console.error('Error adding employee:', err);
      alert('Đã xảy ra lỗi khi thêm nhân viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available departments for dropdown
  const availableDepartments = [
    'Technology',
    'Marketing',
    'Sales',
    'HR',
    'Design',
    'Finance',
    'Operations'
  ];

  // Handle edit employee
  const handleEditEmployee = (employee) => {
    setEditingEmployee({ ...employee });
    setShowEditModal(true);
    setActiveActionMenu(null);
  };

  // Handle save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await employeeAPI.update(editingEmployee.id, editingEmployee);

      if (result.success) {
        alert('Cập nhật nhân viên thành công!');
        setShowEditModal(false);
        setEditingEmployee(null);
        window.location.reload();
      } else {
        alert(result.message || 'Không thể cập nhật nhân viên');
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('Đã xảy ra lỗi khi cập nhật nhân viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete employee
  const handleDeleteEmployee = async (employee) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${employee.name}"?`)) {
      return;
    }

    try {
      const result = await employeeAPI.delete(employee.id);

      if (result.success) {
        alert('Xóa nhân viên thành công!');
        window.location.reload();
      } else {
        alert(result.message || 'Không thể xóa nhân viên');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Đã xảy ra lỗi khi xóa nhân viên');
    }
    setActiveActionMenu(null);
  };

  // Handle export employee list
  const handleExportList = () => {
    if (!employees || employees.length === 0) {
      alert('Không có dữ liệu nhân viên để xuất');
      return;
    }

    const exportDate = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Get department label
    const getDeptLabel = (dept) => {
      const labels = {
        'Technology': 'Công nghệ',
        'Marketing': 'Marketing',
        'Sales': 'Kinh doanh',
        'HR': 'Nhân sự',
        'Design': 'Thiết kế',
        'Finance': 'Tài chính',
        'Operations': 'Vận hành'
      };
      return labels[dept] || dept;
    };

    // Get status label
    const getStatusLabel = (status) => {
      return status === 'active' ? 'Đang làm việc' : 'Nghỉ phép';
    };

    // Create CSV content
    const csvHeader = 'STT,Họ và tên,Email,Số điện thoại,Phòng ban,Vị trí,Trạng thái,Hiệu suất (%)';
    const csvRows = employees.map((emp, index) =>
      `${index + 1},"${emp.name}","${emp.email}","${emp.phone || ''}","${getDeptLabel(emp.department)}","${emp.position}","${getStatusLabel(emp.status)}",${emp.performance}`
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Create text report content
    const reportContent = `
DANH SÁCH NHÂN VIÊN - CEO AI ASSISTANT
=======================================
Ngày xuất: ${exportDate}
Tổng số nhân viên: ${employees.length}
Bộ lọc: ${selectedDepartment === 'all' ? 'Tất cả phòng ban' : getDeptLabel(selectedDepartment)}

DANH SÁCH CHI TIẾT
------------------
${employees.map((emp, index) =>
`${(index + 1).toString().padStart(2, '0')}. ${emp.name}
    Email: ${emp.email}
    Điện thoại: ${emp.phone || 'Chưa cập nhật'}
    Phòng ban: ${getDeptLabel(emp.department)}
    Vị trí: ${emp.position}
    Trạng thái: ${getStatusLabel(emp.status)}
    Hiệu suất: ${emp.performance}%
`).join('\n')}

=======================================
Báo cáo được tạo tự động bởi CEO AI Assistant
    `.trim();

    // Create and download CSV file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danh-sach-nhan-vien-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert('Đã xuất danh sách nhân viên thành công!');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu nhân sự...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể tải dữ liệu nhân sự</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý nhân sự</h1>
              <p className="text-gray-600 mt-1">Theo dõi và quản lý toàn bộ nhân viên</p>
              {error && (
                <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg inline-block">
                  ⚠️ Đang sử dụng dữ liệu mẫu
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportList}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Download size={18} />
                <span className="text-sm font-medium">Xuất danh sách</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">Thêm nhân viên</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              orange: 'bg-orange-50 text-orange-600',
              red: 'bg-red-50 text-red-600'
            };

            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${colorClasses[stat.color]} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                  {stat.trend === 'up' ? (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <TrendingUp size={16} />
                      {stat.change}
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 text-sm font-medium">
                      <TrendingDown size={16} />
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Employee List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Search & Filter */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm nhân viên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Lọc</span>
                  </button>
                </div>

                {/* Department Tabs */}
                <div className="flex items-center gap-2 mt-4 overflow-x-auto">
                  {departments.map((dept) => (
                    <button
                      key={dept.name}
                      onClick={() => setSelectedDepartment(dept.name)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                        selectedDepartment === dept.name
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dept.label} ({dept.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Employee Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nhân viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng ban
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liên hệ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hiệu suất
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {employee.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{employee.name}</p>
                              <p className="text-sm text-gray-500">{employee.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {employee.department}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} />
                              {employee.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              {employee.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                              <div
                                className={`h-2 rounded-full ${
                                  employee.performance >= 90
                                    ? 'bg-green-500'
                                    : employee.performance >= 80
                                    ? 'bg-blue-500'
                                    : 'bg-yellow-500'
                                }`}
                                style={{ width: `${employee.performance}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{employee.performance}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {employee.status === 'active' ? (
                            <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              Đang làm
                            </span>
                          ) : (
                            <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                              Nghỉ phép
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <button
                              onClick={() => setActiveActionMenu(activeActionMenu === employee.id ? null : employee.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MoreVertical size={20} />
                            </button>

                            {/* Dropdown Menu */}
                            {activeActionMenu === employee.id && (
                              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]">
                                <button
                                  onClick={() => handleEditEmployee(employee)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Edit2 size={16} />
                                  Chỉnh sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(employee)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Xóa nhân viên
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Performers */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="text-yellow-500" size={20} />
                Xuất sắc nhất
              </h3>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{performer.name}</p>
                      <p className="text-xs text-gray-500">{performer.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-sm">{performer.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Phân bổ phòng ban</h3>
              <div className="space-y-3">
                {departments.slice(1).map((dept, index) => {
                  const percentage = (dept.count / 248) * 100;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                  return (
                    <div key={dept.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{dept.label}</span>
                        <span className="text-sm font-medium text-gray-900">{dept.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colors[index % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Thêm nhân viên mới</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="email@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng ban <span className="text-red-500">*</span>
                </label>
                <select
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  placeholder="Senior Developer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={newEmployee.status}
                  onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="active">Đang làm việc</option>
                  <option value="leave">Nghỉ phép</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    'Thêm nhân viên'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa nhân viên</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmployee(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                  placeholder="email@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={editingEmployee.phone || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng ban <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingEmployee.department}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingEmployee.position}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                  placeholder="Senior Developer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={editingEmployee.status}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="active">Đang làm việc</option>
                  <option value="leave">Nghỉ phép</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEmployee(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
