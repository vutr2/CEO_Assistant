'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Download, Calendar, CheckCircle, XCircle, Clock, Receipt, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { billingAPI } from '@/lib/api';

const paymentHistoryMock = [
  {
    id: 'INV-2026-001',
    date: '2026-01-01',
    description: 'Gói Premium - Tháng 1/2026',
    amount: 2500000,
    status: 'paid',
    method: 'Visa •••• 4242',
    invoice: '#INV-2026-001'
  },
  {
    id: 'INV-2025-012',
    date: '2025-12-01',
    description: 'Gói Premium - Tháng 12/2025',
    amount: 2500000,
    status: 'paid',
    method: 'Visa •••• 4242',
    invoice: '#INV-2025-012'
  },
  {
    id: 'INV-2025-011',
    date: '2025-11-01',
    description: 'Gói Premium - Tháng 11/2025',
    amount: 2500000,
    status: 'paid',
    method: 'Visa •••• 4242',
    invoice: '#INV-2025-011'
  },
  {
    id: 'INV-2025-010',
    date: '2025-10-01',
    description: 'Gói Premium - Tháng 10/2025',
    amount: 2500000,
    status: 'paid',
    method: 'Visa •••• 4242',
    invoice: '#INV-2025-010'
  },
  {
    id: 'INV-2025-09',
    date: '2025-09-01',
    description: 'Gói Premium - Tháng 9/2025',
    amount: 2500000,
    status: 'paid',
    method: 'Visa •••• 4242',
    invoice: '#INV-2025-09'
  },
  {
    id: 'INV-2025-08',
    date: '2025-08-01',
    description: 'Gói Premium - Tháng 8/2025',
    amount: 2500000,
    status: 'failed',
    method: 'Visa •••• 4242',
    invoice: '#INV-2025-08'
  },
  {
    id: 'INV-2024-012',
    date: '2024-12-01',
    description: 'Gói Premium - Tháng 12/2024',
    amount: 2500000,
    status: 'paid',
    method: 'Visa •••• 4242',
    invoice: '#INV-2024-012'
  },
  {
    id: 'INV-2024-011',
    date: '2024-11-01',
    description: 'Gói Premium - Tháng 11/2024',
    amount: 2500000,
    status: 'failed',
    method: 'Visa •••• 4242',
    invoice: '#INV-2024-011'
  }
];

const initialPaymentMethodsMock = [
  {
    id: 1,
    type: 'visa',
    last4: '4242',
    expiry: '12/2025',
    isDefault: true
  },
  {
    id: 2,
    type: 'mastercard',
    last4: '8888',
    expiry: '08/2024',
    isDefault: false
  }
];

export default function BillingPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        const [historyData, methodsData] = await Promise.all([
          billingAPI.getPaymentHistory(),
          billingAPI.getPaymentMethods(),
        ]);

        setPaymentHistory(historyData.data || paymentHistoryMock);
        setPaymentMethods(methodsData.data || initialPaymentMethodsMock);
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setPaymentHistory(paymentHistoryMock);
        setPaymentMethods(initialPaymentMethodsMock);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Đã thanh toán</Badge>;
      case 'pending':
        return <Badge variant="warning">Chờ xử lý</Badge>;
      case 'failed':
        return <Badge variant="danger">Thất bại</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  // Filter payments based on selected period
  const getFilteredPayments = () => {
    if (selectedPeriod === 'all') return paymentHistory;

    const now = new Date();
    const filterDate = new Date();

    switch (selectedPeriod) {
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return paymentHistory;
    }

    return paymentHistory.filter(p => new Date(p.date) >= filterDate);
  };

  const filteredPayments = getFilteredPayments();

  // Calculate stats based on filtered data
  const totalPaid = filteredPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulPayments = filteredPayments.filter(p => p.status === 'paid').length;
  const failedPayments = filteredPayments.filter(p => p.status === 'failed').length;

  // Handler functions
  const handleAddCard = () => {
    alert('Tính năng thêm thẻ mới sẽ mở modal nhập thông tin thẻ');
  };

  const handleSetDefault = (methodId) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    alert('Đã đặt thẻ làm phương thức thanh toán mặc định');
  };

  const handleDeleteCard = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method.isDefault) {
      alert('Không thể xóa thẻ mặc định. Vui lòng đặt thẻ khác làm mặc định trước.');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa thẻ ${method.type} •••• ${method.last4}?`)) {
      setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
      alert('Đã xóa thẻ thành công');
    }
  };

  const handleDownloadInvoice = (invoiceId) => {
    alert(`Đang tải xuống hóa đơn ${invoiceId}...`);
    // Simulate download
    console.log('Download invoice:', invoiceId);
  };

  const handleExportReport = () => {
    // Filter data based on selected period
    const filteredData = getFilteredPayments();

    // Create CSV content
    const headers = ['Hóa đơn', 'Ngày', 'Mô tả', 'Phương thức', 'Số tiền', 'Trạng thái'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(p => [
        p.invoice,
        formatDate(p.date),
        p.description,
        p.method,
        p.amount,
        p.status === 'paid' ? 'Đã thanh toán' : p.status === 'pending' ? 'Chờ xử lý' : 'Thất bại'
      ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-thanh-toan-${selectedPeriod}-${new Date().getTime()}.csv`;
    link.click();
  };

  const handleUpdateBillingInfo = () => {
    alert('Tính năng cập nhật thông tin xuất hóa đơn sẽ mở form chỉnh sửa');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CreditCard className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thanh toán & Hóa đơn</h2>
            <p className="text-sm text-gray-600">Quản lý phương thức thanh toán và lịch sử hóa đơn</p>
          </div>
        </div>
      </div>

      {/* Current Plan Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Gói Premium</h3>
            <p className="text-blue-100 mt-1">Đang hoạt động</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success" className="bg-white text-green-600">Đã thanh toán</Badge>
            <button
              onClick={() => router.push('/payment?plan=premium')}
              className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Sparkles size={18} />
              Nâng cấp gói
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Giá hiện tại</p>
            <p className="text-2xl font-bold">{formatCurrency(2500000)}/tháng</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Ngày gia hạn tiếp theo</p>
            <p className="text-lg font-semibold">01/02/2024</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Phương thức thanh toán</p>
            <p className="text-lg font-semibold">Visa •••• 4242</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Phương thức thanh toán</h3>
          <Button variant="primary" size="sm" onClick={handleAddCard}>
            Thêm thẻ mới
          </Button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-white" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {method.type} •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <Badge variant="primary" size="sm">Mặc định</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Hết hạn {method.expiry}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                    Đặt mặc định
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleDeleteCard(method.id)}>
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Thanh toán thành công</p>
              <p className="text-2xl font-bold text-gray-900">
                {successfulPayments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Thanh toán thất bại</p>
              <p className="text-2xl font-bold text-gray-900">
                {failedPayments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Lịch sử thanh toán</h3>
            <p className="text-sm text-gray-600 mt-1">
              Hiển thị {filteredPayments.length} / {paymentHistory.length} giao dịch
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm này</option>
            </select>

            <Button variant="outline" size="sm" icon={Download} onClick={handleExportReport}>
              Xuất báo cáo
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hóa đơn</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mô tả</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phương thức</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số tiền</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className="font-medium text-gray-900">{payment.invoice}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        {formatDate(payment.date)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{payment.description}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{payment.method}</td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Download}
                        onClick={() => handleDownloadInvoice(payment.invoice)}
                      >
                        Tải xuống
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                    Không có giao dịch nào trong khoảng thời gian này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin xuất hóa đơn</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Tên công ty</p>
            <p className="text-gray-900">CEO AI Assistant Corp</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Mã số thuế</p>
            <p className="text-gray-900">0123456789</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-700 mb-1">Địa chỉ</p>
            <p className="text-gray-900">123 Đường ABC, Quận 1, TP.HCM</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
            <p className="text-gray-900">info@ceoai.vn</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Số điện thoại</p>
            <p className="text-gray-900">028 1234 5678</p>
          </div>
        </div>

        <Button variant="outline" onClick={handleUpdateBillingInfo}>
          Cập nhật thông tin
        </Button>
      </div>
    </div>
  );
}
