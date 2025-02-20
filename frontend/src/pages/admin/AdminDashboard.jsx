import React from "react";
import { Users, BookOpen, FileText, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
       <LogoutButton className="mt-4" />
      <h1 className="text-4xl font-bold text-gray-800">Tableau de Bord Administrateur</h1>
      <p className="text-lg text-gray-600 mt-2">Bienvenue, administrateur.</p>

      <div className="grid grid-cols-2 gap-6 mt-8 max-w-4xl">
        <DashboardCard title="Utilisateurs" icon={Users} path="/admin/users" />
        <DashboardCard title="Classes" icon={BookOpen} path="/admin/classes" />
        <DashboardCard title="matieres" icon={BookOpen} path="/admin/matieres" />
        <DashboardCard title="Rapports" icon={FileText} path="/admin/reports" />
        <DashboardCard title="Statistiques" icon={BarChart} path="/admin/stats" />
      </div>
    </div>
  );
};

const DashboardCard = ({ title, icon: Icon, path }) => (
  <Link to={path} className="bg-white shadow-lg p-6 rounded-lg flex items-center gap-4 hover:bg-gray-200 transition">
    <Icon size={28} className="text-blue-600" />
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
  </Link>
);

export default AdminDashboard;
