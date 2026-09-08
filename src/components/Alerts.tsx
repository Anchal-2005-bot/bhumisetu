import { useState, useEffect } from "react";
import { Alert } from "../types";
import { Bell, AlertTriangle, Info, Clock, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setIsLoading(false);
      });
  }, []);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-alluvium-red/10 text-alluvium-red border-alluvium-red/30";
      case "Warning": return "bg-tilled-earth/10 text-tilled-earth border-tilled-earth/30";
      case "Info": return "bg-graticule-teal/10 text-graticule-teal border-graticule-teal/30";
      default: return "bg-survey-paper text-registry-ink border-graticule-teal/30";
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    const colorClass = severity === "Critical" ? "text-alluvium-red" : severity === "Warning" ? "text-tilled-earth" : "text-graticule-teal";
    switch (type) {
      case "Lapse Risk": return <ShieldAlert className={`w-5 h-5 ${colorClass}`} />;
      case "SLA Breach": return <AlertTriangle className={`w-5 h-5 ${colorClass}`} />;
      case "Approval Pending": return <Clock className={`w-5 h-5 ${colorClass}`} />;
      default: return <Info className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <Bell className="w-8 h-8 text-tilled-earth" />
            System Alerts & Notifications
          </h2>
          <p className="text-registry-ink/60 mt-1">Role-scoped automated alerts for SLA tracking, approvals, and lapse-risks.</p>
        </div>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-12 text-center text-graticule-teal animate-pulse">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-registry-ink/60">No pending alerts.</div>
        ) : (
          <div className="divide-y divide-graticule-teal/20">
            {alerts.map((alert, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={alert.id}
                className={`p-5 flex gap-4 hover:bg-graticule-teal/5 transition-colors cursor-pointer ${!alert.isRead ? 'bg-graticule-teal/5' : ''}`}
              >
                <div className="mt-1 shrink-0">
                  {getAlertIcon(alert.type, alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold border rounded-sm ${getSeverityStyles(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="font-mono text-xs text-graticule-teal">{alert.projectId}</span>
                    <span className="text-xs text-registry-ink/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(alert.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-registry-ink text-base mb-1">{alert.type}: {alert.projectName}</h4>
                  <p className="text-registry-ink/80 text-sm leading-relaxed">{alert.message}</p>
                </div>
                {!alert.isRead && (
                  <div className="shrink-0 flex items-center">
                    <div className="w-2.5 h-2.5 bg-alluvium-red rounded-full"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
