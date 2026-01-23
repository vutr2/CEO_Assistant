import React from 'react';
import { Mail, Phone, MapPin, MoreVertical } from 'lucide-react';
import Badge from '../ui/Badge';

export default function EmployeeCard({
  name,
  position,
  department,
  email,
  phone,
  location,
  avatar,
  status = 'active',
  performance
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600">{position}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {department && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="primary">{department}</Badge>
            <Badge variant={status === 'active' ? 'success' : 'default'}>
              {status === 'active' ? 'Đang làm việc' : 'Nghỉ'}
            </Badge>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} />
            <span>{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={16} />
            <span>{phone}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
        )}
      </div>

      {performance && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Hiệu suất</span>
            <span className="text-sm font-medium text-gray-900">{performance}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                performance >= 80 ? 'bg-green-500' : performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${performance}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
