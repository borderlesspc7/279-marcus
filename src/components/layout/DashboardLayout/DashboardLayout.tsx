import React, { useState, useEffect } from "react";
import { Header } from "../Header/Header";
import { Sidebar } from "../Sidebar/Sidebar";
import { TrialWarningModal } from "../../ui/TrialWarningModal/TrialWarningModal";
import { useAuth } from "../../../hooks/useAuth";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Garantir que o modal apareça sempre ao fazer login/recarregar
  // (a menos que o usuário tenha optado por não mostrar mais)
  useEffect(() => {
    if (user?.uid) {
      const dontShowKey = `trial-warning-dont-show-${user.uid}`;
      const shouldNotShow = localStorage.getItem(dontShowKey) === "true";
      setIsModalOpen(!shouldNotShow);
    }
  }, [user]);

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
        {isModalOpen && (
          <TrialWarningModal onClose={() => setIsModalOpen(false)} />
        )}
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="dashboard-layout__main">
          <div className="dashboard-layout__container">{children}</div>
        </main>
      </div>
    </div>
  );
};
