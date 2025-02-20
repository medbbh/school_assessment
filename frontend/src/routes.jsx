import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageClasses from "./pages/admin/ManageClasses";
import AuthGuard from "./components/AuthGuard";
import ManageMatieres from "./pages/admin/ManageMatieres";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import ProfessorClassSubjects from "./pages/professor/ProfessorClassSubjects";
import ProfessorCreateAssignment from "./pages/professor/ProfessorCreateAssignment";
import ProfessorGradeAssignment from "./pages/professor/ProfessorGradeAssignment";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentChildDetail from "./pages/parent/ParentChildDetail";
import StudentDashboard from "./pages/student/StudentDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      {/* ADMIN ROUTES */}
      <Route path="/admin-dashboard" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
      <Route path="/admin/users" element={<AuthGuard><ManageUsers /></AuthGuard>} />
      <Route path="/admin/classes" element={<AuthGuard><ManageClasses /></AuthGuard>} />
      <Route path="/admin/matieres" element={<AuthGuard><ManageMatieres /></AuthGuard>} />

      {/* PROFESSOR ROUTES */}
      <Route
          path="/professor-dashboard"
          element={
            <AuthGuard>
              <ProfessorDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/professor/class/:classId"
          element={
            <AuthGuard>
              <ProfessorClassSubjects />
            </AuthGuard>
          }
        />
        <Route
          path="/professor/subject/:subjectId/create-assignment"
          element={
            <AuthGuard>
              <ProfessorCreateAssignment />
            </AuthGuard>
          }
        />
        <Route
          path="/professor/assignment/:assignmentId/grade"
          element={
            <AuthGuard>
              <ProfessorGradeAssignment />
            </AuthGuard>
          }
        />

          {/* PARENT ROUTES */}
                  {/* PARENT ROUTES */}
          <Route
          path="/parent-dashboard"
          element={
            <AuthGuard allowedRoles={["parent"]}>
              <ParentDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/parent/child/:childId"
          element={
            <AuthGuard allowedRoles={["parent"]}>
              <ParentChildDetail />
            </AuthGuard>
          }
        />

        {/* STUDENT ROUTES */}
        <Route
          path="/student-dashboard"
          element={
            <AuthGuard allowedRoles={["student"]}>
              <StudentDashboard />
            </AuthGuard>
          }
        />
    </Routes>
  );
};

export default AppRoutes;
