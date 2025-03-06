import React, { useEffect, useState } from "react";
import { getProfessors } from "../../api/userService";
import { markAttendance } from "../../api/attendanceService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Clock, Search, Save, ClipboardList } from "lucide-react";

const TakeAttendanceProfessors = () => {
  const [professors, setProfessors] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const data = await getProfessors();
        setProfessors(data);
        
        // Set default attendance to "present"
        const initialAttendance = {};
        data.forEach(prof => {
          initialAttendance[prof.id] = "present";
        });
        setAttendance(initialAttendance);
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des professeurs:", error);
        setLoading(false);
      }
    };
    fetchProfessors();
  }, []);

  const handleAttendanceChange = (professorId, status) => {
    setAttendance({ ...attendance, [professorId]: status });
  };

  const submitAttendance = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        Object.keys(attendance).map((professorId) =>
          markAttendance({
            person: professorId,
            classe: null, // No class for professors
            status: attendance[professorId],
          })
        )
      );
      toast.success("Présence enregistrée avec succès !");
      navigate("/supervisor-dashboard");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Erreur lors de l'enregistrement de la présence.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter professors based on search term
  const filteredProfessors = professors.filter(prof => 
    prof.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gray-50">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => navigate("/supervisor-dashboard")}
            className="flex items-center gap-2 text-gray-700 hover:text-black transition mb-4"
          >
            <ArrowLeft size={18} /> Retour
          </button>

          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-2 rounded-full mb-2">
              <ClipboardList size={32} className="text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
              Prendre la Présence - Professeurs
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un professeur..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Professor List */}
            <div className="p-6">
              {filteredProfessors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Search size={40} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-lg">Aucun professeur trouvé.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProfessors.map((prof) => (
                    <div 
                      key={prof.id} 
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="bg-blue-50 p-2 rounded-full mr-3">
                          <CheckCircle size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{prof.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <select
                          value={attendance[prof.id] || "present"}
                          onChange={(e) => handleAttendanceChange(prof.id, e.target.value)}
                          className="px-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="present">✓ Présent</option>
                          <option value="absent">✗ Absent</option>
                          <option value="late">⏱️ En retard</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={submitAttendance}
                  disabled={isSaving || filteredProfessors.length === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
                    isSaving || filteredProfessors.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } transition`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Enregistrer la Présence</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TakeAttendanceProfessors;