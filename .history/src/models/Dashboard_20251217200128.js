const mongoose = require('mongoose');

/* -------- Quick Access Schema -------- */
const QuickAccessSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Quick access title is required'],
      trim: true
    },
    image: { 
      type: String, 
      required: [true, 'Quick access image is required']
    },
    bgColor: { 
      type: String, 
      required: [true, 'Background color is required'],
      default: '#6366F1'
    },
    route: { 
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: true }
);

/* -------- Upcoming Holiday Schema -------- */
const UpcomingHolidaySchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Holiday title is required'],
      trim: true
    },
    date: { 
      type: String, 
      required: [true, 'Holiday date is required']
    },
    image: { 
      type: String, 
      required: [true, 'Holiday image is required']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: true }
);

/* -------- Global Dashboard Configuration Schema -------- */
const GlobalDashboardConfigSchema = new mongoose.Schema(
  {
    configType: {
      type: String,
      enum: ['quickAccess', 'holidays'],
      required: true,
      unique: true
    },
    items: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    }
  },
  { 
    timestamps: true
  }
);

/* -------- Dashboard Schema (User-specific) -------- */
const DashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
DashboardSchema.index({ userId: 1 });

// Virtual to get active quick access from global config
DashboardSchema.virtual('quickAccess', {
  ref: 'GlobalDashboardConfig',
  localField: '_id',
  foreignField: '_id',
  justOne: true
});

// Virtual to get active holidays from global config
DashboardSchema.virtual('upcomingHolidays', {
  ref: 'GlobalDashboardConfig',
  localField: '_id',
  foreignField: '_id',
  justOne: true
});

// Static method to get or create dashboard
DashboardSchema.statics.getOrCreate = async function(userId) {
  let dashboard = await this.findOne({ userId });
  
  if (!dashboard) {
    dashboard = await this.create({ userId });
  }
  
  return dashboard;
};

// Static method to get dashboard with global items
DashboardSchema.statics.getDashboardWithGlobalItems = async function(userId) {
  const GlobalConfig = mongoose.model('GlobalDashboardConfig');
  
  let dashboard = await this.findOne({ userId });
  if (!dashboard) {
    dashboard = await this.create({ userId });
  }

  // Get global quick access items (active only)
  const quickAccessConfig = await GlobalConfig.findOne({ configType: 'quickAccess' });
  const quickAccess = quickAccessConfig 
    ? quickAccessConfig.items.filter(item => item.isActive).sort((a, b) => a.order - b.order)
    : [];

  // Get global holiday items (active only)
  const holidaysConfig = await GlobalConfig.findOne({ configType: 'holidays' });
  const upcomingHolidays = holidaysConfig 
    ? holidaysConfig.items.filter(item => item.isActive).sort((a, b) => a.order - b.order)
    : [];

  return {
    _id: dashboard._id,
    userId: dashboard.userId,
    quickAccess,
    upcomingHolidays,
    createdAt: dashboard.createdAt,
    updatedAt: dashboard.updatedAt
  };
};

const Dashboard = mongoose.model('Dashboard', DashboardSchema);
const GlobalDashboardConfig = mongoose.model('GlobalDashboardConfig', GlobalDashboardConfigSchema);

module.exports = { Dashboard, GlobalDashboardConfig };