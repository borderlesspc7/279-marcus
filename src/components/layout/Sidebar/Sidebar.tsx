import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaCalculator,
  FaChartLine,
  FaAppleAlt,
  FaUtensils,
  FaDatabase,
} from "react-icons/fa";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const menuItems: MenuItem[] = [
    {
      path: "/dashboard",
      icon: <FaHome size={20} />,
      label: "Home",
    },
    {
      path: "/dashboard/clientes",
      icon: <FaUsers size={20} />,
      label: "Clientes",
      badge: "12",
    },
    {
      path: "/dashboard/agenda",
      icon: <FaCalendarAlt size={20} />,
      label: "Agenda",
      badge: "3",
    },
    {
      path: "/dashboard/calculadora",
      icon: <FaCalculator size={20} />,
      label: "Calculadora de Dieta",
    },
    {
      path: "/dashboard/financeiro",
      icon: <FaChartLine size={20} />,
      label: "Financeiro",
    },
    {
      path: "/dashboard/admin/import-taco",
      icon: <FaDatabase size={20} />,
      label: "Importar TACO",
    },
  ];

  return (
    <aside
      className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}
    >
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <FaAppleAlt size={28} />
        </div>
        {isOpen && (
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-name">NutriManager</span>
            <span className="sidebar__logo-tagline">Sistema de Gestão</span>
          </div>
        )}
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar__menu-item">
              <NavLink
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
              >
                <span className="sidebar__link-icon">{item.icon}</span>
                {isOpen && (
                  <>
                    <span className="sidebar__link-label">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        {isOpen && (
          <div className="sidebar__version">
            <p>Versão 1.0.0</p>
            <p>© 2025 NutriManager</p>
          </div>
        )}
      </div>
    </aside>
  );
};
