import axios from "axios";
import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:8000/api/auth/users/";

// Fetch students grouped by class for the logged‑in professor
export const getMyStudents = async () => {
  const response = await axios.get(`${API_URL}my-students/`, getAuthHeaders());
  return response.data;
};

// New function: fetch all students in a given class
export const getStudentsByClass = async (classId) => {
  const response = await axios.get(
    `${API_URL}class/${classId}/students/`,
    getAuthHeaders()
  );
  return response.data;
};
