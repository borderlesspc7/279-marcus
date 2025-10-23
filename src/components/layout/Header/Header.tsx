import React, { useState } from "react";
import {
  FaUserCircle,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";
import "./Header.css";

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate(paths.login);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <div className="header__brand">
          <h1 className="header__brand-name">NutriManager</h1>
          <span className="header__brand-tagline">Gestão Nutricional</span>
        </div>
      </div>

      <div className="header__right">
        {/* Notificações */}
        <div className="header__notifications">
          <button
            className="header__icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notificações"
          >
            <FaBell size={20} />
            <span className="header__badge">3</span>
          </button>

          {showNotifications && (
            <div className="header__dropdown header__notifications-dropdown">
              <div className="header__dropdown-header">
                <h3>Notificações</h3>
              </div>
              <div className="header__dropdown-content">
                <div className="notification-item">
                  <p className="notification-item__text">
                    Nova consulta agendada
                  </p>
                  <span className="notification-item__time">5 min atrás</span>
                </div>
                <div className="notification-item">
                  <p className="notification-item__text">
                    Dieta aprovada por cliente
                  </p>
                  <span className="notification-item__time">1 hora atrás</span>
                </div>
                <div className="notification-item">
                  <p className="notification-item__text">Pagamento recebido</p>
                  <span className="notification-item__time">2 horas atrás</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu do usuário */}
        <div className="header__user">
          <button
            className="header__user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menu do usuário"
          >
            <FaUserCircle size={24} />
            <div className="header__user-info">
              <span className="header__user-name">
                {user?.name || "Usuário"}
              </span>
              <span className="header__user-role">
                {user?.role === "admin" ? "Administrador" : "Nutricionista"}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <div className="header__dropdown header__user-dropdown">
              <div className="header__dropdown-header">
                <FaUserCircle size={40} />
                <div>
                  <p className="header__dropdown-name">{user?.name}</p>
                  <p className="header__dropdown-email">{user?.email}</p>
                </div>
              </div>
              <div className="header__dropdown-divider"></div>
              <div className="header__dropdown-content">
                <button className="header__dropdown-item">
                  <FaUserCircle size={16} />
                  <span>Meu Perfil</span>
                </button>
                <button
                  className="header__dropdown-item header__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt size={16} />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
