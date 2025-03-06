import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageClasses from "./pages/admin/ManageClasses";
import ManageMatieres from "./pages/admin/ManageMatieres";

import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import ProfessorClassSubjects from "./pages/professor/ProfessorClassSubjects";
import ProfessorCreateAssignment from "./pages/professor/ProfessorCreateAssignment";
import ProfessorGradeAssignment from "./pages/professor/ProfessorGradeAssignment";

import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentChildDetail from "./pages/parent/ParentChildDetail";

import StudentDashboard from "./pages/student/StudentDashboard";

import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import TakeAttendanceStudents from "./pages/supervisor/TakeAttendanceStudents";
import TakeAttendanceProfessors from "./pages/supervisor/TakeAttendanceProfessors";
import AttendanceHistory from "./pages/supervisor/AttendanceHistory";
import SelectClassForAttendance from "./pages/supervisor/SelectClassForAttendance";

import AuthGuard from "./components/AuthGuard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<LoginPage />} />

      {/* ADMIN & SUPERVISOR => Both get stored as "Direction" */}
      <Route
        path="/admin-dashboard"
        element={
          <AuthGuard allowedRoles={["Direction"]}>
            <AdminDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AuthGuard allowedRoles={["Direction"]}>
            <ManageUsers />
          </AuthGuard>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <AuthGuard allowedRoles={["Direction"]}>
            <ManageClasses />
          </AuthGuard>
        }
      />
      <Route
        path="/admin/matieres"
        element={
          <AuthGuard allowedRoles={["Direction"]}>
            <ManageMatieres />
          </AuthGuard>
        }
      />

      <Route
        path="/supervisor-dashboard"
        element={
          <AuthGuard allowedRoles={["Direction"]}>
            <SupervisorDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/supervisor/take-attendance/students/:classId"
        element={
          <AuthGuard allowedRoles={["Direction"]}>
            <TakeAttendanceStudents />
          </AuthGuard>
        }
      />
      <Route
        path="/supervisor/take-attendance/professors"
        element={
          <AuthGuard allowedRoles={["Direction"]}>
            <TakeAttendanceProfessors />
          </AuthGuard>
        }
      />
      <Route
        path="/supervisor/select-class"
        element={
          <AuthGuard allowedRoles={["Direction"]}>
            <SelectClassForAttendance />
          </AuthGuard>
        }
      />
      <Route
        path="/supervisor/attendance-history"
        element={
          <AuthGuard allowedRoles={["Direction"]}>
            <AttendanceHistory />
          </AuthGuard>
        }
      />

      {/* PROFESSOR => "Professeur" */}
      <Route
        path="/professor-dashboard"
        element={
          <AuthGuard allowedRoles={["Professeur"]}>
            <ProfessorDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/professor/class/:classId"
        element={
          <AuthGuard allowedRoles={["Professeur"]}>
            <ProfessorClassSubjects />
          </AuthGuard>
        }
      />
      <Route
        path="/professor/subject/:subjectId/create-assignment"
        element={
          <AuthGuard allowedRoles={["Professeur"]}>
            <ProfessorCreateAssignment />
          </AuthGuard>
        }
      />
      <Route
        path="/professor/assignment/:assignmentId/grade"
        element={
          <AuthGuard allowedRoles={["Professeur"]}>
            <ProfessorGradeAssignment />
          </AuthGuard>
        }
      />

      {/* PARENT => "Parent" */}
      <Route
        path="/parent-dashboard"
        element={
          <AuthGuard allowedRoles={["Parent"]}>
            <ParentDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/parent/child/:childId"
        element={
          <AuthGuard allowedRoles={["Parent"]}>
            <ParentChildDetail />
          </AuthGuard>
        }
      />

      {/* STUDENT => "Étudiant" */}
      <Route
        path="/student-dashboard"
        element={
          <AuthGuard allowedRoles={["Étudiant"]}>
            <StudentDashboard />
          </AuthGuard>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
