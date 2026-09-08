import { useState, useEffect } from "react";
import { Proposal, ProposalAction } from "../types";
import { useAuth } from "../context/AuthContext";
import { ProposalDetail } from "./ProposalDetail";
import { Plus, ArrowLeft, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { motion } from "motion/react";

export function Proposals() {
  const { role } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proposals");
      const data = await res.json();
      setProposals(data);
    } catch (err) {
      console.error("Failed to load proposals", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      projectName: formData.get("projectName"),
      ministry: formData.get("ministry"),
      category: formData.get("category"),
      state: formData.get("state"),
      district: formData.get("district"),
      areaRequired: Number(formData.get("areaRequired")),
    };

    try {
      await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchProposals();
      setView("list");
    } catch (err) {
      console.error("Failed to submit proposal", err);
    }
  };

  const handleStatusChange = async (id: string, action: ProposalAction, comment: string) => {
    const res = await fetch(`/api/proposals/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, role, comment }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Failed to ${action} (HTTP ${res.status})`);
    }
    const updated: Proposal = await res.json();
    setProposals((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setSelectedProposal(updated);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle2 className="w-4 h-4 text-cultivated-green" />;
      case "Under Scrutiny": return <Clock className="w-4 h-4 text-tilled-earth" />;
      case "Rejected": return <AlertCircle className="w-4 h-4 text-alluvium-red" />;
      default: return <FileText className="w-4 h-4 text-graticule-teal" />;
    }
  };

  if (view === "detail" && selectedProposal) {
    return (
      <ProposalDetail
        proposal={selectedProposal}
        role={role}
        onBack={() => {
          setView("list");
          setSelectedProposal(null);
        }}
        onStatusChange={handleStatusChange}
      />
    );
  }

  if (view === "create") {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full">
        <button 
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-sm text-graticule-teal hover:text-registry-ink mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Proposals
        </button>
        
        <div className="bg-white border border-graticule-teal/30 p-8 shadow-sm">
          <div className="border-b border-graticule-teal/30 pb-4 mb-6">
            <h2 className="text-2xl font-serif font-semibold text-registry-ink">Submit New Project Proposal</h2>
            <p className="text-registry-ink/60 text-sm mt-1">Initiate a new land acquisition workflow under RFCTLARR Act, 2013.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-registry-ink mb-1">Project Name</label>
                <input 
                  required
                  name="projectName"
                  type="text" 
                  className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-survey-paper/50" 
                  placeholder="e.g., Delhi-Dehradun Expressway Corridor Phase 2" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-registry-ink mb-1">Requiring Ministry</label>
                <select name="ministry" required className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white">
                  <option value="">Select Ministry...</option>
                  <option value="MoRTH">Ministry of Road Transport & Highways</option>
                  <option value="Ministry of Railways">Ministry of Railways</option>
                  <option value="MoHUA">Ministry of Housing & Urban Affairs</option>
                  <option value="MNRE">Ministry of New & Renewable Energy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-registry-ink mb-1">Project Category</label>
                <select name="category" required className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white">
                  <option value="">Select Category...</option>
                  <option value="Highway">Highway</option>
                  <option value="Rail">Rail</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Industrial Corridor">Industrial Corridor</option>
                  <option value="Urban Development">Urban Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-registry-ink mb-1">Primary State</label>
                <select name="state" required className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white">
                  <option value="">Select State...</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-registry-ink mb-1">Primary District</label>
                <input 
                  required
                  name="district"
                  type="text" 
                  className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-survey-paper/50" 
                  placeholder="District Name" 
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-registry-ink mb-1">Estimated Area Required (Hectares)</label>
                <input 
                  required
                  name="areaRequired"
                  type="number" 
                  step="0.01"
                  className="w-full md:w-1/2 px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-survey-paper/50" 
                  placeholder="0.00" 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-graticule-teal/30 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setView("list")}
                className="px-6 py-2 text-registry-ink border border-graticule-teal/30 hover:bg-graticule-teal/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-tilled-earth text-white font-medium hover:bg-tilled-earth/90 transition-colors"
              >
                Submit for Scrutiny
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink">Project Proposals</h2>
          <p className="text-registry-ink/60 mt-1">Track and manage land acquisition proposals across all ministries.</p>
        </div>
        <button 
          onClick={() => setView("create")}
          className="flex items-center gap-2 px-4 py-2 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Reference ID</th>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">Ministry</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Area (Ha)</th>
                <th className="px-6 py-4">Delay Risk</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    Loading proposals...
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-registry-ink/60">
                    No proposals found. Create the first one to begin.
                  </td>
                </tr>
              ) : (
                proposals.map((proposal, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={proposal.id} 
                    className="hover:bg-graticule-teal/5 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setView("detail");
                    }}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{proposal.id}</td>
                    <td className="px-6 py-4 font-medium text-registry-ink max-w-[250px] truncate" title={proposal.projectName}>
                      {proposal.projectName}
                    </td>
                    <td className="px-6 py-4 text-registry-ink/80">{proposal.ministry}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{proposal.district}, {proposal.state}</td>
                    <td className="px-6 py-4 font-mono text-registry-ink/80">{proposal.areaRequired.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {proposal.riskProfile ? (
                        <div className="flex items-center gap-1.5" title={proposal.riskProfile.factors.join(", ")}>
                          <div className={`w-2 h-2 rounded-full ${
                            proposal.riskProfile.level === 'High' ? 'bg-alluvium-red' :
                            proposal.riskProfile.level === 'Medium' ? 'bg-tilled-earth' :
                            'bg-cultivated-green'
                          }`} />
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-sm border ${
                            proposal.riskProfile.level === 'High' ? 'bg-alluvium-red/10 text-alluvium-red border-alluvium-red/30' :
                            proposal.riskProfile.level === 'Medium' ? 'bg-tilled-earth/10 text-tilled-earth border-tilled-earth/30' :
                            'bg-cultivated-green/10 text-cultivated-green border-cultivated-green/30'
                          }`}>
                            {proposal.riskProfile.level} ({proposal.riskProfile.score})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-graticule-teal">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proposal.status)}
                        <span className={`font-medium ${
                          proposal.status === 'Approved' ? 'text-cultivated-green' :
                          proposal.status === 'Under Scrutiny' ? 'text-tilled-earth' :
                          proposal.status === 'Rejected' ? 'text-alluvium-red' :
                          'text-registry-ink/70'
                        }`}>
                          {proposal.status}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
