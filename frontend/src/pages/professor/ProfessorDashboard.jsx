import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyClasses } from "../../api/classService";
import { 
  GraduationCap, 
  Users, 
  Clock, 
  Calendar,
  BookOpen,
  AlertCircle
} from "lucide-react";

const ProfessorDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getMyClasses();
        setClasses(data);
        console.log(data)
      } catch (error) {
        console.error("Error fetching classes:", error);
        setError("Impossible de charger les classes. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">Tableau de Bord Professeur</h1>
        </div>
        <p className="text-slate-600">Gérez vos classes et suivez les progrès de vos élèves</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Total Classes</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{classes.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center gap-3 text-green-600 mb-2">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-semibold">Cours Actifs</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">
          {classes.reduce((total, cls) => total + (cls.student_count || 0), 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-semibold">Anée Scolaire</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {new Date().getFullYear() -1}-{new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Mes Classes</h2>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                to={`/professor/class/${cls.id}`}
                className="group bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">{cls.name}</h3>
                    </div>
                    {cls.status === 'active' && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                        Actif
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{cls.student_count || '0'} étudiants</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg">
                  <div className="text-sm text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    Voir les détails →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorDashboard;