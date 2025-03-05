import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; 
import { getStudentReport } from "../../api/gradeService";
import { downloadStudentBulletin } from "../../api/bulletinService";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import LogoutButton from "../../components/LogoutButton";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext); 
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Example: Hardcode the bulletin ID. If you have multiple bulletins, you'd fetch the right one.
  const bulletinId = 1;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (user?.role === "student" && user?.user_id) {
          const data = await getStudentReport(user.user_id);
          setReport(data);
        }
      } catch (error) {
        console.error("Error fetching student report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user]);

  const handleDownloadBulletin = async () => {
    setDownloading(true);
    try {
      await downloadStudentBulletin(bulletinId, user.user_id);
    } catch (error) {
      console.error("Error downloading bulletin PDF:", error);
      alert("Erreur lors du téléchargement du bulletin. Vérifiez si le bulletin est confirmé.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-blue-600">Chargement...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">Pas de données disponibles.</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="absolute top-4 right-4">
          <LogoutButton />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Student Overview */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{report.student}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Classe</p>
              <p className="text-lg font-semibold text-gray-900">
                {report.classe || "Aucune"}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">Moyenne Générale</p>
              <p className="text-lg font-semibold text-blue-900">
                {report.moyenne_generale}/20
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 flex flex-col justify-center">
              <button
                onClick={handleDownloadBulletin}
                disabled={downloading}
                className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2 ${
                  downloading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Télécharger mon Bulletin
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Grades Table */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notes</h2>
          {report.grades.length === 0 ? (
            <p className="text-gray-600">Pas de notes enregistrées.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Évaluation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matière</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.grades.map((grade) => {
                    const { assignment_detail } = grade;
                    const assignmentTitle = assignment_detail?.title || `ID: ${grade.assignment}`;
                    const subjectName = assignment_detail?.matiere?.name || "Inconnu";

                    return (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assignmentTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subjectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {grade.grade}/20
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(grade.date).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;