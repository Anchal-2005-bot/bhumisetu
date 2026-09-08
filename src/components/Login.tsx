import React, { useState } from "react";
import { useAuth, ROLE_PRESETS } from "../context/AuthContext";
import { Role } from "../types";
import { 
  Shield, 
  Building2, 
  MapPin, 
  UserCheck, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  Landmark, 
  Layers, 
  FileCheck,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

export function Login() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>("District");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customJurisdiction, setCustomJurisdiction] = useState("");
  const [useCustomDetails, setUseCustomDetails] = useState(false);

  const activePreset = ROLE_PRESETS[selectedRole];

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      if (useCustomDetails && (customName.trim() || customJurisdiction.trim())) {
        await login(selectedRole, {
          name: customName.trim() || activePreset.name,
          jurisdiction: customJurisdiction.trim() || activePreset.jurisdiction,
        });
      } else {
        await login(selectedRole);
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "National":
        return <Landmark className="w-5 h-5 text-amber-700" />;
      case "State":
        return <Building2 className="w-5 h-5 text-blue-700" />;
      case "District":
        return <MapPin className="w-5 h-5 text-emerald-700" />;
      case "LAO Officer":
        return <FileCheck className="w-5 h-5 text-purple-700" />;
      case "PIA/Agency":
        return <Layers className="w-5 h-5 text-orange-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-survey-paper flex flex-col justify-between selection:bg-tilled-earth/20">
      {/* Top Govt of India Masthead */}
      <header className="border-b border-graticule-teal/30 bg-white/80 backdrop-blur-sm px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-registry-ink text-survey-paper flex items-center justify-center font-serif font-bold text-xl rounded-sm shadow-sm">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-registry-ink tracking-tight">BhoomiSetu</h1>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-cultivated-green/10 text-cultivated-green border border-cultivated-green/30 rounded-sm">
                v2.4 SECURE STAGING
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-widest text-tilled-earth font-mono">
              Department of Land Resources • Ministry of Rural Development
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-registry-ink/70">
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="w-4 h-4 text-cultivated-green" />
            Mock Single Sign-On (RBAC Mode)
          </span>
          <span className="text-graticule-teal/50">|</span>
          <span>RFCTLARR Act, 2013 Architecture</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-5xl bg-white border border-graticule-teal/30 shadow-md">
          {/* Card Banner */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-registry-ink via-registry-ink/95 to-registry-ink/90 text-survey-paper flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-graticule-teal/30">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 text-white text-xs font-mono uppercase tracking-wider mb-2 border border-white/20">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                Select Persona to Enter Portal
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
                Multi-Tier Role Access Portal
              </h2>
              <p className="text-survey-paper/80 text-sm mt-1 max-w-xl">
                Experience role-specific workflows across national oversight, state sanctioning, district statutory approvals, and field compensation disbursements.
              </p>
            </div>

            <div className="bg-white/10 p-4 border border-white/15 text-xs font-mono space-y-1 self-start md:self-center shrink-0">
              <div className="text-amber-300 font-bold uppercase tracking-wider">Demo Environment</div>
              <div className="text-white/80">No password required</div>
              <div className="text-emerald-300">Fast role switching enabled</div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Role Selection Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold uppercase tracking-wider font-mono text-registry-ink">
                  1. Choose Your Operational Role:
                </label>
                <span className="text-xs text-graticule-teal">
                  Click any role card to view delegated authority
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {(Object.keys(ROLE_PRESETS) as Role[]).map((roleKey) => {
                  const preset = ROLE_PRESETS[roleKey];
                  const isSelected = selectedRole === roleKey;

                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => setSelectedRole(roleKey)}
                      className={`relative text-left p-4 transition-all duration-200 border flex flex-col justify-between ${
                        isSelected
                          ? "bg-survey-paper border-tilled-earth ring-2 ring-tilled-earth/20 shadow-sm"
                          : "bg-white border-graticule-teal/30 hover:border-graticule-teal/60 hover:bg-survey-paper/30"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 text-tilled-earth">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-sm ${preset.badgeBg}`}>
                            {getRoleIcon(roleKey)}
                          </div>
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${preset.badgeColor}`}>
                            {roleKey}
                          </span>
                        </div>

                        <div className="font-semibold text-registry-ink text-sm leading-tight mb-1">
                          {preset.designation}
                        </div>
                        <div className="text-xs text-registry-ink/60 truncate" title={preset.name}>
                          {preset.name}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-graticule-teal/20 text-[11px] text-graticule-teal font-mono">
                        {roleKey === "District" || roleKey === "State" ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                            Can Approve Proposals
                          </span>
                        ) : roleKey === "PIA/Agency" ? (
                          <span className="text-orange-700 font-semibold bg-orange-50 px-1.5 py-0.5 rounded-sm">
                            Can Submit Proposals
                          </span>
                        ) : roleKey === "LAO Officer" ? (
                          <span className="text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded-sm">
                            Can Disburse DBT
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded-sm">
                            National Oversight
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Role Authority & Details Panel */}
            <div className="bg-survey-paper/60 border border-graticule-teal/30 p-6">
              <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-sm ${activePreset.badgeBg} ${activePreset.badgeColor} border ${activePreset.borderTone}`}>
                      Selected: {activePreset.role} Authority
                    </span>
                    <span className="text-sm font-semibold text-registry-ink">
                      {activePreset.designation}
                    </span>
                  </div>

                  <p className="text-sm text-registry-ink/80 leading-relaxed">
                    {activePreset.description}
                  </p>

                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-graticule-teal mb-2">
                      Statutory Powers & Permissions Under RFCTLARR:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activePreset.keyPowers.map((power, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-registry-ink">
                          <div className="w-1.5 h-1.5 rounded-full bg-tilled-earth shrink-0" />
                          <span>{power}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side persona card and login button */}
                <div className="w-full lg:w-80 bg-white border border-graticule-teal/30 p-5 shrink-0 shadow-sm">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-graticule-teal mb-3">
                    Verified Identity
                  </div>

                  <div className="space-y-3 mb-5">
                    <div>
                      <div className="text-[11px] text-registry-ink/50 uppercase font-mono">Officer Name</div>
                      <div className="text-sm font-medium text-registry-ink">{activePreset.name}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-registry-ink/50 uppercase font-mono">Jurisdiction</div>
                      <div className="text-xs text-registry-ink/80">{activePreset.jurisdiction}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-registry-ink/50 uppercase font-mono">Department</div>
                      <div className="text-xs text-registry-ink/80">{activePreset.department}</div>
                    </div>
                  </div>

                  {/* Optional Customization toggle */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setUseCustomDetails(!useCustomDetails)}
                      className="text-xs text-graticule-teal hover:text-registry-ink underline font-mono"
                    >
                      {useCustomDetails ? "− Use standard officer preset" : "+ Customize officer name & district"}
                    </button>

                    {useCustomDetails && (
                      <div className="mt-3 space-y-2 text-xs">
                        <input
                          type="text"
                          placeholder={activePreset.name}
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-graticule-teal/30 focus:border-tilled-earth outline-none text-registry-ink"
                        />
                        <input
                          type="text"
                          placeholder={activePreset.jurisdiction}
                          value={customJurisdiction}
                          onChange={(e) => setCustomJurisdiction(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-graticule-teal/30 focus:border-tilled-earth outline-none text-registry-ink"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleLogin()}
                    className="w-full py-3 px-4 bg-registry-ink hover:bg-registry-ink/90 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Establishing Session...</span>
                    ) : (
                      <>
                        <span>Enter as {selectedRole}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Demo Guidance */}
            <div className="p-4 bg-graticule-teal/5 border border-graticule-teal/20 text-xs text-registry-ink/80 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-graticule-teal shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-registry-ink">Permission Demo Guide: </span>
                To test route protection, try entering as <strong className="text-orange-800">PIA/Agency</strong> first and notice how proposal approval is restricted. Then switch to <strong className="text-emerald-800">District</strong> or <strong className="text-blue-800">State</strong> in the top navigation bar to execute statutory approvals with verified express-session authorization.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-graticule-teal/30 bg-white/60 text-center py-3 text-xs text-registry-ink/60 font-mono">
        BhoomiSetu • National Land Information Infrastructure • Role-Based Authentication v2.4
      </footer>
    </div>
  );
}
