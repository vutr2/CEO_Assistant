const employeeService = require('./employee.service');
const logger = require('../../utils/logger');

const getAllEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, department, status } = req.query;
    const result = await employeeService.getAllEmployees({ page, limit, department, status });

    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    logger.error('Error in getAllEmployees:', error);
    next(error);
  }
};

const getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployee(id);
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    logger.error('Error in getEmployee:', error);
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const employeeData = req.body;
    const employee = await employeeService.createEmployee(employeeData);
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    logger.error('Error in createEmployee:', error);
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const employee = await employeeService.updateEmployee(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    logger.error('Error in updateEmployee:', error);
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    await employeeService.deleteEmployee(id);
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteEmployee:', error);
    next(error);
  }
};

const getEmployeeStats = async (req, res, next) => {
  try {
    const stats = await employeeService.getEmployeeStats();

    res.status(200).json({
      success: true,
      ...stats
    });
  } catch (error) {
    logger.error('Error in getEmployeeStats:', error);
    next(error);
  }
};

const getTopPerformers = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const performers = await employeeService.getTopPerformers(parseInt(limit));

    res.status(200).json({
      success: true,
      ...performers
    });
  } catch (error) {
    logger.error('Error in getTopPerformers:', error);
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const departments = await employeeService.getDepartments();

    res.status(200).json({
      success: true,
      ...departments
    });
  } catch (error) {
    logger.error('Error in getDepartments:', error);
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  getTopPerformers,
  getDepartments
};
