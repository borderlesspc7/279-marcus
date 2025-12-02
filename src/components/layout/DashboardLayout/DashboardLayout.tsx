import React, { useState } from "react";
import { Header } from "../Header/Header";
import { Sidebar } from "../Sidebar/Sidebar";
import { TrialWarningModal } from "../../ui/TrialWarningModal/TrialWarningModal";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className={`dashboard-layout__content ${
          isSidebarOpen
            ? "dashboard-layout__content--sidebar-open"
            : "dashboard-layout__content--sidebar-closed"
        }`}
      >
        <TrialWarningModal />
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="dashboard-layout__main">
          <div className="dashboard-layout__container">{children}</div>
        </main>
      </div>
    </div>
  );
};
