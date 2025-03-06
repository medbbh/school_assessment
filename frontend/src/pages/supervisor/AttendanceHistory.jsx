import React, { useEffect, useState } from "react";
import { getAttendanceHistory } from "../../api/attendanceService";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ArrowLeft, Calendar, CheckCircle, XCircle, Clock, User, List, ClipboardList, Search, Filter } from "lucide-react";

const AttendanceHistory = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const classeId = params.get("classe");

  useEffect(() => {
    fetchAttendance();
  }, [classeId, selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const filters = { classe: classeId, date: selectedDate };
      const data = await getAttendanceHistory(filters);
      setAttendanceRecords(data);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    }
    setLoading(false);
  };

  const filteredRecords = attendanceRecords
    .filter(record => record.student_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(record => statusFilter === "all" || record.status === statusFilter);

  const getStatusColor = (status) => {
    return status === "present" 
      ? "bg-green-100 text-green-800 border-green-200" 
      : status === "late" 
        ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
        : "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusIcon = (status) => {
    return status === "present" ? (
      <CheckCircle size={18} className="text-green-600" />
    ) : status === "late" ? (
      <Clock size={18} className="text-yellow-600" />
    ) : (
      <XCircle size={18} className="text-red-600" />
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gray-50">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => navigate("/supervisor/select-class")}
            className="flex items-center gap-2 text-gray-700 hover:text-black transition mb-4"
          >
            <ArrowLeft size={18} /> Retour
          </button>

          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-2 rounded-full mb-2">
              <ClipboardList size={32} className="text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
              Historique des Présences
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            {/* Date selector */}
            <div className="flex items-center gap-2 flex-grow">
              <div className="bg-gray-100 p-2 rounded-md">
                <Calendar size={18} className="text-gray-700" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow"
              />
              {selectedDate !== today && (
                <button
                  onClick={() => setSelectedDate(today)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Aujourd'hui
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 mt-4">
            <div className="bg-gray-100 p-2 rounded-md">
              <Filter size={18} className="text-gray-700" />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-sm font-medium rounded-md border ${
                  statusFilter === "all" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStatusFilter("present")}
                className={`px-3 py-1 text-sm font-medium rounded-md border ${
                  statusFilter === "present" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                Présent
              </button>
              <button
                onClick={() => setStatusFilter("late")}
                className={`px-3 py-1 text-sm font-medium rounded-md border ${
                  statusFilter === "late" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                En retard
              </button>
              <button
                onClick={() => setStatusFilter("absent")}
                className={`px-3 py-1 text-sm font-medium rounded-md border ${
                  statusFilter === "absent" ? "bg-red-100 text-red-800 border-red-200" : "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                Absent
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-medium">
                    <th className="py-3 px-4 text-left border-b"><div className="flex items-center gap-2"><User size={16} /> Élève</div></th>
                    <th className="py-3 px-4 text-left border-b"><div className="flex items-center gap-2"><List size={16} /> Statut</div></th>
                    <th className="py-3 px-4 text-left border-b"><div className="flex items-center gap-2"><Calendar size={16} /> Date</div></th>
                    <th className="py-3 px-4 text-left border-b"><div className="flex items-center gap-2"><Clock size={16} /> Heure</div></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-gray-500 bg-gray-50">
                        <div className="flex flex-col items-center">
                          <Search size={32} className="text-gray-400 mb-2" />
                          <p>Aucun enregistrement trouvé.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, index) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium">{record.student_name}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">{record.date}</td>
                        <td className="py-4 px-4 text-gray-700">{record.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;