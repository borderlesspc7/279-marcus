import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCreditCard,
  FaLock,
  FaArrowLeft,
  FaCheck,
  FaRocket,
  FaStar,
  FaCrown,
} from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import InputField from "../../components/ui/InputField/InputField";
import { paths } from "../../routes/paths";
import "./Checkout.css";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: "monthly" | "yearly";
  icon: React.ReactNode;
  color: string;
}

const plans: Record<string, Plan> = {
  basic: {
    id: "basic",
    name: "Básico",
    description: "Ideal para começar",
    price: 49.9,
    period: "monthly",
    icon: <FaRocket />,
    color: "#3b82f6",
  },
  professional: {
    id: "professional",
    name: "Profissional",
    description: "Para nutricionistas estabelecidos",
    price: 99.9,
    period: "monthly",
    icon: <FaStar />,
    color: "#16a34a",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Para clínicas e equipes",
    price: 199.9,
    period: "monthly",
    icon: <FaCrown />,
    color: "#f59e0b",
  },
};

interface PaymentData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  billingCpf: string;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "professional";
  const period = (searchParams.get("period") as "monthly" | "yearly") || "monthly";

  const selectedPlan = plans[planId] || plans.professional;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentData>>({});

  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    billingName: "",
    billingEmail: "",
    billingPhone: "",
    billingCpf: "",
  });

  const getYearlyPrice = (monthlyPrice: number) => {
    return monthlyPrice * 12 * 0.8;
  };

  const finalPrice = period === "monthly" 
    ? selectedPlan.price 
    : getYearlyPrice(selectedPlan.price);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return cleaned.slice(0, 14);
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return cleaned.slice(0, 15);
  };

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "billingCpf") {
      formattedValue = formatCpf(value);
    } else if (field === "billingPhone") {
      formattedValue = formatPhone(value);
    }

    setPaymentData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentData> = {};

    if (!paymentData.cardNumber.replace(/\s/g, "")) {
      newErrors.cardNumber = "Número do cartão é obrigatório";
    } else if (paymentData.cardNumber.replace(/\s/g, "").length < 13) {
      newErrors.cardNumber = "Número do cartão inválido";
    }

    if (!paymentData.cardName.trim()) {
      newErrors.cardName = "Nome no cartão é obrigatório";
    }

    if (!paymentData.expiryDate) {
      newErrors.expiryDate = "Data de validade é obrigatória";
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = "Data inválida (MM/AA)";
    }

    if (!paymentData.cvv) {
      newErrors.cvv = "CVV é obrigatório";
    } else if (paymentData.cvv.length < 3) {
      newErrors.cvv = "CVV inválido";
    }

    if (!paymentData.billingName.trim()) {
      newErrors.billingName = "Nome completo é obrigatório";
    }

    if (!paymentData.billingEmail.trim()) {
      newErrors.billingEmail = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.billingEmail)) {
      newErrors.billingEmail = "E-mail inválido";
    }

    if (!paymentData.billingPhone.trim()) {
      newErrors.billingPhone = "Telefone é obrigatório";
    }

    if (!paymentData.billingCpf.replace(/\D/g, "")) {
      newErrors.billingCpf = "CPF é obrigatório";
    } else if (paymentData.billingCpf.replace(/\D/g, "").length !== 11) {
      newErrors.billingCpf = "CPF inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: Integrar com gateway de pagamento (Stripe, Mercado Pago, etc.)
      // Simular processamento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirecionar para página de sucesso
      navigate(`${paths.checkoutSuccess}?plan=${planId}&period=${period}`);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page__container">
        <div className="checkout-page__header">
          <Button
            variant="ghost"
            onClick={() => navigate(paths.subscription)}
            className="checkout-page__back-button"
          >
            <FaArrowLeft /> Voltar
          </Button>
          <h1 className="checkout-page__title">Finalizar Assinatura</h1>
          <p className="checkout-page__subtitle">
            Complete seu pagamento para ativar seu plano
          </p>
        </div>

        <div className="checkout-page__content">
          <div className="checkout-page__summary">
            <div className="checkout-summary">
              <div className="checkout-summary__header">
                <div
                  className="checkout-summary__icon"
                  style={{
                    backgroundColor: `${selectedPlan.color}15`,
                    color: selectedPlan.color,
                  }}
                >
                  {selectedPlan.icon}
                </div>
                <div>
                  <h3 className="checkout-summary__plan-name">
                    Plano {selectedPlan.name}
                  </h3>
                  <p className="checkout-summary__plan-description">
                    {selectedPlan.description}
                  </p>
                </div>
              </div>

              <div className="checkout-summary__price">
                <div className="checkout-summary__price-label">Total</div>
                <div className="checkout-summary__price-value">
                  <span className="checkout-summary__currency">R$</span>
                  <span className="checkout-summary__amount">
                    {finalPrice.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="checkout-summary__period">
                    /{period === "monthly" ? "mês" : "ano"}
                  </span>
                </div>
              </div>

              {period === "yearly" && (
                <div className="checkout-summary__savings">
                  <FaCheck /> Você economiza R${" "}
                  {(selectedPlan.price * 12 - finalPrice)
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  por ano
                </div>
              )}

              <div className="checkout-summary__security">
                <FaLock /> Pagamento seguro e criptografado
              </div>
            </div>
          </div>

          <div className="checkout-page__form">
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="checkout-form__section">
                <h2 className="checkout-form__section-title">
                  <FaCreditCard /> Dados do Cartão
                </h2>

                <InputField
                  label="Número do Cartão"
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(value) => handleInputChange("cardNumber", value)}
                  placeholder="0000 0000 0000 0000"
                  error={errors.cardNumber}
                  required
                  disabled={loading}
                />

                <InputField
                  label="Nome no Cartão"
                  type="text"
                  value={paymentData.cardName}
                  onChange={(value) => handleInputChange("cardName", value)}
                  placeholder="Nome como está no cartão"
                  error={errors.cardName}
                  required
                  disabled={loading}
                />

                <div className="checkout-form__row">
                  <InputField
                    label="Validade"
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(value) => handleInputChange("expiryDate", value)}
                    placeholder="MM/AA"
                    error={errors.expiryDate}
                    required
                    disabled={loading}
                  />

                  <InputField
                    label="CVV"
                    type="text"
                    value={paymentData.cvv}
                    onChange={(value) => handleInputChange("cvv", value)}
                    placeholder="123"
                    error={errors.cvv}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="checkout-form__section">
                <h2 className="checkout-form__section-title">
                  Dados de Cobrança
                </h2>

                <InputField
                  label="Nome Completo"
                  type="text"
                  value={paymentData.billingName}
                  onChange={(value) => handleInputChange("billingName", value)}
                  placeholder="Seu nome completo"
                  error={errors.billingName}
                  required
                  disabled={loading}
                />

                <InputField
                  label="E-mail"
                  type="email"
                  value={paymentData.billingEmail}
                  onChange={(value) => handleInputChange("billingEmail", value)}
                  placeholder="seu@email.com"
                  error={errors.billingEmail}
                  required
                  disabled={loading}
                />

                <div className="checkout-form__row">
                  <InputField
                    label="Telefone"
                    type="tel"
                    value={paymentData.billingPhone}
                    onChange={(value) => handleInputChange("billingPhone", value)}
                    placeholder="(11) 99999-9999"
                    error={errors.billingPhone}
                    required
                    disabled={loading}
                  />

                  <InputField
                    label="CPF"
                    type="text"
                    value={paymentData.billingCpf}
                    onChange={(value) => handleInputChange("billingCpf", value)}
                    placeholder="000.000.000-00"
                    error={errors.billingCpf}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="checkout-form__actions">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                  className="checkout-form__submit"
                >
                  {loading ? (
                    <>Processando...</>
                  ) : (
                    <>
                      <FaLock /> Confirmar e Pagar R${" "}
                      {finalPrice.toFixed(2).replace(".", ",")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

