import axios from "./axiosConfig"; // Ensure you have axiosConfig set up for baseURL

const API_URL = "/attendance/";

/**
 * Mark attendance for a user (student or professor)
 * @param {Object} attendanceData - { person, classe, status }
 */
export const markAttendance = async (attendanceData) => {
  console.log("attendanceData", attendanceData);
  try {
    const response = await axios.post(`${API_URL}`, attendanceData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la prise de présence:", error.response?.data || error.message);
    throw error.response?.data || "Erreur lors de la prise de présence.";
  }
};

export const getAttendanceHistory = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`/attendance/history/?${params}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique de présence:", error.response?.data || error.message);
    throw error.response?.data || "Erreur lors de la récupération de l'historique.";
  }
};




/**
 * Get attendance records for logged-in user
 */
export const getMyAttendance = async () => {
  try {
    const response = await axios.get(`${API_URL}my_attendance/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des présences:", error.response?.data || error.message);
    throw error.response?.data || "Erreur lors de la récupération des présences.";
  }
};



/**
 * Get attendance statistics per class (Admin Only)
 */
export const getClassAttendanceStats = async () => {
  try {
    const response = await axios.get(`${API_URL}class_attendance/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de présence:", error.response?.data || error.message);
    throw error.response?.data || "Erreur lors de la récupération des statistiques.";
  }
};

/**
 * Update an attendance record (Supervisor Only)
 * @param {number} attendanceId - ID of the attendance record
 * @param {Object} updatedData - { status }
 */
export const updateAttendance = async (attendanceId, updatedData) => {
  try {
    const response = await axios.patch(`${API_URL}${attendanceId}/`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la présence:", error.response?.data || error.message);
    throw error.response?.data || "Erreur lors de la mise à jour de la présence.";
  }
};

/**
 * Delete an attendance record (Supervisor Only)
 * @param {number} attendanceId - ID of the attendance record
 */
export const deleteAttendance = async (attendanceId) => {
  try {
    await axios.delete(`${API_URL}${attendanceId}/`);
    return { message: "Présence supprimée avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression de la présence:", error.response?.data || error.message);
    throw error.response?.data || "Erreur lors de la suppression de la présence.";
  }


};
