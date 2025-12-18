import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import AddProfilePage from "./pages/profile/AddProfilePage";
import SidebarLayoutPage from "./pages/layout/SidebarLayoutPage";
import DashboardPage from "./pages/dashboard/MainPage";
import EmployeeManagement from "./pages/employee-management/EmployeeManagementPage";
import DetailProfilePage from "./pages/profile/DetailProfilePage";
import DetailTokoPage from "./pages/store/DetailTokoPage";
import SchedulePage from "./pages/schedule/SchedulePage";
import ActivityLogPage from "./pages/log/ActivityLogPage";
import ExpensesReportPage from "./pages/report/ExpensesReportPage";
import FrequentlyLateReportPage from "./pages/report/FrequentlyLateReportPage";
import LeaveVsOvertimeReportPage from "./pages/report/LeaveVsOvertimeReportPage";
import LeaveApplicationPage from "./pages/leave/LeaveApplicationPage";
import OvertimeApplicationPage from "./pages/overtime/OvertimeApplicationPage";
import AddStorePage from "./pages/store/AddStorePage";
import AttendanceReportPage from "./pages/report/attendance-report/AttendanceReport";
import LandingPage from "./pages/landing/LandingPage";
import NotFound from "./pages/error/NotFound";
import ProtectedRoleRoute from "./pages/auth/ProtectedRoleRoute";
import AccessDenied from "./pages/error/AccessDenied";
import DailyClockPage from "./pages/attendance/daily/DailyClockPage";
import DailyBreakPage from "./pages/attendance/daily/DailyBreakPage";
import OvertimeClockPage from "./pages/attendance/overtime/OvertimeClockPage";
import OvertimeBreakPage from "./pages/attendance/overtime/OvertimeBreakPage";
import EmployeeAttendanceList from "./pages/report/attendance-report/EmployeeAttendanceList";
import DetailAttendancePage from "./pages/report/attendance-report/DetailAttendancePage";
import AccountEmailVerificationPage from "./pages/auth/AccountEmailVerificationPage";
import AccountEmailChangePage from "./pages/auth/AccoutEmailChangePage";
import NoInternetConnection from "./pages/error/NoInternetConnection";
import { isTokenExpired } from "./hooks/useJwtExpiry";
import { useLoginContext } from "./hooks/useLogin";

function App() {
  const { token } = useLoginContext();

  // To clear localStorage when JWT Token expired but user is try to access "/" instead of another specific route
  if (isTokenExpired(token)) {
    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("USERNAME");
  }

  return (
    <BrowserRouter>
      <NoInternetConnection />
      <Routes>
        {/* Public Path */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<LoginPage />} />
        <Route path="/sign-up" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
        <Route
          path="/email-verification"
          element={<AccountEmailVerificationPage />}
        />
        <Route
          path="/verify-email-change"
          element={<AccountEmailChangePage />}
        />

        {/* Authenticated Path */}
        <Route
          path="/add-profile"
          element={
            <ProtectedRoleRoute
              allowedRoles={["ROLE_OWNER", "ROLE_ADMIN", "ROLE_EMPLOYEE"]}
            >
              <AddProfilePage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/add-store"
          element={
            <ProtectedRoleRoute allowedRoles={["ROLE_OWNER"]}>
              <AddStorePage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoleRoute
              allowedRoles={["ROLE_OWNER", "ROLE_ADMIN", "ROLE_EMPLOYEE"]}
            >
              <SidebarLayoutPage />
            </ProtectedRoleRoute>
          }
        >
          <Route
            path="detail-attendance/:attendanceId"
            element={
              <ProtectedRoleRoute
                allowedRoles={["ROLE_OWNER", "ROLE_ADMIN", "ROLE_EMPLOYEE"]}
              >
                <DetailAttendancePage />
              </ProtectedRoleRoute>
            }
          />

          {/* Owner's Path */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER", "ROLE_ADMIN"]}>
                <DashboardPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="employee-management"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER", "ROLE_ADMIN"]}>
                <EmployeeManagement />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="store-setting"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER"]}>
                <DetailTokoPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="work-schedule"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER", "ROLE_ADMIN"]}>
                <SchedulePage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="activity-log"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER"]}>
                <ActivityLogPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="employee-attendance-list"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER", "ROLE_ADMIN"]}>
                <EmployeeAttendanceList />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="store/:storeId/attendance-report/:name/:idUser"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER", "ROLE_ADMIN"]}>
                <AttendanceReportPage />
              </ProtectedRoleRoute>
            }
          />

          {/* Employee's Path */}
          <Route
            path="daily-clock"
            element={
              <ProtectedRoleRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}
              >
                <DailyClockPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="daily-break"
            element={
              <ProtectedRoleRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}
              >
                <DailyBreakPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="overtime-clock"
            element={
              <ProtectedRoleRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}
              >
                <OvertimeClockPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="overtime-break"
            element={
              <ProtectedRoleRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}
              >
                <OvertimeBreakPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="leave-application"
            element={
              <ProtectedRoleRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}
              >
                <LeaveApplicationPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="overtime-application"
            element={
              <ProtectedRoleRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}
              >
                <OvertimeApplicationPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="attendance-report"
            element={
              <ProtectedRoleRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}
              >
                <AttendanceReportPage />
              </ProtectedRoleRoute>
            }
          />

          {/* Authenticated path */}
          <Route path="profile" element={<DetailProfilePage />} />

          {/* Report Path */}
          <Route
            path="expenses-report"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER"]}>
                <ExpensesReportPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="frequently-late-report"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER"]}>
                <FrequentlyLateReportPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="leave-vs-overtime-report"
            element={
              <ProtectedRoleRoute allowedRoles={["ROLE_OWNER"]}>
                <LeaveVsOvertimeReportPage />
              </ProtectedRoleRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
