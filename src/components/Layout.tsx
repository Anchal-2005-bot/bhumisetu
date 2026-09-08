import { useState, useRef, useEffect } from "react";
import { 
  Map as MapIcon, 
  FileText, 
  ClipboardCheck, 
  HandCoins, 
  Home, 
  FileBarChart, 
  ShieldAlert, 
  Bell, 
  User, 
  LayoutDashboard, 
  FolderOpen,
  LogOut,
  ChevronDown,
  RefreshCw,
  Check
} from "lucide-react";
import { useAuth, ROLE_PRESETS } from "../context/AuthContext";
import { Role } from "../types";

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const { user, role } = useAuth();

  const tabs = [
    { id: "dashboard", label: "National Dashboard", icon: LayoutDashboard },
    { id: "proposals", label: "Proposals", icon: FileText },
    { id: "map", label: "GIS Map", icon: MapIcon },
    { id: "compensation", label: "Compensation", icon: HandCoins },
    { id: "rnr", label: "R&R", icon: Home },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "awards", label: "Awards", icon: ClipboardCheck },
    { id: "reports", label: "Reports", icon: FileBarChart },
    { id: "grievance", label: "Grievance", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 border-r border-graticule-teal/30 h-[calc(100vh-64px)] overflow-y-auto bg-survey-paper flex flex-col hidden md:flex">
      <nav className="p-4 space-y-1 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-none border-l-2 ${
              activeTab === tab.id
                ? "border-tilled-earth bg-graticule-teal/10 text-registry-ink font-medium"
                : "border-transparent text-registry-ink/70 hover:bg-graticule-teal/5 hover:text-registry-ink"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-tilled-earth" : "text-graticule-teal"}`} />
            {tab.label}
          </button>
        ))}
      </nav>
      
      {/* Dynamic Session Info Panel */}
      <div className="p-4 border-t border-graticule-teal/30 bg-white/40">
        <div className="flex items-center justify-between text-xs text-graticule-teal mb-1 font-mono uppercase tracking-wider">
          <span>Active Session</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-graticule-teal/15 text-registry-ink rounded-sm">
            {role || "Guest"}
          </span>
        </div>
        <div className="text-sm font-semibold text-registry-ink truncate" title={user?.name}>
          {user?.name || "Unauthorized"}
        </div>
        <div className="text-xs text-registry-ink/70 truncate" title={user?.designation}>
          {user?.designation || "No role assigned"}
        </div>
        <div className="text-[11px] text-graticule-teal truncate mt-1" title={user?.jurisdiction}>
          📍 {user?.jurisdiction || "N/A"}
        </div>
      </div>
    </aside>
  );
}

export function TopNav({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const { user, role, switchRole, logout } = useAuth();
  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsSwitchMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rolesList: Role[] = ["National", "State", "District", "LAO Officer", "PIA/Agency"];

  const handleQuickSwitch = async (newRole: Role) => {
    setIsSwitchMenuOpen(false);
    if (newRole !== role) {
      await switchRole(newRole);
    }
  };

  return (
    <header className="h-16 border-b border-graticule-teal/30 bg-survey-paper flex items-center justify-between px-6 shrink-0 z-30 relative">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-registry-ink text-survey-paper flex items-center justify-center font-serif font-bold text-lg rounded-sm">
          B
        </div>
        <div>
          <h1 className="text-xl leading-tight">BhoomiSetu</h1>
          <div className="text-[10px] uppercase tracking-widest text-tilled-earth font-mono">Dept. of Land Resources</div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6" ref={menuRef}>
        {/* Quick Role Switcher Demo Control */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsSwitchMenuOpen(!isSwitchMenuOpen);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-graticule-teal/40 hover:border-tilled-earth text-xs font-mono text-registry-ink shadow-xs transition-colors rounded-sm cursor-pointer"
            title="Switch demo role instantly"
          >
            <RefreshCw className="w-3.5 h-3.5 text-tilled-earth" />
            <span className="text-registry-ink/60 hidden sm:inline">Role:</span>
            <span className="font-bold text-tilled-earth bg-tilled-earth/10 px-1.5 py-0.5 rounded-xs">
              {role || "Select"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-graticule-teal" />
          </button>

          {/* Quick Role Switch Dropdown */}
          {isSwitchMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-graticule-teal/30 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-graticule-teal/20 text-[11px] font-mono uppercase text-graticule-teal font-semibold flex items-center justify-between">
                <span>Instant Role Switching</span>
                <span className="text-[9px] bg-green-100 text-green-800 px-1 rounded">Express Session</span>
              </div>
              <div className="py-1">
                {rolesList.map((r) => {
                  const preset = ROLE_PRESETS[r];
                  const isCurrent = r === role;

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleQuickSwitch(r)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 transition-colors ${
                        isCurrent
                          ? "bg-survey-paper font-semibold text-registry-ink"
                          : "hover:bg-graticule-teal/5 text-registry-ink/80"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCurrent ? (
                          <Check className="w-3.5 h-3.5 text-cultivated-green font-bold" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-graticule-teal/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-registry-ink">{r}</span>
                          {r === "District" || r === "State" ? (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded-xs font-mono">
                              Approver
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-registry-ink/60 truncate">{preset.designation}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Identity & Logout Action */}
        <div className="flex items-center gap-3 border-l border-graticule-teal/30 pl-4 md:pl-6">
          <button 
            onClick={() => setActiveTab && setActiveTab('alerts')}
            className="relative text-graticule-teal hover:text-registry-ink transition-colors p-1"
            title="System Alerts"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-alluvium-red rounded-full"></span>
          </button>

          {/* User profile dropdown button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsSwitchMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs text-left p-1 rounded-sm hover:bg-graticule-teal/10 transition-colors cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-graticule-teal/10 flex items-center justify-center text-registry-ink border border-graticule-teal/30 font-semibold text-xs">
                {user?.name ? user.name.charAt(0) : <User className="h-4 w-4" />}
              </div>
              <div className="hidden lg:block text-left">
                <div className="font-medium text-registry-ink truncate max-w-[120px]">{user?.name}</div>
                <div className="text-[10px] text-graticule-teal font-mono">{role}</div>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-graticule-teal/30 shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="pb-2 border-b border-graticule-teal/20">
                  <div className="text-xs font-bold text-registry-ink">{user?.name}</div>
                  <div className="text-[11px] text-registry-ink/70">{user?.designation}</div>
                  <div className="text-[10px] text-graticule-teal font-mono mt-0.5">📍 {user?.jurisdiction}</div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-alluvium-red hover:bg-alluvium-red/10 flex items-center gap-2 rounded-sm transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out / Switch Persona</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
