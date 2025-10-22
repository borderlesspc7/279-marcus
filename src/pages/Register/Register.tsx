"use client";

import React from "react";
import { RegisterForm } from "./Form/Form";
import "./Register.css";

export const RegisterPage: React.FC = () => {
  return (
    <div className="register-user-page">
      <main className="register-user-page__main">
        <div className="register-user-page__content">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
};
