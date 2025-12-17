import mongoose from "mongoose";

/* -------- Quick Overview -------- */
const QuickOverviewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },     
    value: { type: String, required: true },    
    icon: { type: String },                     
    color: { type: String }                     
  },
  { _id: false }
);

/* -------- Quick Access -------- */
const QuickAccessSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },     
    image: { type: String, required: true },     
    bgColor: { type: String, required: true },   // background color
    route: { type: String }                      // optional navigation key
  },
  { _id: false }
);

/* -------- Upcoming Holidays -------- */
const UpcomingHolidaySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },     
    date: { type: String, required: true },      
    image: { type: String, required: true }     
  },
  { _id: false }
);

/* -------- Dashboard -------- */
const DashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    quickOverview: [QuickOverviewSchema],

    quickAccess: [QuickAccessSchema],

    upcomingHolidays: [UpcomingHolidaySchema]
  },
  { timestamps: true }
);

export default mongoose.model("Dashboard", DashboardSchema);
