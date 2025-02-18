import axios from "axios";

const API_URL = "http://localhost:8000/api/auth/";

export const login = async (username, password, expectedRole) => {
  try {
    console.log("Attempting login for:", username, "Expected Role:", expectedRole);

    const response = await axios.post(`${API_URL}token/`, { username, password });
    console.log("Login response:", response.data); // Debug log

    const { access, role, username: returnedUsername } = response.data;

    if (!role) {
      console.error("Error: Role is missing in the response");
      throw new Error("Erreur interne : rôle utilisateur manquant.");
    }

    localStorage.setItem("token", access);
    localStorage.setItem("user", JSON.stringify({ username: returnedUsername, role }));

    return { token: access, role, username: returnedUsername };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw "Nom d'utilisateur ou mot de passe incorrect.";
  }
};


export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};
