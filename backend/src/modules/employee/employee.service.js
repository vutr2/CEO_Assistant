// Multi-tenant Employee Service using MongoDB

const Employee = require('../../models/Employee');
const logger = require('../../utils/logger');

class EmployeeService {
  /**
   * Get all employees for a company
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  async getAllEmployees(companyId, { page = 1, limit = 20, department, status, search } = {}) {
    logger.info('Getting all employees', { companyId, page, limit, department, status });

    const query = {};

    if (companyId) {
      query.companyId = companyId;
    }

    // Filter by department
    if (department && department !== 'all') {
      query.department = department;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Employee.countDocuments(query)
    ]);

    return {
      data: employees.map(emp => ({
        id: emp._id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        position: emp.position,
        status: emp.status,
        performance: emp.performance?.score || 0,
        avatar: emp.avatar,
        createdAt: emp.createdAt
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  /**
   * Get single employee by ID
   */
  async getEmployee(companyId, id) {
    logger.info('Getting employee', { companyId, id });

    const query = { _id: id };
    if (companyId) {
      query.companyId = companyId;
    }

    const employee = await Employee.findOne(query);

    if (!employee) {
      throw new Error('Nhân viên không tồn tại');
    }

    return {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      status: employee.status,
      performance: employee.performance?.score || 0,
      salary: employee.salary,
      startDate: employee.startDate,
      employmentType: employee.employmentType,
      avatar: employee.avatar,
      address: employee.address,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      emergencyContact: employee.emergencyContact,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };
  }

  /**
   * Create new employee
   */
  async createEmployee(companyId, employeeData) {
    logger.info('Creating employee', { companyId, name: employeeData.name });

    if (!companyId) {
      throw new Error('Company ID is required to create an employee');
    }

    // Check if email already exists in company
    if (employeeData.email) {
      const existingEmployee = await Employee.findOne({
        companyId,
        email: employeeData.email.toLowerCase()
      });

      if (existingEmployee) {
        throw new Error('Email đã được sử dụng trong công ty');
      }
    }

    const newEmployee = await Employee.create({
      companyId,
      name: employeeData.name,
      email: employeeData.email?.toLowerCase(),
      phone: employeeData.phone || '',
      department: employeeData.department,
      position: employeeData.position,
      status: employeeData.status || 'active',
      employmentType: employeeData.employmentType || 'full-time',
      startDate: employeeData.startDate || new Date(),
      salary: employeeData.salary,
      performance: {
        score: employeeData.performance || 0
      }
    });

    logger.info('Employee created successfully', { id: newEmployee._id, name: newEmployee.name });

    return {
      id: newEmployee._id,
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      department: newEmployee.department,
      position: newEmployee.position,
      status: newEmployee.status,
      performance: newEmployee.performance?.score || 0,
      createdAt: newEmployee.createdAt
    };
  }

  /**
   * Update employee
   */
  async updateEmployee(companyId, id, updates) {
    logger.info('Updating employee', { companyId, id });

    const query = { _id: id };
    if (companyId) {
      query.companyId = companyId;
    }

    // If email is being updated, check for duplicates
    if (updates.email) {
      const existingEmployee = await Employee.findOne({
        companyId,
        email: updates.email.toLowerCase(),
        _id: { $ne: id }
      });

      if (existingEmployee) {
        throw new Error('Email đã được sử dụng');
      }

      updates.email = updates.email.toLowerCase();
    }

    // Handle performance update
    if (updates.performance !== undefined) {
      updates['performance.score'] = updates.performance;
      delete updates.performance;
    }

    const employee = await Employee.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true }
    );

    if (!employee) {
      throw new Error('Nhân viên không tồn tại');
    }

    logger.info('Employee updated successfully', { id, name: employee.name });

    return {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      status: employee.status,
      performance: employee.performance?.score || 0,
      updatedAt: employee.updatedAt
    };
  }

  /**
   * Delete employee (soft delete)
   */
  async deleteEmployee(companyId, id) {
    logger.info('Deleting employee', { companyId, id });

    const query = { _id: id };
    if (companyId) {
      query.companyId = companyId;
    }

    const employee = await Employee.findOneAndUpdate(
      query,
      {
        $set: {
          status: 'terminated',
          endDate: new Date()
        }
      },
      { new: true }
    );

    if (!employee) {
      throw new Error('Nhân viên không tồn tại');
    }

    logger.info('Employee deleted successfully', { id, name: employee.name });

    return { success: true };
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStats(companyId) {
    logger.info('Getting employee stats', { companyId });

    const query = companyId ? { companyId } : {};

    const [total, active, onLeave, newHires] = await Promise.all([
      Employee.countDocuments({ ...query, status: { $ne: 'terminated' } }),
      Employee.countDocuments({ ...query, status: 'active' }),
      Employee.countDocuments({ ...query, status: 'leave' }),
      Employee.countDocuments({
        ...query,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    return {
      data: [
        {
          title: 'Tổng nhân viên',
          value: total.toString(),
          change: '+0%',
          trend: 'neutral',
          color: 'blue',
          iconName: 'Users'
        },
        {
          title: 'Đang làm việc',
          value: active.toString(),
          change: '+0%',
          trend: 'neutral',
          color: 'green',
          iconName: 'UserCheck'
        },
        {
          title: 'Nhân viên mới',
          value: newHires.toString(),
          change: `+${newHires}`,
          trend: newHires > 0 ? 'up' : 'neutral',
          color: 'orange',
          iconName: 'Calendar'
        },
        {
          title: 'Nghỉ phép',
          value: onLeave.toString(),
          change: '0',
          trend: 'neutral',
          color: 'red',
          iconName: 'UserX'
        }
      ]
    };
  }

  /**
   * Get top performers
   */
  async getTopPerformers(companyId, limit = 5) {
    logger.info('Getting top performers', { companyId, limit });

    const query = { status: 'active' };
    if (companyId) {
      query.companyId = companyId;
    }

    const topPerformers = await Employee.find(query)
      .sort({ 'performance.score': -1 })
      .limit(parseInt(limit))
      .select('name department performance.score');

    return {
      data: topPerformers.map(emp => ({
        name: emp.name,
        department: emp.department,
        score: emp.performance?.score || 0
      }))
    };
  }

  /**
   * Get department statistics
   */
  async getDepartments(companyId) {
    logger.info('Getting departments', { companyId });

    const matchStage = { status: { $ne: 'terminated' } };
    if (companyId) {
      matchStage.companyId = companyId;
    }

    const departments = await Employee.aggregate([
      { $match: matchStage },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const deptLabels = {
      'Technology': 'Công nghệ',
      'Marketing': 'Marketing',
      'Sales': 'Kinh doanh',
      'HR': 'Nhân sự',
      'Design': 'Thiết kế',
      'Finance': 'Tài chính',
      'Operations': 'Vận hành'
    };

    return {
      data: departments.map(dept => ({
        name: dept._id || 'Unknown',
        label: deptLabels[dept._id] || dept._id || 'Khác',
        count: dept.count
      }))
    };
  }
}

module.exports = new EmployeeService();
