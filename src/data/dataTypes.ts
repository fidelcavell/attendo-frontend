export type Profile = {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  username: string;
  email: string;
  roleName: string;
  idSchedule: number | null;
  idUser: number;
};

export type ProfileForm = {
  name: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  gender: string;
};

export type LeaveApplication = {
  id: number;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
  description: string;
  issuedBy: string;
  approvedBy: string;
};

export type OvertimeApplication = {
  id: number;
  status: string;
  overtimeDate: string;
  description: string;
  overtimePay: string;
  assignedTime: string;
  issuedBy: string;
  approvedBy: string;
};

export type Schedule = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  lateTolerance: number;
};

export type Attendance = {
  id: number | null;
  type: string;
  status: string;
  clockIn: string | null;
  clockOut: string | null;
  breakIn: string | null;
  breakOut: string | null;
  description: string | null;
  loanAmount: number;
  deductionAmount: number;
  lateInMinutes: number | null;
  username: string | null;
  name: string | null;
  role: string| null;
  idProfile: number;
  idOvertime: number | null;
};

export type AttendanceInfo = {
  baseSalary: number;
  attendanceData: Attendance;
};

export type OwnedStore = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
  breakDuration: number;
  maxBreakCount: number;
  currentBreakCount: number;
  lateClockInPenaltyAmount: number;
  lateBreakOutPenaltyAmount: number;
  multiplierOvertime: number;
  active: boolean;
};

export type ActivityLog = {
  id: number;
  actionMethod: string;
  actionName: string;
  entity: string;
  description: string;
  createdBy: string;
  createdOn: string;
};

export type SalarySummary = {
  baseSalary: number;
  totalDeduction: number;
  totalLoan: number;
  totalOvertimePay: number;
  totalSalary: number;
};

export type Loan = {
  id: number;
  amount: number;
  createdDate: string;
};

export type User = {
  idUser: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  idProfile: number | null;
  idSchedule: number | null;
  idAssociateStore: number | null;
};

