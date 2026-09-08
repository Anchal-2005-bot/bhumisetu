import React, { useState, useEffect } from "react";
import { Proposal, ProposalAction } from "../types";
import { ProposalDetail } from "./ProposalDetail";
import { 
  Plus, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Check, 
  X, 
  ShieldCheck, 
  ShieldAlert,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

export function Proposals() {
  const { user, role, canApproveProposal, canSubmitProposal } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proposals", { credentials: "same-origin" });
      const data = await res.json();
      setProposals(data);
    } catch (err) {
      console.error("Failed to load proposals", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "Approved" | "Rejected") => {
    setProcessingId(id);
    setActionFeedback(null);

    try {
      const res = await fetch(`/api/proposals/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ 
          status: newStatus,
          remarks: `Statutory review completed by ${user?.name || "Officer"} (${role})`
        }),
      });

      const data = await res.json();

      if (res.status === 200) {
        setActionFeedback({
          type: "success",
          title: `Proposal ${newStatus} Successfully`,
          message: data.message || `Proposal ${id} marked as ${newStatus} with authenticated role: ${role}.`,
        });
        await fetchProposals();
      } else if (res.status === 403) {
        setActionFeedback({
          type: "error",
          title: "403 Forbidden (RBAC Backend Enforced)",
          message: data.message || `Role '${role}' is not authorized to approve proposals. Only District and State authorities possess statutory sanction power.`,
        });
      } else if (res.status === 401) {
        setActionFeedback({
          type: "error",
          title: "401 Unauthorized",
          message: "Your session has expired. Please select a role to sign in.",
        });
      } else {
        setActionFeedback({
          type: "error",
          title: "Request Error",
          message: data.error || "Failed to update proposal status.",
        });
      }
    } catch (err) {
      setActionFeedback({
        type: "error",
        title: "Network Error",
        message: "Unable to reach server to update proposal status.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionFeedback(null);

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
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok) {
        setActionFeedback({
          type: "success",
          title: "Proposal Submitted",
          message: `Project proposal submitted under ${data.ministry} by ${user?.name || role}.`,
        });
        await fetchProposals();
        setView("list");
      } else if (res.status === 403) {
        setActionFeedback({
          type: "error",
          title: "403 Forbidden (RBAC Backend Enforced)",
          message: resData.message || `Role '${role}' is not authorized to submit proposals. Only PIA/Agency, State, and National roles can submit proposals.`,
        });
      } else {
        setActionFeedback({
          type: "error",
          title: "Submission Failed",
          message: resData.error || "Could not submit proposal.",
        });
      }
    } catch (err) {
      console.error("Failed to submit proposal", err);
      setActionFeedback({
        type: "error",
        title: "Network Error",
        message: "Failed to submit proposal. Check server connectivity.",
      });
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
          className="flex items-center gap-2 text-sm text-graticule-teal hover:text-registry-ink mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Proposals
        </button>
        
        <div className="bg-white border border-graticule-teal/30 p-8 shadow-sm">
          <div className="border-b border-graticule-teal/30 pb-4 mb-6">
            <h2 className="text-2xl font-serif font-semibold text-registry-ink">Submit New Project Proposal</h2>
            <p className="text-registry-ink/60 text-sm mt-1">Initiate a new land acquisition workflow under RFCTLARR Act, 2013.</p>
            <div className="mt-2 text-xs font-mono text-tilled-earth">
              Submitting as: <strong>{user?.name}</strong> ({role})
            </div>
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
                className="px-6 py-2 text-registry-ink border border-graticule-teal/30 hover:bg-graticule-teal/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-tilled-earth text-white font-medium hover:bg-tilled-earth/90 transition-colors cursor-pointer"
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
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      {/* Header with Title and New Proposal Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink">Project Proposals</h2>
          <p className="text-registry-ink/60 mt-1">Track and manage land acquisition proposals across all ministries under RFCTLARR Act.</p>
        </div>
        <button 
          onClick={() => setView("create")}
          className="flex items-center gap-2 px-4 py-2 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      {/* Role Authority Indicator Bar */}
      <div className="mb-6 p-3.5 bg-white border border-graticule-teal/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          {canApproveProposal ? (
            <div className="p-1 rounded-sm bg-cultivated-green/10 text-cultivated-green border border-cultivated-green/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1 rounded-sm bg-amber-500/10 text-amber-700 border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
          )}
          <div>
            <span className="font-semibold text-registry-ink">Current Role Authority ({role}): </span>
            {canApproveProposal ? (
              <span className="text-cultivated-green font-medium">
                Authorized to grant statutory proposal approvals (District / State sanction power).
              </span>
            ) : (
              <span className="text-registry-ink/70">
                Statutory approval is reserved for <strong className="text-registry-ink">District & State</strong> authorities. Attempting approval will be rejected with HTTP 403 Forbidden by Express backend.
              </span>
            )}
          </div>
        </div>

        <div className="text-graticule-teal font-mono shrink-0">
          User: <span className="text-registry-ink font-semibold">{user?.name}</span>
        </div>
      </div>

      {/* Action Feedback Toast / Banner */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 border flex items-start justify-between gap-3 ${
              actionFeedback.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : actionFeedback.type === "error"
                ? "bg-red-50 border-red-300 text-red-900"
                : "bg-blue-50 border-blue-300 text-blue-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {actionFeedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-cultivated-green shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-alluvium-red shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-semibold text-sm">{actionFeedback.title}</h4>
                <p className="text-xs mt-0.5 opacity-90">{actionFeedback.message}</p>
              </div>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proposals Table */}
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
                <th className="px-6 py-4 text-center">Statutory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    Loading proposals from secure registry...
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-registry-ink/60">
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
                    <td className="px-6 py-4 font-medium text-registry-ink max-w-[230px] truncate" title={proposal.projectName}>
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

                    {/* Statutory Role-Protected Actions */}
                    <td className="px-6 py-4 text-center">
                      {proposal.status === "Approved" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-cultivated-green font-mono bg-cultivated-green/10 px-2.5 py-1 rounded-sm border border-cultivated-green/20">
                          <Check className="w-3 h-3" /> Sanctioned
                        </span>
                      ) : proposal.status === "Rejected" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-alluvium-red font-mono bg-alluvium-red/10 px-2.5 py-1 rounded-sm border border-alluvium-red/20">
                          <X className="w-3 h-3" /> Rejected
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={processingId === proposal.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(proposal.id, "Approved");
                            }}
                            title={
                              canApproveProposal
                                ? `Approve proposal as ${role}`
                                : `Role '${role}' cannot approve proposals. Click to test 403 Forbidden protection.`
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                              canApproveProposal
                                ? "bg-cultivated-green hover:bg-cultivated-green/90 text-white shadow-xs"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{processingId === proposal.id ? "..." : "Approve"}</span>
                            {!canApproveProposal && (
                              <span className="text-[9px] font-mono bg-gray-200 px-1 py-0.2 rounded text-gray-600">
                                403 Test
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={processingId === proposal.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(proposal.id, "Rejected");
                            }}
                            title={
                              canApproveProposal
                                ? `Reject proposal as ${role}`
                                : `Role '${role}' cannot reject proposals. Click to test 403 Forbidden protection.`
                            }
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                              canApproveProposal
                                ? "border border-alluvium-red/40 text-alluvium-red hover:bg-alluvium-red/10"
                                : "text-gray-400 hover:text-gray-600 border border-gray-200"
                            }`}
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
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
