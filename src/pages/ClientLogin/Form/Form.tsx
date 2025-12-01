"use client";

import React, { useState } from "react";
import { Button } from "../../../components/ui/Button/Button";
import InputField from "../../../components/ui/InputField/InputField";
import "./Form.css";
import { clientAuthService } from "../../../services/clientAuthService";
import { paths } from "../../../routes/paths";

export default function ClientLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await clientAuthService.login(email, password);
      window.location.href = paths.dashboard;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: "email" | "password", value: string) => {
    if (field === "email") setEmail(value);
    else setPassword(value);
    if (error) setError(null);
  };

  return (
    <div className="client-login-form">
      <div className="client-login-form__header">
        <h1 className="client-login-form__title">Bem-vindo!</h1>
        <p className="client-login-form__subtitle">
          Acesse sua conta para ver suas dietas e agendar consultas
        </p>
      </div>

      <form className="client-login-form__form" onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(value) => handleInputChange("email", value)}
          placeholder="Digite seu email"
          required
        />

        <InputField
          label="Senha"
          type="password"
          value={password}
          onChange={(value) => handleInputChange("password", value)}
          placeholder="Digite sua senha"
          required
        />

        {error && (
          <div className="client-login-form__error">
            <p>{error}</p>
          </div>
        )}

        <div className="client-login-form__info">
          <p>
            <strong>Primeira vez?</strong> Sua senha inicial é o seu número de
            telefone (apenas números).
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
          className="client-login-form__submit-btn"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>

        <a href="#" className="client-login-form__forgot-password">
          Esqueceu sua senha?
        </a>
      </form>
    </div>
  );
}

