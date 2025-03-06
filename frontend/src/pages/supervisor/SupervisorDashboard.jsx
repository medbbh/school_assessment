import React from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Users } from "lucide-react";
import LogoutButton from "../../components/LogoutButton";

const SupervisorDashboard = () => {
  const navigate = useNavigate();

  const handleSelection = (option) => {
    if (option === "students") {
      navigate("/supervisor/select-class");
    } else if (option === "professors") {
      navigate("/supervisor/take-attendance/professors");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <LogoutButton className="mt-4" />
      <h1 className="text-4xl font-bold text-gray-800">Tableau de Bord Superviseur</h1>
      <p className="text-lg text-gray-600 mt-2 mb-8">Sélectionnez le type d'utilisateur pour marquer la présence.</p>

      <div className="grid grid-cols-1 gap-6 max-w-4xl w-full">
        <h2 className="text-2xl font-semibold text-gray-700">Prendre Présence</h2>
        
        <AttendanceCard 
          title="Étudiants" 
          description="Marquer la présence des étudiants par classe"
          icon={Users} 
          onClick={() => handleSelection("students")} 
          color="blue"
        />
        
        <AttendanceCard 
          title="Professeurs" 
          description="Marquer la présence des professeurs"
          icon={UserCheck} 
          onClick={() => handleSelection("professors")} 
          color="green"
        />
      </div>
    </div>
  );
};

const AttendanceCard = ({ title, description, icon: Icon, onClick, color }) => {
  const colorClasses = {
    blue: "text-blue-600 border-blue-200 bg-blue-50",
    green: "text-green-600 border-green-200 bg-green-50"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white shadow-lg rounded-lg p-6 border-l-4 ${colorClasses[color].split(' ')[1]} hover:shadow-xl transition cursor-pointer flex items-center`}
    >
      <div className={`${colorClasses[color].split(' ')[2]} p-4 rounded-full mr-6`}>
        <Icon size={28} className={colorClasses[color].split(' ')[0]} />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default SupervisorDashboard;