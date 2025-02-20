import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const LogoutButton = ({ label = "Se Déconnecter", className = "" }) => {
  const { logoutUser } = useContext(AuthContext);
  const [showDialog, setShowDialog] = useState(false);

  const handleLogout = () => {
    logoutUser(); // Removes token & redirects to login
    setShowDialog(false);
  };

  return (
    <>
      <div className="fixed top-4 right-4">
        <button
          onClick={() => setShowDialog(true)}
          className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition ${className}`}
        >
          {label}
        </button>
      </div>

      {/* Alert Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Confirmer la déconnexion</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;