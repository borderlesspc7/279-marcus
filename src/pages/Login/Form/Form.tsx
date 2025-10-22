"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/Button/Button";
import InputField from "../../../components/ui/InputField/InputField";
import "./Form.css";
import { useAuth } from "../../../hooks/useAuth";
import { paths } from "../../../routes/paths";
import { Link, useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    try {
      await login({ email, password });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate(paths.dashboard);
    }
  }, [user, navigate]);

  const handleInputChange = (field: "email" | "password", value: string) => {
    if (field === "email") setEmail(value);
    else setPassword(value);
  };

  return (
    <div className="login-form">
      <div className="login-form__header">
        <h1 className="login-form__title">Bem-vindo de volta!</h1>
        <p className="login-form__subtitle">
          Acesse o NutriManager e continue oferecendo o melhor atendimento
          nutricional aos seus pacientes
        </p>
      </div>

      <form className="login-form__form" onSubmit={handleSubmit}>
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
          <div className="login-form__error">
            <p>{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
          className="login-form__submit-btn"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>

        <a href="#" className="login-form__forgot-password">
          Esqueceu sua senha?
        </a>

        <div className="login-form__divider">
          <span>ou</span>
        </div>

        <div className="login-form__register-link">
          <p>Não tem uma conta?</p>
          <Link to={paths.register} className="login-form__register-btn">
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  );
}
