import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TodayAttendancesPage from "./today-attendances/TodayAttendancesPage";
import LeaveRequestPage from "./leave-request/LeaveRequestPage";
import OvertimeRequestPage from "./overtime-request/OvertimeRequestPage";

export default function DashboardPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs defaultValue="today-attendances">
        <TabsList className="gap-2 mb-4 flex sticky top-4 z-30 px-2">
          <TabsTrigger value="today-attendances">
            <span className="hidden sm:inline">Today attendances</span>
            <span className="inline sm:hidden">Today attends</span>
          </TabsTrigger>

          <TabsTrigger value="leave-request">
            <span className="hidden sm:inline">Leave application requests</span>
            <span className="inline sm:hidden">Leave reqs</span>
          </TabsTrigger>

          <TabsTrigger value="overtime-request">
            <span className="hidden sm:inline">
              Overtime application requests
            </span>
            <span className="inline sm:hidden">Overtime reqs</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="today-attendances">
          <TodayAttendancesPage />
        </TabsContent>
        <TabsContent value="leave-request">
          <LeaveRequestPage />
        </TabsContent>
        <TabsContent value="overtime-request">
          <OvertimeRequestPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
