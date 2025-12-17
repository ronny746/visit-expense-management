const mongoose = require('mongoose');

/* -------- Quick Access -------- */
const QuickAccessSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    bgColor: { type: String, default: '#6366F1' },
    route: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { _id: true }
);

/* -------- Upcoming Holidays -------- */
const HolidaySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { _id: true }
);

/* -------- Dashboard (Global) -------- */
const DashboardSchema = new mongoose.Schema(
  {
    quickAccess: [QuickAccessSchema],
    upcomingHolidays: [HolidaySchema]
  },
  { timestamps: true }
);

/* -------- Get or Create Dashboard -------- */
DashboardSchema.statics.getDashboard = async function () {
  let dashboard = await this.findOne();
  if (!dashboard) {
    dashboard = await this.create({
      quickAccess: [],
      upcomingHolidays: []
    });
  }
  return dashboard;
};

/* -------- Active Data for Users -------- */
DashboardSchema.statics.getActiveDashboard = async function () {
  const dashboard = await this.getDashboard();

  return {
    quickAccess: dashboard.quickAccess
      .filter(i => i.isActive)
      .sort((a, b) => a.order - b.order),

    upcomingHolidays: dashboard.upcomingHolidays
      .filter(i => i.isActive)
      .sort((a, b) => a.order - b.order)
  };
};

module.exports = mongoose.model('Dashboard', DashboardSchema);
