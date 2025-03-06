import React, { useEffect, useState } from "react";
import { getClasses } from "../../api/classService";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ClipboardCheck, History, Users, School, Search, ChevronLeft, ChevronRight } from "lucide-react";

const SelectClassForAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 5;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des classes:", error);
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(classe => 
    classe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = filteredClasses.slice(indexOfFirstClass, indexOfLastClass);
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <button
          onClick={() => navigate("/supervisor-dashboard")}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 transition mb-6"
        >
          <ArrowLeft size={20} /> Retour au Tableau de Bord
        </button>

        <div className="flex flex-col items-center mb-6">
          <School size={40} className="text-blue-700 mb-2" />
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Sélectionner une Classe
          </h1>
          <p className="mt-2 text-gray-700 text-center">
            Choisissez une classe pour marquer la présence ou consulter l'historique
          </p>
        </div>

        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une classe..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-12 h-12 animate-spin text-blue-700" />
            <span className="ml-3 text-gray-600 font-medium">Chargement des classes...</span>
          </div>
        ) : (
          <div className="p-6">
            {filteredClasses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <School size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg">
                  {searchTerm ? `Aucune classe trouvée pour "${searchTerm}"` : "Aucune classe disponible pour le moment"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 mb-6">
                  {currentClasses.map((classe) => (
                    <ClassCard key={classe.id} classe={classe} navigate={navigate} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ClassCard = ({ classe, navigate }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row md:items-center">
        <div className="flex-1 mb-4 md:mb-0">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users size={24} className="text-blue-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{classe.name}</h3>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/supervisor/take-attendance/students/${classe.id}`)}
            className="flex items-center justify-center gap-2 bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 rounded-md transition font-medium"
          >
            <ClipboardCheck size={18} />
            <span>Prendre Présence</span>
          </button>
          <button
            onClick={() => navigate(`/supervisor/attendance-history?classe=${classe.id}`)}
            className="flex items-center justify-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-md transition font-medium"
          >
            <History size={18} />
            <span>Historique</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectClassForAttendance;
