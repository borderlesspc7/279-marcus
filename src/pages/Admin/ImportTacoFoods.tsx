/**
 * Página Administrativa para Importação de Alimentos da TACO
 * 
 * Esta página permite importar alimentos da Tabela Brasileira de Composição de Alimentos
 * para o banco de dados Firestore.
 */

import React, { useState } from "react";
import { importTacoFoods, validateTacoFoods } from "../../scripts/importTacoFoods";

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  errorDetails: string[];
}

export const ImportTacoFoods: React.FC = () => {
  const [jsonData, setJsonData] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: number;
    invalid: number;
    invalidDetails: Array<{ food: any; errors: string[] }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = () => {
    try {
      const data = JSON.parse(jsonData);
      const foods = Array.isArray(data.foods) ? data.foods : data;

      const validation = validateTacoFoods(foods);
      setValidationResult({
        valid: validation.valid.length,
        invalid: validation.invalid.length,
        invalidDetails: validation.invalid,
      });
      setError(null);
    } catch (err) {
      setError(`Erro ao validar JSON: ${err instanceof Error ? err.message : String(err)}`);
      setValidationResult(null);
    }
  };

  const handleImport = async () => {
    if (!jsonData.trim()) {
      setError("Por favor, cole o JSON com os dados dos alimentos");
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportStats(null);

    try {
      const data = JSON.parse(jsonData);
      const foods = Array.isArray(data.foods) ? data.foods : data;

      // Validar antes de importar
      const validation = validateTacoFoods(foods);
      
      if (validation.invalid.length > 0) {
        setValidationResult({
          valid: validation.valid.length,
          invalid: validation.invalid.length,
          invalidDetails: validation.invalid,
        });
        setError(`Existem ${validation.invalid.length} alimentos inválidos. Corrija antes de importar.`);
        setIsImporting(false);
        return;
      }

      // Importar apenas os válidos
      const stats = await importTacoFoods(validation.valid, {
        skipDuplicates: true,
        batchSize: 500,
        autoFillAllowedMeals: true,
      });

      setImportStats(stats);
      setError(stats.errors > 0 ? `Importação concluída com ${stats.errors} erros` : null);
    } catch (err) {
      setError(`Erro ao importar: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleLoadTemplate = async () => {
    try {
      const response = await fetch("/src/data/taco-foods-template.json");
      const template = await response.json();
      setJsonData(JSON.stringify(template, null, 2));
    } catch (err) {
      setError(`Erro ao carregar template: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Importação de Alimentos da TACO</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Importe alimentos da Tabela Brasileira de Composição de Alimentos (TACO) para o banco de dados.
        <br />
        <strong>Fonte:</strong> NEPA/UNICAMP - TACO 4ª edição revisada e ampliada, 2011
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={handleLoadTemplate}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Carregar Template
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Cole o JSON com os dados dos alimentos:
        </label>
        <textarea
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          style={{
            width: "100%",
            minHeight: "300px",
            padding: "1rem",
            fontFamily: "monospace",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          placeholder='Cole aqui o JSON no formato: { "foods": [...] } ou [...]'
        />
      </div>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={handleValidate}
          disabled={!jsonData.trim() || isImporting}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: jsonData.trim() && !isImporting ? "pointer" : "not-allowed",
            opacity: jsonData.trim() && !isImporting ? 1 : 0.6,
          }}
        >
          Validar JSON
        </button>
        <button
          onClick={handleImport}
          disabled={!jsonData.trim() || isImporting}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: jsonData.trim() && !isImporting ? "pointer" : "not-allowed",
            opacity: jsonData.trim() && !isImporting ? 1 : 0.6,
          }}
        >
          {isImporting ? "Importando..." : "Importar para o Banco de Dados"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          <strong>Erro:</strong> {error}
        </div>
      )}

      {validationResult && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: validationResult.invalid > 0 ? "#fff3cd" : "#d4edda",
            color: validationResult.invalid > 0 ? "#856404" : "#155724",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          <h3>Resultado da Validação:</h3>
          <p>
            <strong>Válidos:</strong> {validationResult.valid} |{" "}
            <strong>Inválidos:</strong> {validationResult.invalid}
          </p>
          {validationResult.invalidDetails.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <strong>Detalhes dos Inválidos:</strong>
              <ul>
                {validationResult.invalidDetails.slice(0, 10).map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.food.name || "Sem nome"}:</strong> {item.errors.join(", ")}
                  </li>
                ))}
                {validationResult.invalidDetails.length > 10 && (
                  <li>... e mais {validationResult.invalidDetails.length - 10} itens</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {importStats && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: importStats.errors > 0 ? "#fff3cd" : "#d4edda",
            color: importStats.errors > 0 ? "#856404" : "#155724",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          <h3>Estatísticas da Importação:</h3>
          <ul>
            <li>
              <strong>Total processado:</strong> {importStats.total}
            </li>
            <li>
              <strong>Importados:</strong> {importStats.imported}
            </li>
            <li>
              <strong>Ignorados (duplicados):</strong> {importStats.skipped}
            </li>
            <li>
              <strong>Erros:</strong> {importStats.errors}
            </li>
          </ul>
          {importStats.errorDetails.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <strong>Detalhes dos Erros:</strong>
              <ul>
                {importStats.errorDetails.slice(0, 10).map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
                {importStats.errorDetails.length > 10 && (
                  <li>... e mais {importStats.errorDetails.length - 10} erros</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
        <h3>Instruções:</h3>
        <ol>
          <li>Extraia os dados nutricionais do PDF TACO</li>
          <li>Organize os dados no formato JSON (veja o template)</li>
          <li>Cole o JSON no campo acima</li>
          <li>Clique em "Validar JSON" para verificar os dados</li>
          <li>Corrija quaisquer erros de validação</li>
          <li>Clique em "Importar para o Banco de Dados"</li>
        </ol>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
          <strong>Nota:</strong> Alimentos duplicados (mesmo nome) serão automaticamente ignorados.
        </p>
      </div>
    </div>
  );
};

