import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner, FaUser, FaEnvelope, FaCalendar, FaClock } from "react-icons/fa";
import { getAllNutritionists } from "../../../services/masterDashboardService";
import type { NutritionistStatus } from "../../../types/masterDashboard";
import "./NutritionistDetailsModal.css";

interface NutritionistDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterType: "trial" | "active" | "all";
  title: string;
}

export const NutritionistDetailsModal: React.FC<NutritionistDetailsModalProps> = ({
  isOpen,
  onClose,
  filterType,
  title,
}) => {
  const [nutritionists, setNutritionists] = useState<NutritionistStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadNutritionists();
    }
  }, [isOpen, filterType]);

  const loadNutritionists = async () => {
    try {
      setLoading(true);
      setError(null);
      const all = await getAllNutritionists();
      
      let filtered = all;
      if (filterType !== "all") {
        filtered = all.filter((n) => n.status === filterType);
      }
      
      setNutritionists(filtered);
    } catch (err) {
      console.error("Erro ao carregar nutricionistas:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const calculateDaysRemaining = (trialEndDate: Date | undefined): number | null => {
    if (!trialEndDate) return null;
    const now = new Date();
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="nutritionist-details-modal-overlay" onClick={onClose}>
      <div className="nutritionist-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nutritionist-details-modal__header">
          <h2 className="nutritionist-details-modal__title">{title}</h2>
          <button
            className="nutritionist-details-modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <FaTimes />
          </button>
        </div>

        <div className="nutritionist-details-modal__content">
          {loading ? (
            <div className="nutritionist-details-modal__loading">
              <FaSpinner className="nutritionist-details-modal__spinner" />
              <p>Carregando dados...</p>
            </div>
          ) : error ? (
            <div className="nutritionist-details-modal__error">
              <p>{error}</p>
            </div>
          ) : nutritionists.length === 0 ? (
            <div className="nutritionist-details-modal__empty">
              <p>Nenhum nutricionista encontrado</p>
            </div>
          ) : (
            <div className="nutritionist-details-modal__list">
              {nutritionists.map((nutritionist) => {
                const daysRemaining = calculateDaysRemaining(nutritionist.trialEndDate);
                return (
                  <div key={nutritionist.uid} className="nutritionist-details-item">
                    <div className="nutritionist-details-item__header">
                      <div className="nutritionist-details-item__avatar">
                        <FaUser />
                      </div>
                      <div className="nutritionist-details-item__info">
                        <h3 className="nutritionist-details-item__name">
                          {nutritionist.name}
                        </h3>
                        <p className="nutritionist-details-item__email">
                          <FaEnvelope size={12} /> {nutritionist.email}
                        </p>
                      </div>
                      <div className={`nutritionist-details-item__status nutritionist-details-item__status--${nutritionist.status}`}>
                        {nutritionist.status === "trial" && "Trial"}
                        {nutritionist.status === "active" && "Ativo"}
                        {nutritionist.status === "cancelled" && "Cancelado"}
                      </div>
                    </div>
                    <div className="nutritionist-details-item__details">
                      <div className="nutritionist-details-item__detail">
                        <FaCalendar size={14} />
                        <span>
                          <strong>Cadastrado em:</strong> {formatDate(nutritionist.createdAt)}
                        </span>
                      </div>
                      {nutritionist.trialEndDate && (
                        <div className="nutritionist-details-item__detail">
                          <FaClock size={14} />
                          <span>
                            <strong>Trial até:</strong> {formatDate(nutritionist.trialEndDate)}
                            {daysRemaining !== null && daysRemaining > 0 && (
                              <span className="nutritionist-details-item__days">
                                ({daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"})
                              </span>
                            )}
                            {daysRemaining !== null && daysRemaining === 0 && (
                              <span className="nutritionist-details-item__days nutritionist-details-item__days--expired">
                                (Expirado)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {nutritionist.subscriptionPlan && (
                        <div className="nutritionist-details-item__detail">
                          <span>
                            <strong>Plano:</strong> {nutritionist.subscriptionPlan}
                          </span>
                        </div>
                      )}
                      {nutritionist.monthlyRevenue && nutritionist.monthlyRevenue > 0 && (
                        <div className="nutritionist-details-item__detail">
                          <span>
                            <strong>Receita Mensal:</strong>{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(nutritionist.monthlyRevenue)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
