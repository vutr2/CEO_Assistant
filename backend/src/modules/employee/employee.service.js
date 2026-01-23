// Multi-tenant Employee Service
// Data is stored per company using companyId as key

const logger = require('../../utils/logger');

const dataByCompany = {};
let employeeIdCounter = 1;

// Initialize company data if not exists
const initCompanyData = (companyId) => {
  const key = companyId?.toString() || 'default';
  if (!dataByCompany[key]) {
    dataByCompany[key] = {
      employees: []
    };
    generateMockEmployeesForCompany(key);
  }
  return dataByCompany[key];
};

// Generate mock employees for a company
const generateMockEmployeesForCompany = (companyKey) => {
  const data = dataByCompany[companyKey];

  data.employees = [
    { id: employeeIdCounter++, companyId: companyKey, name: 'Nguyễn Văn An', email: 'an.nguyen@company.com', phone: '0901234567', department: 'Technology', position: 'Senior Developer', status: 'active', performance: 95 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Trần Thị Bình', email: 'binh.tran@company.com', phone: '0901234568', department: 'Technology', position: 'Tech Lead', status: 'active', performance: 98 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Lê Văn Cường', email: 'cuong.le@company.com', phone: '0901234569', department: 'Technology', position: 'Full Stack Developer', status: 'active', performance: 92 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Phạm Thị Dung', email: 'dung.pham@company.com', phone: '0901234570', department: 'Marketing', position: 'Marketing Manager', status: 'active', performance: 96 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Hoàng Văn Em', email: 'em.hoang@company.com', phone: '0901234571', department: 'Marketing', position: 'Content Writer', status: 'active', performance: 88 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Vũ Thị Phượng', email: 'phuong.vu@company.com', phone: '0901234572', department: 'Sales', position: 'Sales Manager', status: 'active', performance: 94 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Đặng Văn Giang', email: 'giang.dang@company.com', phone: '0901234573', department: 'Sales', position: 'Senior Sales', status: 'active', performance: 90 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Bùi Thị Hoa', email: 'hoa.bui@company.com', phone: '0901234574', department: 'HR', position: 'HR Manager', status: 'active', performance: 93 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Trịnh Văn Ích', email: 'ich.trinh@company.com', phone: '0901234575', department: 'HR', position: 'Recruiter', status: 'active', performance: 87 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Lý Thị Kim', email: 'kim.ly@company.com', phone: '0901234576', department: 'Design', position: 'UI/UX Designer', status: 'active', performance: 91 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Ngô Văn Long', email: 'long.ngo@company.com', phone: '0901234577', department: 'Design', position: 'Graphic Designer', status: 'leave', performance: 89 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Mai Thị Minh', email: 'minh.mai@company.com', phone: '0901234578', department: 'Finance', position: 'Accountant', status: 'active', performance: 92 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Đỗ Văn Nam', email: 'nam.do@company.com', phone: '0901234579', department: 'Finance', position: 'Financial Analyst', status: 'active', performance: 90 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Võ Thị Oanh', email: 'oanh.vo@company.com', phone: '0901234580', department: 'Operations', position: 'Operations Manager', status: 'active', performance: 94 },
    { id: employeeIdCounter++, companyId: companyKey, name: 'Tô Văn Phúc', email: 'phuc.to@company.com', phone: '0901234581', department: 'Operations', position: 'Logistics Coordinator', status: 'active', performance: 86 },
  ];
};

class EmployeeService {
  /**
   * Get all employees for a company
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  async getAllEmployees(companyId, { page = 1, limit = 20, department, status, search } = {}) {
    logger.info('Getting all employees', { companyId, page, limit, department, status });

    const data = initCompanyData(companyId);
    let filtered = [...data.employees];

    // Filter by department
    if (department && department !== 'all') {
      filtered = filtered.filter(emp => emp.department === department);
    }

    // Filter by status
    if (status) {
      filtered = filtered.filter(emp => emp.status === status);
    }

    // Search by name or email
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filtered.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filtered.length / parseInt(limit))
    };
  }

  /**
   * Get single employee by ID
   */
  async getEmployee(companyId, id) {
    logger.info('Getting employee', { companyId, id });

    const data = initCompanyData(companyId);
    const employee = data.employees.find(emp => emp.id === parseInt(id));

    if (!employee) {
      throw new Error('Nhân viên không tồn tại');
    }

    return employee;
  }

  /**
   * Create new employee
   */
  async createEmployee(companyId, employeeData) {
    logger.info('Creating employee', { companyId, name: employeeData.name });

    const data = initCompanyData(companyId);

    // Check if email already exists in company
    const existingEmployee = data.employees.find(
      emp => emp.email.toLowerCase() === employeeData.email.toLowerCase()
    );

    if (existingEmployee) {
      throw new Error('Email đã được sử dụng trong công ty');
    }

    const newEmployee = {
      id: employeeIdCounter++,
      companyId,
      name: employeeData.name,
      email: employeeData.email.toLowerCase(),
      phone: employeeData.phone || '',
      department: employeeData.department,
      position: employeeData.position,
      status: employeeData.status || 'active',
      performance: Math.floor(Math.random() * 20) + 80,
      createdAt: new Date().toISOString()
    };

    data.employees.push(newEmployee);

    logger.info('Employee created successfully', { id: newEmployee.id, name: newEmployee.name });

    return newEmployee;
  }

  /**
   * Update employee
   */
  async updateEmployee(companyId, id, updates) {
    logger.info('Updating employee', { companyId, id });

    const data = initCompanyData(companyId);
    const index = data.employees.findIndex(emp => emp.id === parseInt(id));

    if (index === -1) {
      throw new Error('Nhân viên không tồn tại');
    }

    // If email is being updated, check for duplicates
    if (updates.email) {
      const existingEmployee = data.employees.find(
        emp => emp.email.toLowerCase() === updates.email.toLowerCase() && emp.id !== parseInt(id)
      );

      if (existingEmployee) {
        throw new Error('Email đã được sử dụng');
      }

      updates.email = updates.email.toLowerCase();
    }

    data.employees[index] = {
      ...data.employees[index],
      ...updates,
      id: parseInt(id),
      companyId,
      updatedAt: new Date().toISOString()
    };

    logger.info('Employee updated successfully', { id, name: data.employees[index].name });

    return data.employees[index];
  }

  /**
   * Delete employee (soft delete)
   */
  async deleteEmployee(companyId, id) {
    logger.info('Deleting employee', { companyId, id });

    const data = initCompanyData(companyId);
    const index = data.employees.findIndex(emp => emp.id === parseInt(id));

    if (index === -1) {
      throw new Error('Nhân viên không tồn tại');
    }

    // Soft delete - set status to inactive
    data.employees[index].status = 'inactive';
    data.employees[index].deletedAt = new Date().toISOString();

    logger.info('Employee deleted successfully', { id, name: data.employees[index].name });

    return { success: true };
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStats(companyId) {
    logger.info('Getting employee stats', { companyId });

    const data = initCompanyData(companyId);
    const employees = data.employees.filter(emp => emp.status !== 'inactive');

    const total = employees.length;
    const active = employees.filter(emp => emp.status === 'active').length;
    const onLeave = employees.filter(emp => emp.status === 'leave').length;
    const newHires = employees.filter(emp => {
      if (!emp.createdAt) return false;
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(emp.createdAt) >= oneMonthAgo;
    }).length;

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
   */
  async getTopPerformers(companyId, limit = 5) {
    logger.info('Getting top performers', { companyId, limit });

    const data = initCompanyData(companyId);
    const sorted = [...data.employees]
      .filter(emp => emp.status === 'active')
      .sort((a, b) => b.performance - a.performance)
      .slice(0, limit);

    return {
      data: sorted.map(emp => ({
        name: emp.name,
        department: emp.department,
        score: emp.performance
      }))
    };
  }

  /**
   * Get department statistics
   */
  async getDepartments(companyId) {
    logger.info('Getting departments', { companyId });

    const data = initCompanyData(companyId);
    const departments = {};

    data.employees
      .filter(emp => emp.status !== 'inactive')
      .forEach(emp => {
        if (!departments[emp.department]) {
          departments[emp.department] = 0;
        }
        departments[emp.department]++;
      });

    const deptLabels = {
      'Technology': 'Công nghệ',
      'Marketing': 'Marketing',
      'Sales': 'Kinh doanh',
      'HR': 'Nhân sự',
      'Design': 'Thiết kế',
      'Finance': 'Tài chính',
      'Operations': 'Vận hành'
    };

    const deptData = Object.entries(departments).map(([name, count]) => ({
      name: name,
      label: deptLabels[name] || name,
      count: count
    }));

    return {
      data: deptData
    };
  }
}

module.exports = new EmployeeService();
