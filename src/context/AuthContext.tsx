import { createContext, useContext, useState, type ReactNode } from "react";
import type { UserRole } from "../types";

interface AuthContextValue {
  role: UserRole;
  roleLabel: string;
  setRole: (role: UserRole) => void;
}

const roleLabels: Record<UserRole, string> = {
  national: "National Administrator",
  state: "State Coordinator",
  district: "District Collector",
  lao: "Land Acquisition Officer",
  agency: "Project Implementing Agency",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("national");

  return (
    <AuthContext.Provider value={{ role, roleLabel: roleLabels[role], setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
