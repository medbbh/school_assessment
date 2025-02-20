import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyChildren } from "../../api/userService";
import { BookOpen, User } from "lucide-react";
import LogoutButton from "../../components/LogoutButton";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await getMyChildren();
        setChildren(data);
      } catch (error) {
        console.error("Error fetching children:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-blue-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
       <LogoutButton className="mt-4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Portail des Parents</h1>
          <p className="text-lg text-gray-600">Suivez les progrès de vos enfants</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Mes Enfants
          </h2>
        </div>

        {children.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">Vous n'avez aucun enfant enregistré.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/parent/child/${child.id}`}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {child.username}
                      </h3>
                      <p className="text-sm text-gray-500">Voir le profil scolaire</p>
                    </div>
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

export default ParentDashboard;