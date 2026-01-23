/**
 * Multi-tenant Employee Service
 *
 * USE THIS FILE WHEN YOU ENABLE MONGODB
 * Replace employee.service.js with this file
 */

const { Employee } = require('../../models');
const logger = require('../../utils/logger');

class EmployeeServiceMultitenant {
  /**
   * Get all employees for a company
   * @param {ObjectId} companyId - Company ID from tenant middleware
   * @param {Object} options - Query options
   */
  async getAllEmployees(companyId, { page = 1, limit = 20, department, status, search }) {
    logger.info('Getting all employees', { companyId, page, limit, department, status });

    // Build query filter with companyId
    const filter = { companyId };

    // Filter by department
    if (department && department !== 'all') {
      filter.department = department;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Employee.countDocuments(filter)
    ]);

    return {
      data: employees,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  /**
   * Get single employee by ID
   * @param {ObjectId} companyId - Company ID
   * @param {string} employeeId - Employee ID
   */
  async getEmployee(companyId, employeeId) {
    logger.info('Getting employee', { companyId, employeeId });

    const employee = await Employee.findOne({
      _id: employeeId,
      companyId
    }).lean();

    if (!employee) {
      throw new Error('Nhân viên không tồn tại');
    }

    return employee;
  }

  /**
   * Create new employee
   * @param {ObjectId} companyId - Company ID
   * @param {Object} employeeData - Employee data
   */
  async createEmployee(companyId, employeeData) {
    logger.info('Creating employee', { companyId, name: employeeData.name });

    // Check if email already exists in company
    const existingEmployee = await Employee.findOne({
      companyId,
      email: employeeData.email.toLowerCase()
    });

    if (existingEmployee) {
      throw new Error('Email đã được sử dụng trong công ty');
    }

    const newEmployee = await Employee.create({
      ...employeeData,
      companyId,
      email: employeeData.email.toLowerCase()
    });

    logger.info('Employee created successfully', { id: newEmployee._id, name: newEmployee.name });

    return newEmployee;
  }

  /**
   * Update employee
   * @param {ObjectId} companyId - Company ID
   * @param {string} employeeId - Employee ID
   * @param {Object} updates - Update data
   */
  async updateEmployee(companyId, employeeId, updates) {
    logger.info('Updating employee', { companyId, employeeId });

    // Don't allow changing companyId
    delete updates.companyId;

    // If email is being updated, check for duplicates
    if (updates.email) {
      const existingEmployee = await Employee.findOne({
        companyId,
        email: updates.email.toLowerCase(),
        _id: { $ne: employeeId }
      });

      if (existingEmployee) {
        throw new Error('Email đã được sử dụng');
      }

      updates.email = updates.email.toLowerCase();
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: employeeId, companyId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!employee) {
      throw new Error('Nhân viên không tồn tại');
    }

    logger.info('Employee updated successfully', { id: employee._id, name: employee.name });

    return employee;
  }

  /**
   * Delete employee (soft delete)
   * @param {ObjectId} companyId - Company ID
   * @param {string} employeeId - Employee ID
   */
  async deleteEmployee(companyId, employeeId) {
    logger.info('Deleting employee', { companyId, employeeId });

    const employee = await Employee.findOneAndUpdate(
      { _id: employeeId, companyId },
      { $set: { status: 'inactive', deletedAt: new Date() } },
      { new: true }
    );

    if (!employee) {
      throw new Error('Nhân viên không tồn tại');
    }

    logger.info('Employee deleted successfully', { id: employee._id, name: employee.name });

    return { success: true };
  }

  /**
   * Get employee statistics for dashboard
   * @param {ObjectId} companyId - Company ID
   */
  async getEmployeeStats(companyId) {
    logger.info('Getting employee stats', { companyId });

    const [
      total,
      active,
      onLeave,
      newHires
    ] = await Promise.all([
      Employee.countDocuments({ companyId }),
      Employee.countDocuments({ companyId, status: 'active' }),
      Employee.countDocuments({ companyId, status: 'leave' }),
      Employee.countDocuments({
        companyId,
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      })
    ]);

    // Calculate changes (in real app, compare with previous period)
    return {
      data: [
        {
          title: 'Tổng nhân viên',
          value: total.toString(),
          change: '+12%',
          trend: 'up',
          color: 'blue',
          iconName: 'Users'
        },
        {
          title: 'Đang làm việc',
          value: active.toString(),
          change: '+5%',
          trend: 'up',
          color: 'green',
          iconName: 'UserCheck'
        },
        {
          title: 'Nhân viên mới',
          value: newHires.toString(),
          change: `+${newHires}`,
          trend: 'up',
          color: 'orange',
          iconName: 'Calendar'
        },
        {
          title: 'Nghỉ phép',
          value: onLeave.toString(),
          change: '-1',
          trend: 'down',
          color: 'red',
          iconName: 'UserX'
        }
      ]
    };
  }

  /**
   * Get top performers
   * @param {ObjectId} companyId - Company ID
   * @param {number} limit - Number of employees to return
   */
  async getTopPerformers(companyId, limit = 5) {
    logger.info('Getting top performers', { companyId, limit });

    const employees = await Employee.find({
      companyId,
      status: 'active'
    })
      .sort({ performance: -1 })
      .limit(limit)
      .select('name department performance avatar')
      .lean();

    return {
      data: employees.map(emp => ({
        name: emp.name,
        department: emp.department,
        score: emp.performance || 0,
        avatar: emp.avatar
      }))
    };
  }

  /**
   * Get department statistics
   * @param {ObjectId} companyId - Company ID
   */
  async getDepartments(companyId) {
    logger.info('Getting departments', { companyId });

    const departments = await Employee.aggregate([
      { $match: { companyId, status: { $ne: 'inactive' } } },
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
        name: dept._id,
        label: deptLabels[dept._id] || dept._id,
        count: dept.count
      }))
    };
  }

  /**
   * Bulk import employees
   * @param {ObjectId} companyId - Company ID
   * @param {Array} employees - Array of employee data
   */
  async bulkImport(companyId, employees) {
    logger.info('Bulk importing employees', { companyId, count: employees.length });

    // Add companyId to all employees
    const employeesWithCompany = employees.map(emp => ({
      ...emp,
      companyId,
      email: emp.email.toLowerCase()
    }));

    // Insert many with ordered: false to continue on errors
    const result = await Employee.insertMany(employeesWithCompany, {
      ordered: false
    }).catch(err => {
      // Handle duplicate key errors
      if (err.writeErrors) {
        return {
          insertedCount: err.result?.nInserted || 0,
          errors: err.writeErrors.map(e => e.errmsg)
        };
      }
      throw err;
    });

    return {
      success: true,
      insertedCount: result.insertedCount || result.length,
      errors: result.errors || []
    };
  }
}

module.exports = new EmployeeServiceMultitenant();
