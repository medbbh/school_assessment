import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentsByClass } from "../../api/studentService";
import { markAttendance } from "../../api/attendanceService";
import { toast } from "react-toastify";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Clock, Search, Save, UserCheck, Calendar, ClipboardList } from "lucide-react";

const TakeAttendanceStudents = () => {
  const { classId } = useParams();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [className, setClassName] = useState("");
  const navigate = useNavigate();
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudentsByClass(classId);
        setStudents(data);
        
        // Initialize all students as present by default
        const initialAttendance = {};
        data.forEach(student => {
          initialAttendance[student.id] = "present";
        });
        setAttendance(initialAttendance);
        
        // Get class name if available in the API response
        if (data.length > 0 && data[0].className) {
          setClassName(data[0].className);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur de chargement des étudiants:", error);
        toast.error("Impossible de charger la liste des étudiants");
        setLoading(false);
      }
    };
    fetchStudents();
  }, [classId]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const submitAttendance = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        Object.keys(attendance).map((studentId) =>
          markAttendance({
            person: studentId,
            classe: classId,
            status: attendance[studentId],
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
  
  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Count statistics
  const presentCount = Object.values(attendance).filter(status => status === "present").length;
  const absentCount = Object.values(attendance).filter(status => status === "absent").length;
  const lateCount = Object.values(attendance).filter(status => status === "late").length;

  const getStatusColor = (status) => {
    return status === "present" 
      ? "bg-green-100 text-green-800 border-green-200" 
      : status === "late" 
        ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
        : "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gray-50">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => navigate("/supervisor/select-class")}
            className="flex items-center gap-2 text-gray-700 hover:text-black transition mb-4"
          >
            <ArrowLeft size={18} /> Retour
          </button>

          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-2 rounded-full mb-2">
              <ClipboardList size={32} className="text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
              Prendre la Présence
            </h1>
            <p className="mt-2 text-gray-600">
              {className ? className : "Classe"} - {formattedDate}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Time and Search Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                {/* Current time */}
                <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                  <Clock size={20} className="text-gray-700" />
                  <div>
                    <p className="text-sm text-gray-600">Heure actuelle</p>
                    <p className="font-semibold">{formattedTime}</p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="flex flex-wrap gap-3">
                <div className="bg-green-50 border border-green-100 text-green-700 px-3 py-2 rounded-md flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span>Présents: {presentCount}</span>
                </div>
                <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-md flex items-center gap-2">
                  <XCircle size={18} className="text-red-600" />
                  <span>Absents: {absentCount}</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 px-3 py-2 rounded-md flex items-center gap-2">
                  <Clock size={18} className="text-yellow-600" />
                  <span>En retard: {lateCount}</span>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="p-6">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Search size={40} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-lg">
                    {searchTerm ? `Aucun étudiant trouvé pour "${searchTerm}"` : "Aucun étudiant dans cette classe"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="bg-blue-50 p-2 rounded-full mr-3">
                          {student.avatar ? (
                            <img 
                              src={student.avatar} 
                              alt={student.username} 
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <UserCheck size={20} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{student.username}</p>
                          {student.studentId && (
                            <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end">
                        <select
                          value={attendance[student.id] || "present"}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                          className={`px-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            getStatusColor(attendance[student.id])
                          }`}
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
                  disabled={isSaving || filteredStudents.length === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
                    isSaving || filteredStudents.length === 0
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

export default TakeAttendanceStudents;