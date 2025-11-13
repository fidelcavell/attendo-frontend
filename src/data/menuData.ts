import {
  CalendarSync,
  ClipboardClock,
  ClockPlus,
  FileChartColumn,
  FileChartLine,
  LayoutDashboard,
  ScrollText,
  Store,
  Ticket,
  Tickets,
  UserRoundPen,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const menuData: Record<string, { menu: any[] }> = {
  ROLE_OWNER: {
    menu: [
      {
        title: "Dashboard",
        url: "/app/dashboard",
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: "Employee Management",
        url: "/app/employee-management",
        icon: UserRoundPen,
      },
      {
        title: "Store Setting",
        url: "/app/store-setting",
        icon: Store,
      },
      {
        title: "Work Schedule",
        url: "/app/work-schedule",
        icon: CalendarSync,
      },
      {
        title: "Admin's Activity Log",
        url: "/app/activity-log",
        icon: ScrollText,
      },
      {
        title: "Report",
        url: "#",
        icon: FileChartLine,
        items: [
          {
            title: "Employee's Attendance",
            url: "/app/employee-attendance-list",
          },
          {
            title: "Store's Expenses",
            url: "/app/expenses-report",
          },
          {
            title: "Frequently Late Employee",
            url: "/app/frequently-late-report",
          },
          {
            title: "Leave vs Overtime",
            url: "/app/leave-vs-overtime-report",
          },
        ],
      },
    ],
  },
  ROLE_ADMIN: {
    menu: [
      {
        title: "Admin's Dashboard",
        url: "/app/dashboard",
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: "Employee Management",
        url: "/app/employee-management",
        icon: UserRoundPen,
      },
      {
        title: "Work Schedule",
        url: "/app/work-schedule",
        icon: CalendarSync,
      },
      {
        title: "Daily Attendance",
        url: "#",
        icon: ClipboardClock,
        items: [
          {
            title: "Clock",
            url: "/app/daily-clock",
          },
          {
            title: "Break",
            url: "/app/daily-break",
          },
        ],
      },
      {
        title: "Overtime Attendance",
        url: "#",
        icon: ClockPlus,
        items: [
          {
            title: "Clock",
            url: "/app/overtime-clock",
          },
          {
            title: "Break",
            url: "/app/overtime-break",
          },
        ],
      },
      {
        title: "Leave Application",
        url: "/app/leave-application",
        icon: Ticket,
      },
      {
        title: "Overtime Application",
        url: "/app/overtime-application",
        icon: Tickets,
      },
      {
        title: "Report",
        url: "#",
        icon: FileChartLine,
        items: [
          {
            title: "My Attendance",
            url: "/app/attendance-report",
          },
          {
            title: "Employee's Attendance",
            url: "/app/employee-attendance-list",
          },
        ],
      },
    ],
  },
  ROLE_EMPLOYEE: {
    menu: [
      {
        title: "Attendance Report",
        url: "/app/attendance-report",
        icon: FileChartColumn,
        isActive: true,
      },
      {
        title: "Daily Attendance",
        url: "#",
        icon: ClipboardClock,
        items: [
          {
            title: "Clock",
            url: "/app/daily-clock",
          },
          {
            title: "Break",
            url: "/app/daily-break",
          },
        ],
      },
      {
        title: "Overtime Attendance",
        url: "#",
        icon: ClockPlus,
        items: [
          {
            title: "Clock",
            url: "/app/overtime-clock",
          },
          {
            title: "Break",
            url: "/app/overtime-break",
          },
        ],
      },
      {
        title: "Leave Application",
        url: "/app/leave-application",
        icon: Ticket,
      },
      {
        title: "Overtime Application",
        url: "/app/overtime-application",
        icon: Tickets,
      },
    ],
  },
};
