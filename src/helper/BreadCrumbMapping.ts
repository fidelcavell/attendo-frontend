export const breadcrumbMapping: Record<
  string,
  { label: string; path: string }[]
> = {
  // Authenthicated path
  "/app/profile": [{ label: "Detail profile", path: "/app/profile" }],

  // Owner's path
  "/app/dashboard": [{ label: "Dashboard", path: "/app/dashboard" }],
  "/app/employee-management": [
    { label: "Employee management", path: "/app/employee-management" },
  ],
  "/app/work-schedule": [
    { label: "Work Schedule", path: "/app/work-schedule" },
  ],
  "/app/store-setting": [
    { label: "Store setting", path: "/app/store-setting" },
  ],
  "/app/activity-log": [
    { label: "Admin's Activity Log", path: "/app/activity-log" },
  ],
  "/app/employee-attendance-list": [
    {
      label: "Report",
      path: "#",
    },
    { label: "Employee List", path: "/app/employee-attendance-list" },
  ],
  "/app/expenses-report": [
    {
      label: "Report",
      path: "#",
    },
    { label: "Store Expenses", path: "/app/expenses-report" },
  ],
  "/app/frequently-late-report": [
    {
      label: "Report",
      path: "#",
    },
    { label: "Frequently Late Employee", path: "/app/frequently-late-report" },
  ],
  "/app/leave-vs-overtime-report": [
    {
      label: "Report",
      path: "#",
    },
    { label: "Leave vs Overtime", path: "/app/leave-vs-overtime-report" },
  ],
  "/app/attendance-report": [
    { label: "Attendance Report", path: "/app/attendance-report" },
  ],

  // Employee's path
  "/app/daily-clock": [
    { label: "Daily Attendance", path: "#" },
    { label: "Clock", path: "/app/daily-clock" },
  ],
  "/app/daily-break": [
    { label: "Daily Attendance", path: "#" },
    { label: "Break", path: "/app/daily-break" },
  ],
  "/app/overtime-clock": [
    { label: "Overtime Attendance", path: "#" },
    { label: "Clock", path: "/app/overtime-clock" },
  ],
  "/app/overtime-break": [
    { label: "Overtime Attendance", path: "#" },
    { label: "Break", path: "/app/overtime-break" },
  ],
  "/app/leave-application": [
    { label: "Leave Application", path: "/app/leave-application" },
  ],
  "/app/overtime-application": [
    { label: "Overtime Application", path: "/app/overtime-application" },
  ],
};
