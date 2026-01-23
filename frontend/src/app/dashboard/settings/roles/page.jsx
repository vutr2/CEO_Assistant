'use client';

import { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Users, Check, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

const initialRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Quản trị viên có toàn quyền truy cập',
    userCount: 2,
    permissions: {
      dashboard: ['view', 'edit'],
      finance: ['view', 'edit', 'delete', 'export'],
      people: ['view', 'edit', 'delete'],
      reports: ['view', 'create', 'edit', 'delete'],
      settings: ['view', 'edit']
    },
    isSystem: true
  },
  {
    id: 2,
    name: 'Quản lý',
    description: 'Quản lý nhân viên và dự án',
    userCount: 5,
    permissions: {
      dashboard: ['view'],
      finance: ['view'],
      people: ['view', 'edit'],
      reports: ['view', 'create'],
      settings: ['view']
    },
    isSystem: false
  },
  {
    id: 3,
    name: 'Nhân viên',
    description: 'Người dùng cơ bản',
    userCount: 43,
    permissions: {
      dashboard: ['view'],
      finance: [],
      people: ['view'],
      reports: ['view'],
      settings: []
    },
    isSystem: false
  }
];

const permissionModules = [
  {
    id: 'dashboard',
    name: 'Tổng quan',
    actions: ['view', 'edit']
  },
  {
    id: 'finance',
    name: 'Tài chính',
    actions: ['view', 'edit', 'delete', 'export']
  },
  {
    id: 'people',
    name: 'Nhân sự',
    actions: ['view', 'edit', 'delete']
  },
  {
    id: 'reports',
    name: 'Báo cáo',
    actions: ['view', 'create', 'edit', 'delete']
  },
  {
    id: 'settings',
    name: 'Cài đặt',
    actions: ['view', 'edit']
  }
];

const actionLabels = {
  view: 'Xem',
  create: 'Tạo',
  edit: 'Chỉnh sửa',
  delete: 'Xóa',
  export: 'Xuất dữ liệu'
};

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {}
  });

  const handleAddRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: {}
    });
    setIsModalOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setIsModalOpen(true);
  };

  const handleDeleteRole = (roleId) => {
    if (confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
      setRoles(roles.filter(role => role.id !== roleId));
    }
  };

  const handlePermissionToggle = (moduleId, action) => {
    setFormData(prev => {
      const modulePermissions = prev.permissions[moduleId] || [];
      const hasPermission = modulePermissions.includes(action);

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: hasPermission
            ? modulePermissions.filter(a => a !== action)
            : [...modulePermissions, action]
        }
      };
    });
  };

  const handleSaveRole = () => {
    if (editingRole) {
      // Update existing role
      setRoles(roles.map(role =>
        role.id === editingRole.id
          ? { ...role, ...formData }
          : role
      ));
    } else {
      // Add new role
      setRoles([...roles, {
        id: Date.now(),
        ...formData,
        userCount: 0,
        isSystem: false
      }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Vai trò & Phân quyền</h2>
              <p className="text-sm text-gray-600">Quản lý vai trò người dùng và quyền truy cập</p>
            </div>
          </div>
          <Button variant="primary" icon={Plus} onClick={handleAddRole}>
            Thêm vai trò
          </Button>
        </div>
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-1 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                  {role.isSystem && (
                    <Badge variant="info">Hệ thống</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{role.userCount} người dùng</span>
                </div>
              </div>

              {!role.isSystem && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit2}
                    onClick={() => handleEditRole(role)}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    Xóa
                  </Button>
                </div>
              )}
            </div>

            {/* Permissions Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Module
                    </th>
                    {Object.values(actionLabels).map(label => (
                      <th key={label} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {permissionModules.map(module => (
                    <tr key={module.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {module.name}
                      </td>
                      {Object.keys(actionLabels).map(action => {
                        const hasAction = module.actions.includes(action);
                        const hasPermission = role.permissions[module.id]?.includes(action);

                        return (
                          <td key={action} className="px-4 py-3 text-center">
                            {hasAction ? (
                              hasPermission ? (
                                <Check size={18} className="text-green-600 mx-auto" />
                              ) : (
                                <X size={18} className="text-gray-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Role Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="Tên vai trò"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Nhập tên vai trò"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Nhập mô tả vai trò"
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Phân quyền</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Module
                    </th>
                    {Object.values(actionLabels).map(label => (
                      <th key={label} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {permissionModules.map(module => (
                    <tr key={module.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {module.name}
                      </td>
                      {Object.keys(actionLabels).map(action => {
                        const hasAction = module.actions.includes(action);
                        const hasPermission = formData.permissions[module.id]?.includes(action);

                        return (
                          <td key={action} className="px-4 py-3 text-center">
                            {hasAction ? (
                              <input
                                type="checkbox"
                                checked={hasPermission}
                                onChange={() => handlePermissionToggle(module.id, action)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveRole}>
            {editingRole ? 'Cập nhật' : 'Tạo vai trò'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
