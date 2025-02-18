import axios from "axios";

const API_URL = "http://localhost:8000/api/classes/";

export const getClasses = async () => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const getClasseById = async (classId) => {
  const response = await axios.get(`${API_URL}${classId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const getClassMatieres = async (classId) => {
  const response = await axios.get(`${API_URL}${classId}/subjects/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const createClass = async (classData) => {
  const response = await axios.post(API_URL, classData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const updateClass = async (id, classData) => {
  const response = await axios.patch(`${API_URL}${id}/`, classData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

  export const deleteClass = async (id) => {
    const response = await axios.delete(`${API_URL}${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
    
};

// Fetch classes for the logged-in professor.
export const getMyClasses = async () => {
  const response = await axios.get(`${API_URL}my-classes/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};
