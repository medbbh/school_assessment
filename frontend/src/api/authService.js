// src/api/authService.js

import axios from "axios";

const API_URL = "http://localhost:8000/api/auth/";

export const login = async (username, password, role) => {
  try {
    console.log("Attempting login for:", username, "Sending role:", role);

    // 1) We pass username, password, role to the server
    //    (If you only need username/password, remove `role` from the request.)
    const response = await axios.post(`${API_URL}token/`, {
      username,
      password,
      // role, // <— If your backend actually needs it, uncomment
    });

    console.log("Login response:", response.data);

    const { access, refresh, role: backendRole, username: returnedUsername, user_id } = response.data;

    if (!backendRole) {
      throw new Error("Rôle manquant dans la réponse du serveur.");
    }

    // 2) No local mismatch checks: We trust the server’s returned role
    //    If user picks "Direction" but is actually "supervisor",
    //    the server returns backendRole = "supervisor" → That’s fine.

    // 3) Store login data in localStorage
    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: returnedUsername,
        role: backendRole,
        user_id,
      })
    );

    // 4) Return an object that AuthContext can use
    return { token: access, role: backendRole, username: returnedUsername, user_id };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    // For security, do not reveal exact errors to users
    throw "Nom d'utilisateur ou mot de passe incorrect.";
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};
