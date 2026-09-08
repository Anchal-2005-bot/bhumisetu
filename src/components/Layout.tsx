import { Map as MapIcon, FileText, ClipboardCheck, HandCoins, Home, FileBarChart, ShieldAlert, Bell, User, LayoutDashboard, Database, FolderOpen } from "lucide-react";

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
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
      <div className="p-4 border-t border-graticule-teal/30">
        <div className="text-xs text-graticule-teal mb-2 font-mono uppercase tracking-wider">Session Info</div>
        <div className="text-sm font-medium">District LAO</div>
        <div className="text-xs text-registry-ink/70">New Delhi, NCT</div>
      </div>
    </aside>
  );
}

export function TopNav({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  return (
    <header className="h-16 border-b border-graticule-teal/30 bg-survey-paper flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-registry-ink text-survey-paper flex items-center justify-center font-serif font-bold text-lg rounded-sm">
          B
        </div>
        <div>
          <h1 className="text-xl leading-tight">BhoomiSetu</h1>
          <div className="text-[10px] uppercase tracking-widest text-tilled-earth font-mono">Dept. of Land Resources</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center border border-graticule-teal/30 rounded-sm bg-white overflow-hidden text-sm">
          <select className="px-3 py-1.5 bg-transparent outline-none border-r border-graticule-teal/30 text-registry-ink font-medium">
            <option>All States</option>
            <option>Delhi</option>
            <option>Haryana</option>
            <option>Uttar Pradesh</option>
          </select>
          <select className="px-3 py-1.5 bg-transparent outline-none text-registry-ink">
            <option>All Districts</option>
            <option>New Delhi</option>
          </select>
        </div>

        <div className="flex items-center gap-4 border-l border-graticule-teal/30 pl-6">
          <button className="text-graticule-teal hover:text-registry-ink text-sm font-medium">
            EN <span className="text-graticule-teal/50">/ HI</span>
          </button>
          <button 
            onClick={() => setActiveTab && setActiveTab('alerts')}
            className="relative text-graticule-teal hover:text-registry-ink transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-alluvium-red rounded-full border-2 border-survey-paper"></span>
          </button>
          <button className="h-8 w-8 rounded-full bg-graticule-teal/10 flex items-center justify-center text-registry-ink border border-graticule-teal/30 hover:bg-graticule-teal/20 transition-colors">
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
