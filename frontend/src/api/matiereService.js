import axios from "axios";
import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:8000/api/subjects/";
const CLASSES_API = "http://localhost:8000/api/classes/";
const PROFESSORS_API = "http://localhost:8000/api/auth/users/role/professor/";

export const getMatieres = async () => {
  const [matieresRes, classesRes, professorsRes] = await Promise.all([
    axios.get(API_URL, getAuthHeaders()),
    axios.get(CLASSES_API, getAuthHeaders()),
    axios.get(PROFESSORS_API, getAuthHeaders()),
  ]);

  const classes = classesRes.data.reduce((acc, cls) => {
    acc[cls.id] = cls.name;
    return acc;
  }, {});

  const professors = professorsRes.data.reduce((acc, prof) => {
    acc[prof.id] = prof.username;
    return acc;
  }, {});

  return matieresRes.data.map(matiere => ({
    ...matiere,
    classeName: classes[matiere.classe] || "Inconnu",
    professorName: professors[matiere.professor] || "Non Assigné",
  }));
};

export const createMatiere = async (matiereData) => {
  return axios.post(API_URL, matiereData, getAuthHeaders());
};

export const updateMatiere = async (id, matiereData) => {
  return axios.patch(`${API_URL}${id}/`, matiereData, getAuthHeaders());
};

export const deleteMatiere = async (id) => {
  return axios.delete(`${API_URL}${id}/`, getAuthHeaders());
};

export const getClasses = async () => {
  const response = await axios.get(CLASSES_API, getAuthHeaders());
  return response.data;
};

export const getProfessors = async () => {
  const response = await axios.get(PROFESSORS_API, getAuthHeaders());
  return response.data;
};

export const getProfessorSubjectsCount = async (professorId) => {
  const matieres = await getMatieres();
  return matieres.filter(matiere => matiere.professor === professorId).length;
};