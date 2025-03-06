import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    try {
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (token && parsedUser) {
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("❌ Error parsing user data:", error);
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    console.log("🔹 loginUser received from backend:", userData);

    if (!userData || !userData.role) {
      console.error("❌ Error: userData is missing or has no 'role' field");
      return;
    }

    // We'll unify admin and supervisor under "Direction" in French
    // but we also keep track of the original role in subRole
    let frontendRole = "";
    let subRole = userData.role; // e.g. "admin" or "supervisor"

    switch (userData.role) {
      case "admin":
      case "supervisor":
        frontendRole = "Direction";
        break;
      case "professor":
        frontendRole = "Professeur";
        break;
      case "student":
        frontendRole = "Étudiant";
        break;
      case "parent":
        frontendRole = "Parent";
        break;
      default:
        frontendRole = userData.role; // fallback
    }

    const updatedUserData = {
      ...userData,
      role: frontendRole, 
      subRole, // store the actual backend role
    };

    // Put token & user in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    setUser(updatedUserData);

    // Then redirect based on the *actual* subRole from the backend
    setTimeout(() => {
      console.log("🔹 Real subRole:", subRole);
      switch (subRole) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "supervisor":
          navigate("/supervisor-dashboard");
          break;
        case "professor":
          navigate("/professor-dashboard");
          break;
        case "student":
          navigate("/student-dashboard");
          break;
        case "parent":
          navigate("/parent-dashboard");
          break;
        default:
          navigate("/");
      }
    }, 100);
  };

  const logoutUser = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
