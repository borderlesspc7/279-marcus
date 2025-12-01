"use client";

import ClientLoginForm from "./Form/Form";
import "./ClientLogin.css";
import {
  FaAppleAlt,
  FaUser,
  FaCalendarCheck,
  FaUtensils,
} from "react-icons/fa";

export default function ClientLoginPage() {
  return (
    <div className="client-login-page">
      <div className="client-login-page__container">
        <div className="client-login-page__form-section">
          <ClientLoginForm />
        </div>

        <div className="client-login-page__brand-section">
          <div className="client-login-page__brand-content">
            <div className="client-login-page__logo">
              <div className="client-login-page__logo-icon">
                <FaAppleAlt
                  className="logo-svg"
                  style={{ width: "100%", height: "100%", color: "white" }}
                />
              </div>
              <h2 className="client-login-page__brand-name">NutriManager</h2>
            </div>

            <div className="client-login-page__brand-description">
              <h3 className="client-login-page__tagline">
                Seu Acompanhamento Nutricional
              </h3>
              <p className="client-login-page__description">
                Acesse suas dietas, agende consultas e acompanhe sua evolução
                nutricional de forma simples e prática.
              </p>
              <div className="client-login-page__features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaUser size={20} />
                  </div>
                  <span>Seu Perfil</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaCalendarCheck size={20} />
                  </div>
                  <span>Agendar Consultas</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaUtensils size={20} />
                  </div>
                  <span>Suas Dietas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

