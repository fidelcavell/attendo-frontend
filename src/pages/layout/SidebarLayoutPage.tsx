import { AppSidebar } from "@/pages/layout/sidebar-component/main-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLoginContext } from "@/hooks/useLogin";
import { menuData } from "@/data/menuData";
import { Link, Outlet, useLocation } from "react-router-dom";
import { breadcrumbMapping } from "@/helper/BreadCrumbMapping";

export default function SidebarLayoutPage() {
  const { currentUser } = useLoginContext();
  const role = currentUser?.role ?? "ROLE_EMPLOYEE";
  const menu = menuData[role];

  const location = useLocation();
  const crumbs = breadcrumbMapping[location.pathname] || [
    { label: "Attendance Report", path: "#" },
  ];

  return (
    <>
      <SidebarProvider>
        <AppSidebar nav={menu} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 no-print">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {crumbs.map((c, idx) => (
                    <BreadcrumbItem key={c.path}>
                      {idx === crumbs.length - 1 ? (
                        <BreadcrumbPage>{c.label}</BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink asChild>
                            <Link to={c.path}>{c.label}</Link>
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 py-4 px-8">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
