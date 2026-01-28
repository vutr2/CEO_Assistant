'use client';

import { useState, useEffect } from 'react';
import { salesAPI, expensesAPI } from '@/lib/api';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ApprovalsPage() {
  const [pendingSales, setPendingSales] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [rejectModal, setRejectModal] = useState({ show: false, type: '', id: '' });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const [salesRes, expensesRes] = await Promise.all([
        salesAPI.getPending(),
        expensesAPI.getPending()
      ]);
      setPendingSales(salesRes.data || []);
      setPendingExpenses(expensesRes.data || []);
    } catch (error) {
      console.error('Error fetching pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSale = async (id) => {
    try {
      await salesAPI.approve(id);
      fetchPendingItems();
      alert('Đã duyệt giao dịch và đồng bộ sang Tài chính!');
    } catch (error) {
      console.error('Error approving sale:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const handleApproveExpense = async (id) => {
    try {
      await expensesAPI.approve(id);
      fetchPendingItems();
      alert('Đã duyệt chi phí và đồng bộ sang Tài chính!');
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const handleReject = async () => {
    try {
      if (rejectModal.type === 'sale') {
        await salesAPI.reject(rejectModal.id, rejectReason);
      } else {
        await expensesAPI.reject(rejectModal.id, rejectReason);
      }
      setRejectModal({ show: false, type: '', id: '' });
      setRejectReason('');
      fetchPendingItems();
      alert('Đã từ chối yêu cầu!');
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Lỗi: ' + error.message);
    }
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
      product: 'Sản phẩm',
      service: 'Dịch vụ',
      subscription: 'Thuê bao',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalPending = pendingSales.length + pendingExpenses.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Duyệt yêu cầu</h1>
        <p className="text-gray-600">Phê duyệt các giao dịch bán hàng và chi phí từ nhân viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng chờ duyệt</p>
              <p className="text-xl font-bold">{totalPending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Bán hàng chờ duyệt</p>
              <p className="text-xl font-bold">{pendingSales.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Receipt className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chi phí chờ duyệt</p>
              <p className="text-xl font-bold">{pendingExpenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={18} />
                Bán hàng ({pendingSales.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Receipt size={18} />
                Chi phí ({pendingExpenses.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="p-4">
            {pendingSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Không có giao dịch bán hàng nào cần duyệt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSales.map((sale) => (
                  <div key={sale._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{sale.title}</h3>
                        <p className="text-sm text-gray-500">{sale.description}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {sale.user?.name || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {formatCurrency(sale.amount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(sale.saleDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {getCategoryLabel(sale.category)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Khách hàng: <strong>{sale.customerName}</strong>
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApproveSale(sale._id)}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <CheckCircle size={16} />
                          Duyệt
                        </button>
                        <button
                          onClick={() => setRejectModal({ show: true, type: 'sale', id: sale._id })}
                          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          <XCircle size={16} />
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="p-4">
            {pendingExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Không có chi phí nào cần duyệt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingExpenses.map((expense) => (
                  <div key={expense._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{expense.title}</h3>
                        <p className="text-sm text-gray-500">{expense.description}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {expense.user?.name || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {formatCurrency(expense.amount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(expense.expenseDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {getCategoryLabel(expense.category)}
                          </span>
                        </div>
                        {expense.vendor && (
                          <p className="mt-1 text-sm text-gray-600">
                            Nhà cung cấp: <strong>{expense.vendor}</strong>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApproveExpense(expense._id)}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <CheckCircle size={16} />
                          Duyệt
                        </button>
                        <button
                          onClick={() => setRejectModal({ show: true, type: 'expense', id: expense._id })}
                          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          <XCircle size={16} />
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold">Từ chối yêu cầu</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Vui lòng nhập lý do từ chối để nhân viên biết và chỉnh sửa.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="Lý do từ chối..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModal({ show: false, type: '', id: '' });
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
