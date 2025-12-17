const mongoose = require('mongoose');

/* -------- Quick Access Item Schema -------- */
const QuickAccessSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    image: { 
      type: String, 
      required: true
    },
    bgColor: { 
      type: String, 
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
  { timestamps: true }
);

/* -------- Holiday Item Schema -------- */
const HolidaySchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    date: { 
      type: Date, 
      required: true
    },
    image: { 
      type: String, 
      required: true
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
  { timestamps: true }
);

/* -------- Main Dashboard Schema (Global for All Users) -------- */
const DashboardSchema = new mongoose.Schema(
  {
    quickAccess: [QuickAccessSchema],
    upcomingHolidays: [HolidaySchema]
  },
  { 
    timestamps: true
  }
);

// Static method to get or create global dashboard
DashboardSchema.statics.getGlobalDashboard = async function() {
  let dashboard = await this.findOne();
  
  if (!dashboard) {
    dashboard = await this.create({
      quickAccess: [],
      upcomingHolidays: []
    });
  }
  
  return dashboard;
};

// Static method to get active items only (for users)
DashboardSchema.statics.getActiveDashboard = async function() {
  const dashboard = await this.getGlobalDashboard();
  
  return {
    _id: dashboard._id,
    quickAccess: dashboard.quickAccess
      .filter(item => item.isActive)
      .sort((a, b) => a.order - b.order),
    upcomingHolidays: dashboard.upcomingHolidays
      .filter(item => item.isActive)
      .sort((a, b) => a.order - b.order),
    createdAt: dashboard.createdAt,
    updatedAt: dashboard.updatedAt
  };
};

module.exports = mongoose.model('Dashboard', DashboardSchema);