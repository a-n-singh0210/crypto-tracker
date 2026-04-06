import { useState } from "react";
import { login, register } from "../services/api";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async () => {
    setError("");
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      if (isRegister) {
        const res = await register({ username, password });
        if (res === "User registered successfully") {
          setIsRegister(false);
          setError("Registration successful! Please login.");
        } else {
          setError(res);
        }
      } else {
        const res = await login({ username, password });
        if (res === "Login successful") {
          setUser(username);
        } else {
          setError(res);
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl w-96 shadow-2xl">
        <h2 className="text-4xl font-bold text-white mb-8 text-center" id="app-title">CryptoVault</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm" id="auth-error">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Username</label>
            <input
              id="login-username"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <input
              id="login-password"
              type="password"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            id="login-btn"
            onClick={handleAction}
            className="w-full bg-blue-600 p-3 rounded-lg text-white font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 mt-4"
          >
            {isRegister ? "Register" : "Login"}
          </button>

          <p className="text-gray-400 text-center text-sm mt-4">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              id="toggle-auth"
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-500 hover:underline font-medium"
            >
              {isRegister ? "Login here" : "Register here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}