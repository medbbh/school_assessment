import axios from "axios";
import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:8000/api/assignments/";

export const createAssignment = async (assignmentData) => {
  const response = await axios.post(API_URL, assignmentData, getAuthHeaders());
  return response.data;
};

export const getAssignment = async (assignmentId) => {
  const response = await axios.get(`${API_URL}${assignmentId}/`, getAuthHeaders());
  return response.data;
};

// Optionally, you might have an endpoint for "my assignments"
export const getMyAssignments = async () => {
  const response = await axios.get(`${API_URL}my-assignments/`, getAuthHeaders());
  return response.data;
};

// Fetch all assignments for a given subject
export const getAssignmentsBySubject = async (subjectId) => {
    try {
      const response = await axios.get(
        `${API_URL}subject/${subjectId}/`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching assignments by subject:", error);
      throw error;
    }
};