import { useState } from "react";
import { apiRequest } from "../../api";

import "./Auth.css";

function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isRegister ? "register" : "login";
      const data = await apiRequest(`/auth/${endpoint}`, {
        method: "POST",
        body: JSON.stringify({ ...(isRegister && { name }), email, password }),
      });

      localStorage.setItem("myai-token", data.token);
      onLogin(data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth">
      <form className="auth__form" onSubmit={handleSubmit}>
        <h1>✦ MyAI Agent</h1>
        <h2>{isRegister ? "Створення акаунта" : "Вхід у систему"}</h2>

        {isRegister && (
          <input
            type="text"
            placeholder="Твоє ім'я"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={50}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        {error && <p className="auth__error">{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Зачекай..." : isRegister ? "Зареєструватися" : "Увійти"}
        </button>

        <p className="auth__switch">
          {isRegister ? "Вже маєш акаунт?" : "Ще не маєш акаунта?"}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Увійти" : "Зареєструватися"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Auth;
