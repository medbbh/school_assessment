import React from "react";
import { UserCircle, BookOpen, Users, Shield } from "lucide-react";

const RoleSelection = ({ selectedRole, setSelectedRole }) => {
  // Notice we do NOT have a separate Surveillant line here.
  // We unify admin & supervisor under "Direction".
  const roles = [
    { id: "Étudiant",   backendId: "student",    icon: BookOpen },
    { id: "Parent",     backendId: "parent",     icon: Users },
    { id: "Professeur", backendId: "professor",  icon: UserCircle },
    { id: "Direction",  backendId: "admin",      icon: Shield },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 transition-all duration-300">
      {roles.map(({ id, backendId, icon: Icon }) => (
        <button
          key={id}
          // We pass the English code to setSelectedRole
          onClick={() => setSelectedRole(backendId)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg
            transition-all duration-300 transform hover:scale-105
            ${
              selectedRole === backendId
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow"
            }`}
        >
          <Icon size={20} />
          <span className="font-medium">{id}</span>
        </button>
      ))}
    </div>
  );
};

export default RoleSelection;
