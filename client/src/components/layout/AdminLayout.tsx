import { Outlet } from "react-router-dom";
import { UserButton } from "@clerk/react";

import { AdminMobileHeader, AdminSidebar } from "../admin/common/sidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-secondary/45">
      <AdminMobileHeader />

      <div className="flex min-h-[calc(100vh-4rem)] lg:min-h-screen">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 hidden h-16 items-center border-b border-border bg-background/80 px-6 backdrop-blur lg:flex">
            <div className="ml-auto flex items-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
