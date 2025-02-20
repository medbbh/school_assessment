import React, { useEffect, useState } from "react";
import { getClasses, createClass, updateClass, deleteClass } from "../../api/classService";
import { createBulletin, confirmBulletin } from "../../api/bulletinService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle, Search, Trash2, Loader2 } from "lucide-react";

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await getClasses();
      // Initialize each class with "hasConfirmedBulletin" = false by default
      const enriched = data.map(cls => ({ ...cls, hasConfirmedBulletin: false }));
      setClasses(enriched);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des classes.");
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      await createClass({ name: newClassName });
      loadClasses();
      setNewClassName("");
      toast.success("Classe ajoutée avec succès !");
    } catch (err) {
      toast.error("Erreur lors de l'ajout de la classe.");
    }
  };

  const handleUpdateClass = async (id, newName) => {
    try {
      await updateClass(id, { name: newName });
      setClasses(classes.map(cls => (cls.id === id ? { ...cls, name: newName } : cls)));
      toast.success("Classe mise à jour avec succès !");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour de la classe.");
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      try {
        await deleteClass(id);
        setClasses(classes.filter(cls => cls.id !== id));
        toast.success("Classe supprimée avec succès !");
      } catch (err) {
        toast.error("Erreur lors de la suppression de la classe.");
      }
    }
  };

  const handleConfirmBulletin = async (classId) => {
    try {
      // 1) Create a new bulletin for this class
      const bulletin = await createBulletin({
        classe: classId,
        term_name: "Semestre 1"
      });
      // 2) Confirm that bulletin
      await confirmBulletin(bulletin.id);

      toast.success(`Bulletin de la classe ${classId} confirmé avec succès !`);

      // 3) Update local state to mark this class as having a confirmed bulletin
      setClasses(classes.map(cls => (
        cls.id === classId
          ? { ...cls, hasConfirmedBulletin: true }
          : cls
      )));
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la confirmation du bulletin.");
    }
  };

  // Pagination Logic
  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);
  const displayedClasses = filteredClasses.slice(
    (currentPage - 1) * classesPerPage,
    currentPage * classesPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-6">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors w-fit"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Retour au tableau de bord</span>
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900">
            Gestion des Classes
          </h1>
        </div>

        {/* Add & Search Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          {/* Add New Class */}
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Ajouter une nouvelle classe..."
              className="w-full px-4 py-3 rounded-md border border-gray-300 
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                transition-colors text-gray-800 bg-transparent
                hover:bg-white focus:bg-white"
            />
            <button
              onClick={handleAddClass}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
            >
              <PlusCircle size={22} />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une classe..."
              className="w-full px-4 py-3 rounded-md border border-gray-300 
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                transition-colors text-gray-800 bg-transparent
                hover:bg-white focus:bg-white"
            />
            <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Class List */}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Nom de la Classe</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedClasses.map((cls, index) => {
                    const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/30";
                    const buttonStyle = cls.hasConfirmedBulletin
                      ? "bg-red-600 hover:bg-red-700 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700";
                    const buttonDisabled = cls.hasConfirmedBulletin;

                    return (
                      <tr key={cls.id} className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${rowBg}`}>
                        <td className="py-4 px-6 text-sm text-gray-600">{cls.id}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <input
                            type="text"
                            value={cls.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setClasses(classes.map(c => c.id === cls.id ? { ...c, name: newName } : c));
                            }}
                            onBlur={(e) => handleUpdateClass(cls.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-200 
                              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                              transition-colors text-gray-800 bg-transparent
                              hover:bg-white focus:bg-white"
                          />
                        </td>
                        <td className="py-4 px-6 flex items-center gap-2">
                          {/* Confirm Bulletin Button */}
                          <button
                            onClick={() => !buttonDisabled && handleConfirmBulletin(cls.id)}
                            className={`px-3 py-2 text-sm font-medium text-white rounded ${buttonStyle}`}
                            disabled={buttonDisabled}
                          >
                            {cls.hasConfirmedBulletin ? "Bulletin Confirmé" : "Confirmer le Bulletin"}
                          </button>

                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-4 py-2 mx-1 rounded ${currentPage === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageClasses;
