import React, { useState, useEffect } from "react";
import { createAssignment } from "../../api/assignmentService";
import { getProfessorSubjects } from "../../api/subjectService";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { 
  BookOpen, 
  ArrowLeft,
  AlertCircle,
  ClipboardList,
  Calendar,
  Timer
} from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ProfessorCreateAssignment = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const query = useQuery();
  const classId = query.get("classId");

  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    matiere_id: subjectId,
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!subjectId) {
      const fetchSubjects = async () => {
        try {
          const data = await getProfessorSubjects();
          setSubjects(data);
        } catch (error) {
          console.error("Error fetching subjects:", error);
          setMessage("Erreur lors du chargement des matières.");
        }
      };
      fetchSubjects();
    }
  }, [subjectId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const assignment = await createAssignment(formData);
      setMessage("Affectation créée avec succès !");
      navigate(`/professor/assignment/${assignment.id}/grade`);
    } catch (error) {
      console.error("Error creating assignment:", error);
      setMessage("Erreur lors de la création de l'affectation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/professor/class/${classId}/`}
          className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux matières
        </Link>
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">
            Créer une Affectation
          </h1>
        </div>
      </div>

      {/* Error/Success Message */}
      {message && (
        <div className={`mb-6 flex items-center gap-2 ${
          message.includes("succès")
            ? "text-green-600 bg-green-50 border-green-200"
            : "text-red-600 bg-red-50 border-red-200"
        } p-4 rounded-lg border`}>
          <AlertCircle className="w-5 h-5" />
          <p>{message}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Détails de l'affectation</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  placeholder="Entrez le titre de l'affectation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Décrivez l'affectation en détail"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="w-4 h-4" />
                      Créer l'affectation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCreateAssignment;