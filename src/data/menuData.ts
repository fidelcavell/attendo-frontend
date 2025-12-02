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
        title: "Pengaturan Toko",
        url: "/app/store-setting",
        icon: Store,
      },
      {
        title: "Jadwal Kerja",
        url: "/app/work-schedule",
        icon: CalendarSync,
      },
      {
        title: "Aktivitas Log Admin",
        url: "/app/activity-log",
        icon: ScrollText,
      },
      {
        title: "Laporan",
        url: "#",
        icon: FileChartLine,
        items: [
          {
            title: "Presensi Karyawan",
            url: "/app/employee-attendance-list",
          },
          {
            title: "Pengeluaran Toko",
            url: "/app/expenses-report",
          },
          {
            title: "Karyawan yang sering telat",
            url: "/app/frequently-late-report",
          },
          {
            title: "Izin vs Lembur",
            url: "/app/leave-vs-overtime-report",
          },
        ],
      },
    ],
  },
  ROLE_ADMIN: {
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
        title: "Jadwal Kerja",
        url: "/app/work-schedule",
        icon: CalendarSync,
      },
      {
        title: "Presensi Harian",
        url: "#",
        icon: ClipboardClock,
        items: [
          {
            title: "Presensi",
            url: "/app/daily-clock",
          },
          {
            title: "Istirahat",
            url: "/app/daily-break",
          },
        ],
      },
      {
        title: "Presensi Lembur",
        url: "#",
        icon: ClockPlus,
        items: [
          {
            title: "Presensi",
            url: "/app/overtime-clock",
          },
          {
            title: "Istirahat",
            url: "/app/overtime-break",
          },
        ],
      },
      {
        title: "Pengajuan Perizinan",
        url: "/app/leave-application",
        icon: Ticket,
      },
      {
        title: "Pengajuan Lembur",
        url: "/app/overtime-application",
        icon: Tickets,
      },
      {
        title: "Laporan",
        url: "#",
        icon: FileChartLine,
        items: [
          {
            title: "Presensi Saya",
            url: "/app/attendance-report",
          },
          {
            title: "Presensi Karyawan",
            url: "/app/employee-attendance-list",
          },
        ],
      },
    ],
  },
  ROLE_EMPLOYEE: {
    menu: [
      {
        title: "Laporan Presensi",
        url: "/app/attendance-report",
        icon: FileChartColumn,
        isActive: true,
      },
      {
        title: "Presensi Harian",
        url: "#",
        icon: ClipboardClock,
        items: [
          {
            title: "Presensi",
            url: "/app/daily-clock",
          },
          {
            title: "Istirahat",
            url: "/app/daily-break",
          },
        ],
      },
      {
        title: "Presensi Lembur",
        url: "#",
        icon: ClockPlus,
        items: [
          {
            title: "Presensi",
            url: "/app/overtime-clock",
          },
          {
            title: "Istirahat",
            url: "/app/overtime-break",
          },
        ],
      },
      {
        title: "Pengajuan Perizinan",
        url: "/app/leave-application",
        icon: Ticket,
      },
      {
        title: "Pengajuan Lembur",
        url: "/app/overtime-application",
        icon: Tickets,
      },
    ],
  },
};
