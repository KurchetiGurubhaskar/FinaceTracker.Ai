import React from 'react';
import { Outlet } from 'react-router-dom';
import { EnterpriseSidebar } from './EnterpriseSidebar';
import { EnterpriseHeader } from './EnterpriseHeader';

export function Layout() {
  return (
    <div className="flex h-screen font-sans text-foreground overflow-hidden bg-transparent">
      <EnterpriseSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <EnterpriseHeader />
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
