import axios from "axios";
import { getAuthHeaders } from "./authService";

/**
 * This function calls your single-student PDF route:
 *   /api/bulletins/<bulletin_id>/download-pdf-student/<student_id>/
 *
 * Make sure your backend’s BulletinViewSet has that action. 
 * Also, ensure the bulletin is confirmed (is_confirmed = true) or else you'll get 403.
 */
const API_URL = "http://localhost:8000/api/bulletins/";

export const downloadStudentBulletin = async (bulletinId, studentId) => {
  const url = `http://localhost:8000/api/bulletins/${bulletinId}/download-pdf-student/${studentId}/`;

  // responseType: "blob" to handle file downloads
  const response = await axios.get(url, {
    ...getAuthHeaders(),
    responseType: "blob",
  });

  // Create a temporary blob URL and trigger a file download
  const fileURL = window.URL.createObjectURL(new Blob([response.data]));
  const fileLink = document.createElement("a");
  fileLink.href = fileURL;
  fileLink.setAttribute("download", `Bulletin_${bulletinId}.pdf`);
  document.body.appendChild(fileLink);
  fileLink.click();
  fileLink.remove();
};

export const createBulletin = async (data) => {
    // data = { classe: 3, term_name: "Semestre 1" }
    const response = await axios.post(API_URL, data, getAuthHeaders());
    return response.data;
  };
  

export const confirmBulletin = async (bulletinId) => {
    const response = await axios.post(
      `${API_URL}${bulletinId}/confirm/`,
      {},
      getAuthHeaders()
    );
    return response.data;
};