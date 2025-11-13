import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TodayAttendancesPage from "./today-attendances/TodayAttendancesPage";
import LeaveRequestPage from "./leave-request/LeaveRequestPage";
import OvertimeRequestPage from "./overtime-request/OvertimeRequestPage";

export default function DashboardPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="today-attendances">
        <TabsList className="gap-2 mb-4 flex sticky top-4 z-30">
          <TabsTrigger value="today-attendances">
            <span className="hidden sm:inline">Today attendances</span>
            <span className="inline sm:hidden">Today attendances</span>
          </TabsTrigger>

          <TabsTrigger value="leave-request">
            <span className="hidden sm:inline">Leave request</span>
            <span className="inline sm:hidden">Leave ticket</span>
          </TabsTrigger>

          <TabsTrigger value="overtime-request">
            <span className="hidden sm:inline">Overtime request</span>
            <span className="inline sm:hidden">Overtime ticket</span>
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
