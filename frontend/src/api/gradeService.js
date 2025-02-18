import axios from "axios";
import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:8000/api/grades/";

export const createGrade = async (gradeData) => {
  const response = await axios.post(API_URL, gradeData, getAuthHeaders());
  return response.data;
};

// Fetch all grades (notes) for a specific assignment
export const getGradesByAssignment = async (assignmentId) => {
  const response = await axios.get(
    `${API_URL}?assignment=${assignmentId}`,
    getAuthHeaders()
  );
  return response.data;
}


export const getStudentReport = async (studentId) => {
  const response = await axios.get(
    `${API_URL}student-report/${studentId}/`,
    getAuthHeaders()
  );
  return response.data;
};