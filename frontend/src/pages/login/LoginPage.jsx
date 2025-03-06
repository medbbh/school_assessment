import React, { useState } from "react";
import Header from "./Header";
import RoleSelection from "./RoleSelection";
import LoginForm from "./LoginForm";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState("student");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center">
      <Header />
      <main className="w-full max-w-4xl p-6 space-y-8">
        <RoleSelection selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
        <LoginForm selectedRole={selectedRole} />
      </main>
    </div>
  );
};

export default LoginPage;
