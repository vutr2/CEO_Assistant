'use client';

import { useState, useEffect } from 'react';
import { expensesAPI } from '@/lib/api';
import {
  Plus,
  Receipt,
  DollarSign,
  TrendingDown,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'office_supplies',
    amount: '',
    vendor: '',
    vendorEmail: '',
    vendorPhone: '',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    priority: 'medium',
    expenseDate: new Date().toISOString().split('T')[0],
    isReimbursable: false,
    isTaxDeductible: false,
    receiptNumber: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, statsRes] = await Promise.all([
        expensesAPI.getAll({ limit: 50 }),
        expensesAPI.getStats()
      ]);
      setExpenses(expensesRes.data || []);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingExpense) {
        await expensesAPI.update(editingExpense._id, dataToSend);
      } else {
        await expensesAPI.create(dataToSend);
      }

      setShowForm(false);
      setEditingExpense(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      description: expense.description || '',
      category: expense.category,
      amount: expense.amount.toString(),
      vendor: expense.vendor || '',
      vendorEmail: expense.vendorEmail || '',
      vendorPhone: expense.vendorPhone || '',
      paymentMethod: expense.paymentMethod,
      paymentStatus: expense.paymentStatus,
      priority: expense.priority,
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
      isReimbursable: expense.isReimbursable,
      isTaxDeductible: expense.isTaxDeductible,
      receiptNumber: expense.receiptNumber || '',
      notes: expense.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa chi phí này?')) return;
    try {
      await expensesAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'office_supplies',
      amount: '',
      vendor: '',
      vendorEmail: '',
      vendorPhone: '',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      priority: 'medium',
      expenseDate: new Date().toISOString().split('T')[0],
      isReimbursable: false,
      isTaxDeductible: false,
      receiptNumber: '',
      notes: '',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      office_supplies: 'Văn phòng phẩm',
      travel: 'Công tác',
      meals: 'Ăn uống',
      utilities: 'Tiện ích',
      rent: 'Thuê mặt bằng',
      salaries: 'Lương',
      marketing: 'Marketing',
      equipment: 'Thiết bị',
      software: 'Phần mềm',
      services: 'Dịch vụ',
      taxes: 'Thuế',
      insurance: 'Bảo hiểm',
      other: 'Khác',
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: { label: 'Nháp', color: 'bg-gray-100 text-gray-800', icon: Clock },
      submitted: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800', icon: XCircle },
      paid: { label: 'Đã thanh toán', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    };
    const { label, color, icon: Icon } = config[status] || config.submitted;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = {
      low: { label: 'Thấp', color: 'bg-gray-100 text-gray-600' },
      medium: { label: 'Trung bình', color: 'bg-blue-100 text-blue-600' },
      high: { label: 'Cao', color: 'bg-orange-100 text-orange-600' },
      urgent: { label: 'Khẩn cấp', color: 'bg-red-100 text-red-600' },
    };
    const { label, color } = config[priority] || config.medium;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Chi phí</h1>
          <p className="text-gray-600">Theo dõi và báo cáo các khoản chi phí</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingExpense(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Thêm chi phí
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng chi phí</p>
                <p className="text-xl font-bold">{formatCurrency(stats.overview?.totalExpenses || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã duyệt</p>
                <p className="text-xl font-bold">{formatCurrency(stats.overview?.approvedExpenses || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chờ duyệt</p>
                <p className="text-xl font-bold">{formatCurrency(stats.overview?.pendingExpenses || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Receipt className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Số lượng</p>
                <p className="text-xl font-bold">{stats.overview?.totalCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi phí</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ưu tiên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Chưa có chi phí nào. Bấm "Thêm chi phí" để bắt đầu.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{expense.title}</p>
                        <p className="text-sm text-gray-500">{expense.vendor}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {getCategoryLabel(expense.category)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-4 py-3">
                      {getPriorityBadge(expense.priority)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(expense.expenseDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {expense.status !== 'approved' && expense.status !== 'paid' && (
                          <>
                            <button
                              onClick={() => handleEdit(expense)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingExpense ? 'Sửa chi phí' : 'Thêm chi phí mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Mua văn phòng phẩm tháng 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="office_supplies">Văn phòng phẩm</option>
                    <option value="travel">Công tác</option>
                    <option value="meals">Ăn uống</option>
                    <option value="utilities">Tiện ích</option>
                    <option value="rent">Thuê mặt bằng</option>
                    <option value="salaries">Lương</option>
                    <option value="marketing">Marketing</option>
                    <option value="equipment">Thiết bị</option>
                    <option value="software">Phần mềm</option>
                    <option value="services">Dịch vụ</option>
                    <option value="taxes">Thuế</option>
                    <option value="insurance">Bảo hiểm</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tiền (VND) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày chi
                  </label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhà cung cấp
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên nhà cung cấp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SĐT nhà cung cấp
                  </label>
                  <input
                    type="text"
                    value={formData.vendorPhone}
                    onChange={(e) => setFormData({ ...formData, vendorPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số hóa đơn
                  </label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phương thức
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="bank_transfer">Chuyển khoản</option>
                    <option value="credit_card">Thẻ tín dụng</option>
                    <option value="company_card">Thẻ công ty</option>
                    <option value="e_wallet">Ví điện tử</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thanh toán
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Chưa thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="reimbursed">Đã hoàn trả</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ưu tiên
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isReimbursable}
                    onChange={(e) => setFormData({ ...formData, isReimbursable: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Có thể hoàn trả</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isTaxDeductible}
                    onChange={(e) => setFormData({ ...formData, isTaxDeductible: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Được khấu trừ thuế</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả / Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingExpense(null); }}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingExpense ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
