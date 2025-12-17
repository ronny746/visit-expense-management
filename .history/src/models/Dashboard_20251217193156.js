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
    }
  },
  { _id: false }
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
    }
  },
  { _id: false }
);

/* -------- Dashboard Schema -------- */
const DashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    },
    quickAccess: {
      type: [QuickAccessSchema],
      default: []
    },
    upcomingHolidays: {
      type: [UpcomingHolidaySchema],
      default: []
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

// Virtual for quick access count
DashboardSchema.virtual('quickAccessCount').get(function() {
  return this.quickAccess.length;
});

// Virtual for holidays count
DashboardSchema.virtual('holidaysCount').get(function() {
  return this.upcomingHolidays.length;
});

// Static method to get or create dashboard
DashboardSchema.statics.getOrCreate = async function(userId) {
  let dashboard = await this.findOne({ userId });
  
  if (!dashboard) {
    dashboard = await this.create({
      userId,
      quickAccess: [],
      upcomingHolidays: []
    });
  }
  
  return dashboard;
};

// Instance method to add quick access
DashboardSchema.methods.addQuickAccess = function(quickAccessData) {
  this.quickAccess.push(quickAccessData);
  return this.save();
};

// Instance method to add holiday
DashboardSchema.methods.addHoliday = function(holidayData) {
  this.upcomingHolidays.push(holidayData);
  return this.save();
};

// Instance method to remove quick access by index
DashboardSchema.methods.removeQuickAccess = function(index) {
  if (index >= 0 && index < this.quickAccess.length) {
    this.quickAccess.splice(index, 1);
    return this.save();
  }
  throw new Error('Invalid quick access index');
};

// Instance method to remove holiday by index
DashboardSchema.methods.removeHoliday = function(index) {
  if (index >= 0 && index < this.upcomingHolidays.length) {
    this.upcomingHolidays.splice(index, 1);
    return this.save();
  }
  throw new Error('Invalid holiday index');
};

// Pre-save middleware to validate
DashboardSchema.pre('save', function(next) {
  // Validate quick access array
  if (this.quickAccess && this.quickAccess.length > 20) {
    return next(new Error('Maximum 20 quick access items allowed'));
  }
  
  // Validate holidays array
  if (this.upcomingHolidays && this.upcomingHolidays.length > 50) {
    return next(new Error('Maximum 50 holidays allowed'));
  }
  
  next();
});

module.exports = mongoose.model('Dashboard', DashboardSchema);