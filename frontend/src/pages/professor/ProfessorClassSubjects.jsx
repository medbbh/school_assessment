import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSubjectsByClass } from "../../api/subjectService";
import { getAssignmentsBySubject } from "../../api/assignmentService";
import { 
  BookOpen, 
  ArrowLeft,
  Plus,
  ClipboardList,
  Scale,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Timer
} from "lucide-react";

const ProfessorClassSubjects = () => {
  const { classId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjectsByClass(classId);
        console.log(data)
        setSubjects(data);
        setError("");
      } catch (error) {
        setError("Erreur lors du chargement des matières.");
        console.error("Error fetching subjects:", error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [classId]);

  const handleSubjectSelect = async (subject) => {
    setSelectedSubject(subject);
    setLoadingAssignments(true);
    try {
      const data = await getAssignmentsBySubject(subject.id);
      setAssignments(data);
      setError("");
    } catch (error) {
      setError("Erreur lors du chargement des affectations.");
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/professor-dashboard"
          className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Link>
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">
            Matières - Classe {classId}
          </h1>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Subjects List */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-800">Liste des Matières</h2>
            </div>
            
            {loadingSubjects ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-4 text-slate-600">
                Aucune matière trouvée pour cette classe.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:bg-slate-50 ${
                      selectedSubject?.id === subject.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-800">{subject.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                          <Scale className="w-4 h-4" />
                          Coefficient: {subject.coefficient}
                        </div>
                      </div>
                      {selectedSubject?.id === subject.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignments Section */}
        {selectedSubject && (
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">
                    Affectations - {selectedSubject.name}
                  </h2>
                  <Link
                    to={`/professor/subject/${selectedSubject.id}/create-assignment?classId=${classId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle affectation
                  </Link>
                </div>
              </div>

              <div className="p-4">
                {loadingAssignments ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8 text-slate-600">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p>Aucune affectation pour cette matière.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-slate-800">
                              {assignment.title}
                            </h3>
                            <p className="mt-1 text-slate-600">
                              {assignment.description}
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-slate-600">
                                <Calendar className="w-4 h-4" />
                                {assignment.dueDate}
                              </div>
                              <div className="flex items-center gap-1 text-slate-600">
                                <Timer className="w-4 h-4" />
                                {assignment.duration}
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                {assignment.status}
                              </div>
                            </div>
                          </div>
                          <Link
                            to={`/professor/assignment/${assignment.id}/grade`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Noter
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorClassSubjects;