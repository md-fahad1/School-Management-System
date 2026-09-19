import Navbar from "@/components/Navbar";
import Menu from "@/components/Menu";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarContext";
import { getMyInstitution } from "@/lib/graphql/fetchers";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const institution = await getMyInstitution();

  return (
    <SidebarProvider>
      <div className="h-screen flex">
        <Sidebar
          menu={<Menu />}
          institutionName={institution?.name}
          institutionLogo={institution?.logo}
          institutionType={institution?.type}
        />
        {/* This column itself no longer scrolls — only the inner
            content area below Navbar does. That keeps Navbar pinned
            at the top instead of scrolling away with the page. */}
        <div className="w-full md:w-[92%] lg:w-[84%] xl:w-[86%] bg-bg flex flex-col h-screen">
          <div className="shrink-0 sticky top-0 z-30 bg-bg">
            <Navbar />
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
