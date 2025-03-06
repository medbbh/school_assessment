import axios from "axios";
import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:8000/api/auth/users/";

export const getUsers = async () => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axios.patch(`${API_URL}${id}/`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const getMyChildren = async () => {
  const response = await axios.get(`${API_URL}my-children/`, getAuthHeaders());
  return response.data;
};

export const getProfessors = async () => {
  const response = await axios.get(`${API_URL}role/professor/`, getAuthHeaders());
  return response.data;
};


