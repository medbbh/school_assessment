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
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user"); // Clear invalid user data
      setUser(null);
    } finally {
      setLoading(false); // Authentication check complete
    }
  }, []);

  const loginUser = (token, userData) => {
    console.log("LoginUser received:", userData); // Debug log

    if (!userData || !userData.role) {
      console.error("Error: userData is missing or has no role");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    switch (userData.role) {
      case "admin":
        navigate("/admin-dashboard");
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
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state to prevent early redirects
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
