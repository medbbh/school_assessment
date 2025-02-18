import React, { useState, useContext } from "react";
import { login } from "../../api/authService";
import { AuthContext } from "../../context/AuthContext";

const LoginForm = ({ selectedRole }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
  
    try {
      const response = await login(username, password, selectedRole);
      console.log("Login Success, User Data:", response); // Debug log
  
      if (!response || !response.role) {
        console.error("Error: User data is missing or has no role.");
        throw new Error("Une erreur est survenue lors de l'authentification.");
      }
  
      loginUser(response.token, response); // Ensure `response` is passed
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Bienvenue, {selectedRole}
      </h2>

      {errorMessage && (
        <p className="text-red-600 text-center mb-4">
          {typeof errorMessage === "string" ? errorMessage : "Une erreur est survenue."}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            required
            placeholder="Entrez votre nom d'utilisateur"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            required
            placeholder="Entrez votre mot de passe"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white
            transition-all duration-300 transform
            ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"}`}
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
