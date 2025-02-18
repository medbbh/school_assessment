import React, { useEffect, useState } from "react";
import { getUsers, updateUser } from "../../api/userService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Shield, 
  GraduationCap, 
  User, 
  Users,
  Loader2 
} from "lucide-react";

const roleIcons = {
  admin: <Shield className="w-4 h-4 text-indigo-600" />,
  professor: <GraduationCap className="w-4 h-4 text-blue-600" />,
  student: <User className="w-4 h-4 text-emerald-600" />,
  parent: <Users className="w-4 h-4 text-amber-600" />
};

const roleColors = {
  admin: "bg-indigo-50 text-indigo-700 border-indigo-100",
  professor: "bg-blue-50 text-blue-700 border-blue-100",
  student: "bg-emerald-50 text-emerald-700 border-emerald-100",
  parent: "bg-amber-50 text-amber-700 border-amber-100"
};

const roleLabels = {
  admin: "Administrateur",
  professor: "Professeur",
  student: "Étudiant",
  parent: "Parent"
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs.");
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUser(id, { role: newRole });
      setUsers(users.map((user) => 
        user.id === id ? { ...user, role: newRole } : user
      ));
      toast.success("Rôle mis à jour avec succès !");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du rôle.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors w-fit"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Retour au tableau de bord</span>
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            Gestion des Utilisateurs
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="mb-6 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg 
                      focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 
                      transition-colors bg-gray-50 hover:bg-white focus:bg-white"
                  />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">ID</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Nom d'utilisateur</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Rôle</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr 
                          key={user.id}
                          className={`
                            border-b border-gray-100 last:border-b-0
                            hover:bg-gray-50 transition-colors
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                          `}
                        >
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {user.id}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                            {user.username}
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${roleColors[user.role]}`}>
                              {roleIcons[user.role]}
                              <span className="text-sm font-medium">{roleLabels[user.role]}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="px-3 py-2 text-sm border border-gray-200 rounded-lg 
                                focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 
                                transition-colors cursor-pointer bg-gray-50 
                                hover:bg-white focus:bg-white"
                            >
                              <option value="admin">Administrateur</option>
                              <option value="professor">Professeur</option>
                              <option value="student">Étudiant</option>
                              <option value="parent">Parent</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-500 px-6">
                  {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;