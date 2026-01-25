"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button/Button";
import InputField from "../../../components/ui/InputField/InputField";
import "./Form.css";
import { clientAuthService } from "../../../services/clientAuthService";
import { paths } from "../../../routes/paths";

export default function ClientLoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    console.log("=".repeat(60));
    console.log("🔍 INICIANDO LOGIN DO CLIENTE");
    console.log("  Email:", email);
    console.log("  Senha:", password ? "***" : "(vazia)");
    console.log("=".repeat(60));
    
    try {
      const client = await clientAuthService.login(email, password);
      console.log("✅ Cliente autenticado com sucesso:", client);
      // Aguardar um pouco para garantir que o estado de autenticação seja atualizado
      setTimeout(() => {
        navigate(paths.dashboard, { replace: true });
      }, 100);
    } catch (err: unknown) {
      console.error("❌ Erro no login do cliente:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMessage);
      setShowDebug(true); // Mostrar informações de debug quando houver erro
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
            {showDebug && (
              <details style={{ marginTop: "12px", fontSize: "12px", textAlign: "left" }}>
                <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: "8px" }}>
                  🔍 Informações de Debug (clique para expandir)
                </summary>
                <div style={{ padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px", fontFamily: "monospace" }}>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Email tentado:</strong> {email}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Ação:</strong> Abra o Console do navegador (F12) e veja os logs detalhados.
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Possíveis causas:</strong>
                  </p>
                  <ul style={{ marginLeft: "20px", marginTop: "4px" }}>
                    <li>Cliente foi deletado do Firestore mas a conta do Auth ainda existe</li>
                    <li>O campo authUid não foi salvo corretamente ao criar o cliente</li>
                    <li>Email ou senha incorretos</li>
                  </ul>
                  <p style={{ margin: "8px 0 4px", fontWeight: "600" }}>
                    Verifique o Console para ver:
                  </p>
                  <ul style={{ marginLeft: "20px" }}>
                    <li>Lista de todos os clientes no Firestore</li>
                    <li>UID retornado pela autenticação</li>
                    <li>Resultado da busca por authUid</li>
                  </ul>
                </div>
              </details>
            )}
          </div>
        )}

        <div className="client-login-form__info">
          <p>
            <strong>Primeira vez?</strong> Entre em contato com seu nutricionista
            para obter suas credenciais de acesso (e-mail e senha).
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

