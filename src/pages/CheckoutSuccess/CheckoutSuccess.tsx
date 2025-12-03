import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaArrowRight, FaRocket, FaStar, FaCrown } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";
import "./CheckoutSuccess.css";

const planIcons: Record<string, React.ReactNode> = {
  basic: <FaRocket />,
  professional: <FaStar />,
  enterprise: <FaCrown />,
};

const planNames: Record<string, string> = {
  basic: "Básico",
  professional: "Profissional",
  enterprise: "Enterprise",
};

export const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "professional";
  const period = searchParams.get("period") || "monthly";

  const planName = planNames[planId] || "Profissional";
  const planIcon = planIcons[planId] || <FaStar />;

  useEffect(() => {
    // Redirecionar para dashboard após 10 segundos
    const timer = setTimeout(() => {
      navigate(paths.dashboard);
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="checkout-success-page">
      <div className="checkout-success-page__container">
        <div className="checkout-success-page__icon">
          <FaCheckCircle />
        </div>
        <h1 className="checkout-success-page__title">
          Assinatura Confirmada!
        </h1>
        <p className="checkout-success-page__message">
          Sua assinatura do plano <strong>{planName}</strong> foi ativada com
          sucesso.
        </p>

        <div className="checkout-success-page__plan-info">
          <div className="checkout-success-plan">
            <div className="checkout-success-plan__icon">{planIcon}</div>
            <div>
              <h3 className="checkout-success-plan__name">Plano {planName}</h3>
              <p className="checkout-success-plan__period">
                Período: {period === "monthly" ? "Mensal" : "Anual"}
              </p>
            </div>
          </div>
        </div>

        <div className="checkout-success-page__features">
          <h3 className="checkout-success-page__features-title">
            O que você tem acesso agora:
          </h3>
          <ul className="checkout-success-page__features-list">
            <li>✅ Acesso completo à plataforma</li>
            <li>✅ Todas as funcionalidades do plano</li>
            <li>✅ Suporte prioritário</li>
            <li>✅ Atualizações automáticas</li>
          </ul>
        </div>

        <div className="checkout-success-page__actions">
          <Button
            variant="primary"
            onClick={() => navigate(paths.dashboard)}
            className="checkout-success-page__button"
          >
            Ir para Dashboard <FaArrowRight />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(paths.subscription)}
            className="checkout-success-page__button"
          >
            Ver Meu Plano
          </Button>
        </div>

        <p className="checkout-success-page__redirect">
          Você será redirecionado automaticamente em alguns segundos...
        </p>
      </div>
    </div>
  );
};

