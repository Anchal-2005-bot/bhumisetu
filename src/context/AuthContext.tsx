import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Role, AuthUser } from "../types";

export interface RolePreset {
  role: Role;
  name: string;
  designation: string;
  jurisdiction: string;
  department: string;
  badgeColor: string;
  badgeBg: string;
  borderTone: string;
  description: string;
  keyPowers: string[];
}

export const ROLE_PRESETS: Record<Role, RolePreset> = {
  "National": {
    role: "National",
    name: "Dr. Arvind Panagariya",
    designation: "Chief Coordinator & Special Secretary",
    jurisdiction: "All India (National Apex)",
    department: "PM GatiShakti / Dept. of Land Resources",
    badgeColor: "text-amber-700",
    badgeBg: "bg-amber-50",
    borderTone: "border-amber-300",
    description: "Union-level apex monitoring across ministries, policy coordination & mega project tracking.",
    keyPowers: [
      "All-India project pipeline visibility",
      "Inter-ministerial bottleneck escalation",
      "Section 24(2) lapse risk alerts & audit logs"
    ]
  },
  "State": {
    role: "State",
    name: "Smt. Meenakshi Sundaram, IAS",
    designation: "Principal Secretary (Revenue)",
    jurisdiction: "State Nodal (Maharashtra & Haryana)",
    department: "Department of Revenue & Disaster Management",
    badgeColor: "text-blue-700",
    badgeBg: "bg-blue-50",
    borderTone: "border-blue-300",
    description: "State-level sanctioning authority, inter-district coordination & RFCTLARR compliance.",
    keyPowers: [
      "Statutory approval of state project proposals",
      "SIA clearance & Sec 19 Declaration oversight",
      "State-wide disbursement fund monitoring"
    ]
  },
  "District": {
    role: "District",
    name: "Shri Rajesh Kumar, IAS",
    designation: "District Magistrate & Collector",
    jurisdiction: "Pune / Nuh District",
    department: "District Land Acquisition Authority",
    badgeColor: "text-emerald-700",
    badgeBg: "bg-emerald-50",
    borderTone: "border-emerald-300",
    description: "Primary statutory sanctioning authority under RFCTLARR Act, 2013 for district parcels.",
    keyPowers: [
      "Final approval / rejection of acquisition proposals",
      "Sec 11 preliminary notification sanction",
      "Authorization of statutory award disbursement"
    ]
  },
  "LAO Officer": {
    role: "LAO Officer",
    name: "Er. Suresh Patil",
    designation: "Competent Authority & Land Acquisition Officer (CALA)",
    jurisdiction: "Pune Division (Zone 4)",
    department: "Office of the Special Land Acquisition Officer",
    badgeColor: "text-purple-700",
    badgeBg: "bg-purple-50",
    borderTone: "border-purple-300",
    description: "Competent Authority executing joint measurement, valuation, award enquries & DBT.",
    keyPowers: [
      "Determination of market value + 100% Solatium",
      "Execution of direct compensation disbursement",
      "Upload of signed statutory Gazette notices"
    ]
  },
  "PIA/Agency": {
    role: "PIA/Agency",
    name: "Shri Vikram Malhotra",
    designation: "Chief Project Director",
    jurisdiction: "Western Corridor Projects",
    department: "National Highways Authority of India (NHAI)",
    badgeColor: "text-orange-700",
    badgeBg: "bg-orange-50",
    borderTone: "border-orange-300",
    description: "Project proponent requisitioning land for infrastructure, highways & rail lines.",
    keyPowers: [
      "Submission of fresh land acquisition proposals",
      "Draft Social Impact Assessment (SIA) filing",
      "Direct milestone tracking with state authorities"
    ]
  }
};

interface AuthContextType {
  user: AuthUser | null;
  role: Role | null;
  roleLabel: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  canApproveProposal: boolean;
  canSubmitProposal: boolean;
  canDisburseCompensation: boolean;
  login: (role: Role, customDetails?: Partial<AuthUser>) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  setRole: (role: Role) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "same-origin",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to check auth session:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const login = async (role: Role, customDetails?: Partial<AuthUser>) => {
    setIsLoading(true);
    try {
      const preset = ROLE_PRESETS[role];
      const payload = {
        role,
        name: customDetails?.name || preset.name,
        designation: customDetails?.designation || preset.designation,
        jurisdiction: customDetails?.jurisdiction || preset.jurisdiction,
        department: customDetails?.department || preset.department,
      };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Login failed with status ${res.status}`);
      }

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: Role) => {
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        throw new Error(`Role switch failed with status ${res.status}`);
      }

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Switch role error:", err);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const role = user?.role || null;
  const canApproveProposal = role === "District" || role === "State";
  const canSubmitProposal = role === "PIA/Agency" || role === "State" || role === "National";
  const canDisburseCompensation = role === "District" || role === "LAO Officer";
  const roleLabel = role ? ROLE_PRESETS[role]?.designation || role : "Guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        roleLabel,
        isAuthenticated: !!user,
        isLoading,
        canApproveProposal,
        canSubmitProposal,
        canDisburseCompensation,
        login,
        switchRole,
        setRole: (r: Role) => switchRole(r),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
