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
  "/app/work-schedule": [{ label: "Jadwal Kerja", path: "/app/work-schedule" }],
  "/app/store-setting": [
    { label: "Pengaturan Toko", path: "/app/store-setting" },
  ],
  "/app/activity-log": [
    { label: "Aktivitas Log Admin", path: "/app/activity-log" },
  ],
  "/app/employee-attendance-list": [
    {
      label: "Laporan",
      path: "#",
    },
    { label: "Daftar Karyawan", path: "/app/employee-attendance-list" },
  ],
  "/app/expenses-report": [
    {
      label: "Laporan",
      path: "#",
    },
    { label: "Pengeluaran Toko", path: "/app/expenses-report" },
  ],
  "/app/frequently-late-report": [
    {
      label: "Laporan",
      path: "#",
    },
    {
      label: "Karyawan yang Sering Telat",
      path: "/app/frequently-late-report",
    },
  ],
  "/app/leave-vs-overtime-report": [
    {
      label: "Laporan",
      path: "#",
    },
    { label: "Izin vs Lembur", path: "/app/leave-vs-overtime-report" },
  ],
  "/app/attendance-report": [
    { label: "Laporan Presensi", path: "/app/attendance-report" },
  ],

  // Employee's path
  "/app/daily-clock": [
    { label: "Presensi Harian", path: "#" },
    { label: "Presensi", path: "/app/daily-clock" },
  ],
  "/app/daily-break": [
    { label: "Presensi Harian", path: "#" },
    { label: "Istirahat", path: "/app/daily-break" },
  ],
  "/app/overtime-clock": [
    { label: "Presensi Lembur", path: "#" },
    { label: "Presensi", path: "/app/overtime-clock" },
  ],
  "/app/overtime-break": [
    { label: "Presensi Lembur", path: "#" },
    { label: "Istirahat", path: "/app/overtime-break" },
  ],
  "/app/leave-application": [
    { label: "Pengajuan Perizinan", path: "/app/leave-application" },
  ],
  "/app/overtime-application": [
    { label: "Pengajuan Lembur", path: "/app/overtime-application" },
  ],
};
