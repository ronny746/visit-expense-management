import mongoose from "mongoose";



/* -------- Quick Access -------- */
const QuickAccessSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        image: { type: String, required: true },
        bgColor: { type: String, required: true },
        route: { type: String }
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

        quickAccess: [QuickAccessSchema],

        upcomingHolidays: [UpcomingHolidaySchema]
    },
    { timestamps: true }
);

export default mongoose.model("Dashboard", DashboardSchema);
