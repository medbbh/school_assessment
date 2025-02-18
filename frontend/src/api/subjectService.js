import axios from "axios";
import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:8000/api/subjects/";

// Fetch subjects for a selected class and logged-in professor.
export const getSubjectsByClass = async (classId) => {
  const response = await axios.get(`${API_URL}classe/${classId}/`, getAuthHeaders());
  return response.data;
};

// // Fetch all subjects assigned to the professor
export const getProfessorSubjects = async () => {
  const response = await axios.get(`${API_URL}my-subjects/`, getAuthHeaders());
  return response.data;
};
