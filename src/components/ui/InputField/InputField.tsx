"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./InputField.css";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  min,
  max,
  step,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="input-field">
      <label className="input-field__label">
        {label}
        {required && <span className="input-field__required">*</span>}
      </label>
      <div className="input-field__wrapper">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input-field__input ${
            error ? "input-field__input--error" : ""
          } ${isPassword ? "input-field__input--password" : ""}`}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
        />
        {isPassword && (
          <button
            type="button"
            className="input-field__toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
}
