import React, { useState, useEffect } from "react";
import { getAssignment } from "../../api/assignmentService";
import { getStudentsByClass } from "../../api/studentService";
import { createGrade } from "../../api/gradeService";
import { Loader2, ArrowLeft, AlertCircle, UserCheck, ClipboardCheck } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { getSubjectsByClass } from "../../api/subjectService";
import { getAssignmentsBySubject } from "../../api/assignmentService";

const ProfessorGradeAssignment = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [gradesInput, setGradesInput] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const data = await getAssignment(assignmentId);
        setAssignment(data);
        console.log(data)
      } catch (error) {
        console.error("Erreur lors du chargement de l'exercice :", error);
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  useEffect(() => {
    if (assignment && assignment.matiere && assignment.matiere.classe) {
      const classId = assignment.matiere.classe;
      const fetchStudents = async () => {
        try {
          const data = await getStudentsByClass(classId);
          setStudents(data);
        } catch (error) {
          console.error("Erreur lors du chargement des étudiants :", error);
          setStudents([]);
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    }
  }, [assignment]);

  const handleGradeChange = (studentId, value) => {
    setGradesInput((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSubmitGrade = async (studentId) => {
    const gradeValue = gradesInput[studentId];
    if (gradeValue === "" || gradeValue === undefined) {
      setMessage("Veuillez entrer une note.");
      return;
    }
    try {
      await createGrade({
        student: studentId,
        assignment: assignmentId,
        grade: gradeValue,
      });
      setMessage(`Note soumise pour l'étudiant ${studentId}.`);
      setGradesInput((prev) => ({ ...prev, [studentId]: "" }));
    } catch (error) {
      console.error("Erreur lors de la soumission de la note :", error);
      setMessage("Erreur lors de la soumission de la note.");
    }
  };

  if (!assignment && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chargement des détails de l'exercice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={`/professor/class/${assignment.matiere.classe}`}
          className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste des matières
        </Link>
        {assignment && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                {assignment.title}
              </h2>
              <h5 className="ont-bold text-gray-900 tracking-tight">
                {assignment.description}
              </h5>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {assignment.matiere ? assignment.matiere.name : "N/A"}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                  Classe : {assignment.matiere?.classe || "N/A"}
                </span>
              </div>
            </div>

            {message && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <p className="text-blue-700">{message}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Chargement des étudiants...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Aucun étudiant trouvé pour cette classe.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Note (sur 20)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.username}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            value={gradesInput[student.id] || ""}
                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                            className="block w-32 rounded-lg border-gray-300 bg-gray-50 group-hover:bg-white shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="0.0"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleSubmitGrade(student.id)}
                            className="inline-flex items-center px-4 py-2 space-x-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                          >
                            <ClipboardCheck className="h-4 w-4" />
                            <span>Soumettre la note</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorGradeAssignment;
