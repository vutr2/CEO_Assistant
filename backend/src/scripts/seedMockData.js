/**
 * Mock Data Seed Script
 * Creates sample activities, sales, and expenses for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/env');
const Activity = require('../models/Activity');
const Sale = require('../models/Sale');
const CompanyExpense = require('../models/CompanyExpense');
const User = require('../models/User');
const Company = require('../models/Company');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data generators
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, daysAgo));
  return date;
};

const activityTypes = ['task', 'meeting', 'call', 'email', 'project'];
const activityCategories = ['sales', 'support', 'development', 'marketing', 'management'];
const activityStatuses = ['pending', 'in_progress', 'completed'];
const priorities = ['low', 'medium', 'high', 'urgent'];

const saleStatuses = ['lead', 'contacted', 'negotiating', 'won', 'lost'];
const paymentStatuses = ['pending', 'partial', 'paid'];
const saleCategories = ['product', 'service', 'subscription'];
const saleSources = ['website', 'phone', 'email', 'social_media', 'referral'];

const expenseCategories = ['office_supplies', 'travel', 'meals', 'utilities', 'marketing', 'equipment', 'software'];
const expenseStatuses = ['submitted', 'approved', 'rejected', 'paid'];

const activityTitles = [
  'Client meeting preparation',
  'Follow up with prospect',
  'Code review session',
  'Marketing campaign planning',
  'Weekly team standup',
  'Bug fix deployment',
  'Customer support ticket',
  'Product demo presentation',
  'Sales call with lead',
  'Project planning meeting'
];

const customerNames = [
  'Công ty ABC', 'Tập đoàn XYZ', 'TNHH DEF',
  'Cửa hàng GHI', 'Doanh nghiệp JKL', 'Công ty MNO',
  'Nhà hàng PQR', 'Khách sạn STU', 'Siêu thị VWX'
];

const vendors = [
  'Office Depot VN', 'Vinmart', 'Grab', 'FPT Software',
  'VNPay', 'Microsoft Vietnam', 'Google Workspace', 'Amazon Web Services'
];

// Seed Activities
const seedActivities = async (companyId, users) => {
  console.log('📝 Seeding activities...');

  const activities = [];

  for (let i = 0; i < 50; i++) {
    const user = users[getRandomInt(0, users.length - 1)];
    const status = activityStatuses[getRandomInt(0, activityStatuses.length - 1)];

    const activity = {
      companyId,
      userId: user._id,
      title: activityTitles[getRandomInt(0, activityTitles.length - 1)],
      description: 'Sample activity description for testing purposes',
      type: activityTypes[getRandomInt(0, activityTypes.length - 1)],
      category: activityCategories[getRandomInt(0, activityCategories.length - 1)],
      status,
      priority: priorities[getRandomInt(0, priorities.length - 1)],
      duration: getRandomInt(15, 240), // 15 mins to 4 hours
      date: getRandomDate(30),
      department: user.department
    };

    if (status === 'completed') {
      activity.completedAt = new Date(activity.date.getTime() + activity.duration * 60000);
    }

    activities.push(activity);
  }

  await Activity.insertMany(activities);
  console.log(`✅ Created ${activities.length} activities`);
};

// Seed Sales
const seedSales = async (companyId, users) => {
  console.log('💰 Seeding sales...');

  const sales = [];

  for (let i = 0; i < 40; i++) {
    const user = users[getRandomInt(0, users.length - 1)];
    const status = saleStatuses[getRandomInt(0, saleStatuses.length - 1)];
    const amount = getRandomInt(1000000, 100000000); // 1M - 100M VND

    const sale = {
      companyId,
      userId: user._id,
      title: `Deal ${i + 1} - ${customerNames[getRandomInt(0, customerNames.length - 1)]}`,
      description: 'Sample sale description',
      customerName: customerNames[getRandomInt(0, customerNames.length - 1)],
      customerEmail: `customer${i}@example.com`,
      customerPhone: `098${getRandomInt(1000000, 9999999)}`,
      amount,
      currency: 'VND',
      paymentMethod: 'bank_transfer',
      paymentStatus: status === 'won'
        ? paymentStatuses[getRandomInt(0, paymentStatuses.length - 1)]
        : 'pending',
      status,
      category: saleCategories[getRandomInt(0, saleCategories.length - 1)],
      source: saleSources[getRandomInt(0, saleSources.length - 1)],
      saleDate: getRandomDate(60),
      department: user.department
    };

    if (status === 'won') {
      sale.actualCloseDate = getRandomDate(7);
    }

    sales.push(sale);
  }

  await Sale.insertMany(sales);
  console.log(`✅ Created ${sales.length} sales`);
};

// Seed Expenses
const seedExpenses = async (companyId, users) => {
  console.log('💸 Seeding expenses...');

  const expenses = [];

  for (let i = 0; i < 45; i++) {
    const user = users[getRandomInt(0, users.length - 1)];
    const status = expenseStatuses[getRandomInt(0, expenseStatuses.length - 1)];
    const amount = getRandomInt(100000, 10000000); // 100K - 10M VND

    const expense = {
      companyId,
      userId: user._id,
      title: `${expenseCategories[getRandomInt(0, expenseCategories.length - 1)].replace('_', ' ')} expense`,
      description: 'Sample expense description',
      category: expenseCategories[getRandomInt(0, expenseCategories.length - 1)],
      amount,
      currency: 'VND',
      paymentMethod: 'company_card',
      paymentStatus: status === 'paid' ? 'paid' : 'pending',
      status,
      priority: priorities[getRandomInt(0, priorities.length - 1)],
      expenseDate: getRandomDate(45),
      vendor: vendors[getRandomInt(0, vendors.length - 1)],
      department: user.department,
      isReimbursable: getRandomInt(0, 1) === 1,
      isTaxDeductible: getRandomInt(0, 1) === 1
    };

    if (status === 'approved' || status === 'paid') {
      const approver = users.find(u => ['owner', 'admin', 'manager'].includes(u.role));
      if (approver) {
        expense.approvedBy = approver._id;
        expense.approvedAt = getRandomDate(10);
      }
    }

    if (status === 'paid') {
      expense.paidDate = getRandomDate(5);
    }

    expenses.push(expense);
  }

  await CompanyExpense.insertMany(expenses);
  console.log(`✅ Created ${expenses.length} expenses`);
};

// Main seed function
const seedData = async () => {
  try {
    await connectDB();

    // Get first company and its users
    const company = await Company.findOne().sort({ createdAt: 1 });

    if (!company) {
      console.error('❌ No company found. Please create a company first.');
      process.exit(1);
    }

    console.log(`📊 Seeding data for company: ${company.name}`);

    let users = await User.find({ companyId: company._id, isActive: true });

    // If no users, create some sample employees
    if (users.length === 0) {
      console.log('👥 No users found. Creating sample employees...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);

      const sampleUsers = [
        {
          email: `manager@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          password: hashedPassword,
          name: 'Nguyễn Văn Manager',
          role: 'manager',
          position: 'Sales Manager',
          department: 'Sales',
          companyId: company._id,
          isActive: true,
          isEmailVerified: true
        },
        {
          email: `sales1@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          password: hashedPassword,
          name: 'Trần Thị Sales',
          role: 'employee',
          position: 'Sales Executive',
          department: 'Sales',
          companyId: company._id,
          isActive: true,
          isEmailVerified: true
        },
        {
          email: `sales2@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          password: hashedPassword,
          name: 'Lê Văn Bán',
          role: 'employee',
          position: 'Sales Representative',
          department: 'Sales',
          companyId: company._id,
          isActive: true,
          isEmailVerified: true
        },
        {
          email: `marketing@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          password: hashedPassword,
          name: 'Phạm Thị Marketing',
          role: 'employee',
          position: 'Marketing Specialist',
          department: 'Marketing',
          companyId: company._id,
          isActive: true,
          isEmailVerified: true
        },
        {
          email: `support@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          password: hashedPassword,
          name: 'Hoàng Văn Support',
          role: 'employee',
          position: 'Customer Support',
          department: 'Support',
          companyId: company._id,
          isActive: true,
          isEmailVerified: true
        }
      ];

      users = await User.insertMany(sampleUsers);
      console.log(`✅ Created ${users.length} sample employees`);
    }

    console.log(`👥 Found ${users.length} users`);

    // Clear existing mock data
    console.log('🗑️  Clearing existing data...');
    await Activity.deleteMany({ companyId: company._id });
    await Sale.deleteMany({ companyId: company._id });
    await CompanyExpense.deleteMany({ companyId: company._id });

    // Seed new data
    await seedActivities(company._id, users);
    await seedSales(company._id, users);
    await seedExpenses(company._id, users);

    console.log('\n✨ Mock data seeding completed successfully!');
    console.log('📈 Summary:');
    console.log(`   - 50 activities`);
    console.log(`   - 40 sales`);
    console.log(`   - 45 expenses`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed
seedData();
