"use client";

import LoginForm from "./Form/Form";
import "./Login.css";
import {
  FaAppleAlt,
  FaUsers,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__form-section">
          <LoginForm />
        </div>

        <div className="login-page__brand-section">
          <div className="login-page__brand-content">
            <div className="login-page__logo">
              <div className="login-page__logo-icon">
                <FaAppleAlt
                  className="logo-svg"
                  style={{ width: "100%", height: "100%", color: "white" }}
                />
              </div>
              <h2 className="login-page__brand-name">NutriManager</h2>
            </div>

            <div className="login-page__brand-description">
              <h3 className="login-page__tagline">
                Gestão Inteligente para Nutricionistas
              </h3>
              <p className="login-page__description">
                Plataforma completa para nutricionistas autônomos e que atendem
                planos de saúde. Centralize dados, otimize a montagem de dietas
                e foque no que importa: o atendimento aos seus pacientes.
              </p>
              <div className="login-page__features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaUsers size={20} />
                  </div>
                  <span>Gestão de Pacientes</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaClipboardList size={20} />
                  </div>
                  <span>Montagem de Dietas</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaChartLine size={20} />
                  </div>
                  <span>Métricas e Evolução</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
