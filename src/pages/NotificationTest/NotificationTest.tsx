import React, { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaBell, FaTrash } from "react-icons/fa";
import "./NotificationTest.css";

export const NotificationTest: React.FC = () => {
  const { success, error, warning, info, addNotification, notifications, clearAll, unreadCount } = useNotifications();
  const [customTitle, setCustomTitle] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [customDuration, setCustomDuration] = useState(5000);
  const [selectedType, setSelectedType] = useState<"success" | "error" | "warning" | "info">("info");

  const handleQuickTest = (type: "success" | "error" | "warning" | "info") => {
    const messages = {
      success: {
        title: "Operação realizada com sucesso!",
        message: "Os dados foram salvos corretamente no sistema.",
      },
      error: {
        title: "Erro ao processar solicitação",
        message: "Verifique os campos e tente novamente.",
      },
      warning: {
        title: "Atenção necessária",
        message: "Seu período de trial expira em 3 dias.",
      },
      info: {
        title: "Nova atualização disponível",
        message: "Uma nova versão do sistema está disponível.",
      },
    };

    const { title, message } = messages[type];

    switch (type) {
      case "success":
        success(title, message);
        break;
      case "error":
        error(title, message);
        break;
      case "warning":
        warning(title, message);
        break;
      case "info":
        info(title, message);
        break;
    }
  };

  const handleCustomNotification = () => {
    if (!customTitle.trim()) {
      error("Título obrigatório", "Por favor, preencha o título da notificação.");
      return;
    }

    addNotification({
      type: selectedType,
      title: customTitle,
      message: customMessage || undefined,
      duration: customDuration > 0 ? customDuration : undefined,
    });

    // Limpar campos
    setCustomTitle("");
    setCustomMessage("");
  };

  const handleMultipleNotifications = () => {
    success("Notificação 1", "Primeira notificação de teste");
    setTimeout(() => {
      error("Notificação 2", "Segunda notificação de teste");
    }, 500);
    setTimeout(() => {
      warning("Notificação 3", "Terceira notificação de teste");
    }, 1000);
    setTimeout(() => {
      info("Notificação 4", "Quarta notificação de teste");
    }, 1500);
  };

  return (
    <div className="notification-test">
      <div className="notification-test__header">
        <div className="notification-test__header-content">
          <h1 className="notification-test__title">
            <FaBell /> Teste de Notificações
          </h1>
          <p className="notification-test__subtitle">
            Teste todos os tipos de notificações do sistema
          </p>
        </div>
        <div className="notification-test__stats">
          <div className="notification-test__stat">
            <span className="notification-test__stat-label">Total</span>
            <span className="notification-test__stat-value">{notifications.length}</span>
          </div>
          <div className="notification-test__stat notification-test__stat--unread">
            <span className="notification-test__stat-label">Não lidas</span>
            <span className="notification-test__stat-value">{unreadCount}</span>
          </div>
        </div>
      </div>

      <div className="notification-test__content">
        {/* Testes Rápidos */}
        <div className="notification-test__section">
          <h2 className="notification-test__section-title">Testes Rápidos</h2>
          <p className="notification-test__section-description">
            Clique nos botões abaixo para testar cada tipo de notificação:
          </p>
          <div className="notification-test__buttons">
            <button
              className="notification-test__btn notification-test__btn--success"
              onClick={() => handleQuickTest("success")}
            >
              <FaCheckCircle /> Sucesso
            </button>
            <button
              className="notification-test__btn notification-test__btn--error"
              onClick={() => handleQuickTest("error")}
            >
              <FaExclamationCircle /> Erro
            </button>
            <button
              className="notification-test__btn notification-test__btn--warning"
              onClick={() => handleQuickTest("warning")}
            >
              <FaExclamationTriangle /> Aviso
            </button>
            <button
              className="notification-test__btn notification-test__btn--info"
              onClick={() => handleQuickTest("info")}
            >
              <FaInfoCircle /> Informação
            </button>
          </div>
        </div>

        {/* Notificação Personalizada */}
        <div className="notification-test__section">
          <h2 className="notification-test__section-title">Notificação Personalizada</h2>
          <p className="notification-test__section-description">
            Crie uma notificação customizada com título, mensagem e duração:
          </p>
          <div className="notification-test__form">
            <div className="notification-test__form-group">
              <label htmlFor="type">Tipo</label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="notification-test__select"
              >
                <option value="success">Sucesso</option>
                <option value="error">Erro</option>
                <option value="warning">Aviso</option>
                <option value="info">Informação</option>
              </select>
            </div>
            <div className="notification-test__form-group">
              <label htmlFor="title">Título *</label>
              <input
                id="title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Digite o título da notificação"
                className="notification-test__input"
              />
            </div>
            <div className="notification-test__form-group">
              <label htmlFor="message">Mensagem (opcional)</label>
              <textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite a mensagem da notificação"
                className="notification-test__textarea"
                rows={3}
              />
            </div>
            <div className="notification-test__form-group">
              <label htmlFor="duration">Duração (ms)</label>
              <input
                id="duration"
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                min="0"
                step="1000"
                className="notification-test__input"
              />
              <small className="notification-test__help">
                0 = não desaparece automaticamente
              </small>
            </div>
            <button
              className="notification-test__btn notification-test__btn--primary"
              onClick={handleCustomNotification}
            >
              Criar Notificação
            </button>
          </div>
        </div>

        {/* Testes Avançados */}
        <div className="notification-test__section">
          <h2 className="notification-test__section-title">Testes Avançados</h2>
          <p className="notification-test__section-description">
            Teste múltiplas notificações simultaneamente:
          </p>
          <div className="notification-test__buttons">
            <button
              className="notification-test__btn notification-test__btn--secondary"
              onClick={handleMultipleNotifications}
            >
              Enviar 4 Notificações
            </button>
            <button
              className="notification-test__btn notification-test__btn--danger"
              onClick={clearAll}
            >
              <FaTrash /> Limpar Todas
            </button>
          </div>
        </div>

        {/* Lista de Notificações */}
        {notifications.length > 0 && (
          <div className="notification-test__section">
            <h2 className="notification-test__section-title">Notificações Ativas</h2>
            <div className="notification-test__list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-test__item notification-test__item--${notification.type} ${!notification.read ? "notification-test__item--unread" : ""}`}
                >
                  <div className="notification-test__item-icon">
                    {notification.type === "success" && <FaCheckCircle />}
                    {notification.type === "error" && <FaExclamationCircle />}
                    {notification.type === "warning" && <FaExclamationTriangle />}
                    {notification.type === "info" && <FaInfoCircle />}
                  </div>
                  <div className="notification-test__item-content">
                    <div className="notification-test__item-title">{notification.title}</div>
                    {notification.message && (
                      <div className="notification-test__item-message">{notification.message}</div>
                    )}
                    <div className="notification-test__item-meta">
                      <span>Tipo: {notification.type}</span>
                      <span>Duração: {notification.duration || "∞"}ms</span>
                      <span>Lida: {notification.read ? "Sim" : "Não"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

