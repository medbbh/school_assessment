import React, { useEffect, useState } from "react";
import { getMatieres, createMatiere, updateMatiere, deleteMatiere, getClasses, getProfessors } from "../../api/matiereService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle, Trash2, Edit3, Check, X, Loader2 } from "lucide-react";

const ManageMatieres = () => {
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMatiere, setNewMatiere] = useState({ name: "", classe: "", professor: "" });
  const [editingMatiere, setEditingMatiere] = useState(null);
  const [updatedMatiere, setUpdatedMatiere] = useState({ name: "", classe: "", professor: "" });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [matieresData, classesData, professorsData] = await Promise.all([
        getMatieres(),
        getClasses(),
        getProfessors(),
      ]);
      setMatieres(matieresData);
      setClasses(classesData);
      setProfessors(professorsData);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des données.");
      setLoading(false);
    }
  };

  const handleAddMatiere = async (e) => {
    e.preventDefault();
    if (!newMatiere.name.trim() || !newMatiere.classe || !newMatiere.professor) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    try {
      await createMatiere({
        name: newMatiere.name,
        classe: parseInt(newMatiere.classe),
        professor: parseInt(newMatiere.professor)
      });
      await loadData();
      setNewMatiere({ name: "", classe: "", professor: "" });
      toast.success("Matière ajoutée avec succès !");
    } catch (err) {
      toast.error("Erreur lors de l'ajout de la matière.");
    }
  };

  const handleDeleteMatiere = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) {
      try {
        await deleteMatiere(id);
        await loadData();
        toast.success("Matière supprimée avec succès !");
      } catch (err) {
        toast.error("Erreur lors de la suppression de la matière.");
      }
    }
  };

  const handleStartEditing = (matiere) => {
    setEditingMatiere(matiere.id);
    setUpdatedMatiere({
      name: matiere.name,
      classe: matiere.classe,
      professor: matiere.professor
    });
  };

  const handleUpdateMatiere = async (id) => {
    try {
      await updateMatiere(id, {
        name: updatedMatiere.name,
        classe: parseInt(updatedMatiere.classe),
        professor: parseInt(updatedMatiere.professor)
      });
      await loadData();
      setEditingMatiere(null);
      toast.success("Matière mise à jour avec succès !");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour de la matière.");
    }
  };

  const getClasseName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.name : "Inconnu";
  };

  const getProfessorName = (professorId) => {
    const professor = professors.find(p => p.id === professorId);
    return professor ? professor.username : "Non Assigné";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors w-fit"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Retour au tableau de bord</span>
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900">
            Gestion des Matières
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Add New Matière Form */}
            <div className="p-6 border-b border-gray-200">
              <form className="flex flex-col md:flex-row gap-4" onSubmit={handleAddMatiere}>
                <input
                  type="text"
                  value={newMatiere.name}
                  onChange={(e) => setNewMatiere({ ...newMatiere, name: e.target.value })}
                  placeholder="Nom de la matière"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 
                    focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 
                    transition-colors bg-gray-50 hover:bg-white focus:bg-white"
                />
                <select
                  value={newMatiere.classe}
                  onChange={(e) => setNewMatiere({ ...newMatiere, classe: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 
                    focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 
                    transition-colors bg-gray-50 hover:bg-white focus:bg-white"
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <select
                  value={newMatiere.professor}
                  onChange={(e) => setNewMatiere({ ...newMatiere, professor: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 
                    focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 
                    transition-colors bg-gray-50 hover:bg-white focus:bg-white"
                >
                  <option value="">Sélectionner un professeur</option>
                  {professors.map(prof => (
                    <option key={prof.id} value={prof.id}>{prof.username}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                    transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <PlusCircle size={20} />
                  Ajouter
                </button>
              </form>
            </div>

            {/* Matières Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Nom</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Classe</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Professeur</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matieres.map((mat, index) => (
                    <tr 
                      key={mat.id}
                      className={`
                        border-b border-gray-100 last:border-b-0
                        hover:bg-gray-50 transition-colors
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                      `}
                    >
                      <td className="py-4 px-6">
                        {editingMatiere === mat.id ? (
                          <input
                            type="text"
                            value={updatedMatiere.name}
                            onChange={(e) => setUpdatedMatiere({ ...updatedMatiere, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-gray-200 
                              focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 
                              transition-colors bg-white"
                          />
                        ) : (
                          mat.name
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingMatiere === mat.id ? (
                          <select
                            value={updatedMatiere.classe}
                            onChange={(e) => setUpdatedMatiere({ ...updatedMatiere, classe: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-gray-200 
                              focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 
                              transition-colors bg-white"
                          >
                            {classes.map(cls => (
                              <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                          </select>
                        ) : (
                          getClasseName(mat.classe)
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingMatiere === mat.id ? (
                          <select
                            value={updatedMatiere.professor}
                            onChange={(e) => setUpdatedMatiere({ ...updatedMatiere, professor: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-gray-200 
                              focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 
                              transition-colors bg-white"
                          >
                            {professors.map(prof => (
                              <option key={prof.id} value={prof.id}>{prof.username}</option>
                            ))}
                          </select>
                        ) : (
                          getProfessorName(mat.professor)
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          {editingMatiere === mat.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateMatiere(mat.id)}
                                className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                              >
                                <Check size={20} />
                              </button>
                              <button
                                onClick={() => setEditingMatiere(null)}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                              >
                                <X size={20} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEditing(mat)}
                                className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                <Edit3 size={20} />
                              </button>
                              <button
                                onClick={() => handleDeleteMatiere(mat.id)}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMatieres;