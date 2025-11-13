export type ExpensesReport = {
  monthlyTotals: {
    month: string;
    amount: number;
  }[];
  totalExpenses: number;
  averageExpenses: number;
  highestMonth: {
    month: string;
    amount: number;
  };
  lowestMonth: {
    month: string;
    amount: number;
  };
};

export type LateEmployeesReport = {
  totalEmployeesLate: number;
  totalLateCount: number;
  totalLateMinutes: number;
  totalLateHours: number;
  top5LateEmployees: {
    userId: number;
    username: string;
    lateCount: number;
    lateInMinutes: number;
  }[];
  monthlyLateDistribution: {
    month: string;
    count: number;
  }[];
};

export type LeaveVsOvertimeReport = {
  totalLeaveDaysInPeriod: number;
  totalLeaveRequestInPeriod: number;
  leaveDistributionByMonth: {
    month: string;
    OTHER: number;
    PERSONAL: number;
    SICK: number;
  }[];
  pieDistribution: {
    type: "sick" | "personal" | "other";
    leaveDays: number;
    totalRequests: number;
    percentage: number;
  }[];
  totalOvertimeDaysInPeriod: number;
  overtimeDaysDistributionByMonth: {
    month: string;
    count: number;
  }[];
};

