import { useState, type ReactNode } from "react";
import type { Proposal, ProposalAction, StatusHistoryEntry, UserRole } from "../types";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, FileText, X, Building2, MapPin, Ruler, Calendar, ShieldCheck, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const actionToStatus: Record<ProposalAction, Proposal["status"]> = {
  "Approve": "Approved",
  "Reject": "Rejected",
  "Submit for Scrutiny": "Under Scrutiny",
};

const roleActions: Record<string, ProposalAction[]> = {
  "District": ["Approve", "Reject"],
  "State": ["Approve", "Reject"],
  "National": ["Submit for Scrutiny"],
  "LAO Officer": [],
  "PIA/Agency": ["Submit for Scrutiny"],
  district: ["Approve", "Reject"],
  state: ["Approve", "Reject"],
  national: ["Submit for Scrutiny"],
  lao: [],
  agency: ["Submit for Scrutiny"],
};

const statusTransitions: Record<Proposal["status"], Proposal["status"][]> = {
  "Draft": ["Submitted"],
  "Submitted": ["Under Scrutiny", "Rejected"],
  "Under Scrutiny": ["Approved", "Rejected"],
  "Approved": [],
  "Rejected": [],
};

const actionStyles: Record<ProposalAction, string> = {
  "Approve": "bg-cultivated-green text-white hover:bg-cultivated-green/90 border-cultivated-green",
  "Reject": "bg-alluvium-red text-white hover:bg-alluvium-red/90 border-alluvium-red",
  "Submit for Scrutiny": "bg-tilled-earth text-white hover:bg-tilled-earth/90 border-tilled-earth",
};

const actionIcons: Record<ProposalAction, typeof CheckCircle2> = {
  "Approve": CheckCircle2,
  "Reject": XCircle,
  "Submit for Scrutiny": ShieldCheck,
};

function getStatusIcon(status: string, className: string) {
  switch (status) {
    case "Approved": return <CheckCircle2 className={className} />;
    case "Under Scrutiny": return <Clock className={className} />;
    case "Rejected": return <AlertCircle className={className} />;
    case "Submitted": return <FileText className={className} />;
    default: return <FileText className={className} />;
  }
}

interface ProposalDetailProps {
  proposal: Proposal;
  role: string;
  onBack: () => void;
  onStatusChange: (id: string, action: ProposalAction, comment: string) => Promise<void>;
}

export function ProposalDetail({ proposal, role, onBack, onStatusChange }: ProposalDetailProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ProposalAction | null>(null);

  const availableActions = (roleActions[role] || []).filter(
    (action) => statusTransitions[proposal.status]?.includes(actionToStatus[action])
  );

  const handleAction = async () => {
    if (!confirmAction) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onStatusChange(proposal.id, confirmAction, comment.trim() || `${confirmAction} by ${role}`);
      setConfirmAction(null);
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const history = proposal.statusHistory || [];

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-graticule-teal hover:text-registry-ink mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Proposals
      </button>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-graticule-teal/30">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-graticule-teal bg-graticule-teal/10 px-2 py-1">{proposal.id}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-sm border flex items-center gap-1.5 ${
                  proposal.status === 'Approved' ? 'bg-cultivated-green/10 text-cultivated-green border-cultivated-green/30' :
                  proposal.status === 'Under Scrutiny' ? 'bg-tilled-earth/10 text-tilled-earth border-tilled-earth/30' :
                  proposal.status === 'Rejected' ? 'bg-alluvium-red/10 text-alluvium-red border-alluvium-red/30' :
                  'bg-survey-paper text-registry-ink/70 border-graticule-teal/30'
                }`}>
                  {getStatusIcon(proposal.status, "w-3 h-3")}
                  {proposal.status}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-semibold text-registry-ink">{proposal.projectName}</h2>
            </div>
            {proposal.riskProfile && (
              <div className={`shrink-0 px-3 py-2 border rounded-sm text-center ${
                proposal.riskProfile.level === 'High' ? 'bg-alluvium-red/10 border-alluvium-red/30' :
                proposal.riskProfile.level === 'Medium' ? 'bg-tilled-earth/10 border-tilled-earth/30' :
                'bg-cultivated-green/10 border-cultivated-green/30'
              }`}>
                <div className={`text-2xl font-serif font-bold ${
                  proposal.riskProfile.level === 'High' ? 'text-alluvium-red' :
                  proposal.riskProfile.level === 'Medium' ? 'text-tilled-earth' :
                  'text-cultivated-green'
                }`}>{proposal.riskProfile.score}</div>
                <div className={`text-[10px] uppercase tracking-wider font-medium ${
                  proposal.riskProfile.level === 'High' ? 'text-alluvium-red' :
                  proposal.riskProfile.level === 'Medium' ? 'text-tilled-earth' :
                  'text-cultivated-green'
                }`}>{proposal.riskProfile.level} Risk</div>
              </div>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-graticule-teal/20">
          <div className="p-6 space-y-5">
            <h3 className="font-serif text-sm uppercase tracking-wider text-graticule-teal">Project Details</h3>
            <DetailRow icon={<Building2 className="w-4 h-4" />} label="Ministry" value={proposal.ministry} />
            <DetailRow icon={<FileText className="w-4 h-4" />} label="Category" value={proposal.category} />
            <DetailRow icon={<Ruler className="w-4 h-4" />} label="Area Required" value={`${proposal.areaRequired.toFixed(2)} Ha`} />
            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date Submitted" value={new Date(proposal.dateSubmitted).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
          </div>
          <div className="p-6 space-y-5">
            <h3 className="font-serif text-sm uppercase tracking-wider text-graticule-teal">Location</h3>
            <DetailRow icon={<MapPin className="w-4 h-4" />} label="State" value={proposal.state} />
            <DetailRow icon={<MapPin className="w-4 h-4" />} label="District" value={proposal.district} />
            {proposal.riskProfile && (
              <div className="pt-2">
                <div className="text-xs text-registry-ink/60 font-medium uppercase tracking-wider mb-2">Risk Factors</div>
                <ul className="space-y-1.5">
                  {proposal.riskProfile.factors.map((factor, i) => (
                    <li key={i} className="text-sm text-registry-ink/80 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tilled-earth mt-1.5 shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Status History */}
        <div className="p-6 border-t border-graticule-teal/30">
          <h3 className="font-serif text-sm uppercase tracking-wider text-graticule-teal mb-5">Status History</h3>
          <div className="relative">
            {history.map((entry, i) => (
              <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                {i !== history.length - 1 && (
                  <div className="absolute left-3 top-6 bottom-0 w-px bg-graticule-teal/30 -translate-x-1/2" />
                )}
                <div className="relative z-10 shrink-0 mt-0.5">
                  {getStatusIcon(entry.status, `w-6 h-6 ${
                    entry.status === 'Approved' ? 'text-cultivated-green' :
                    entry.status === 'Rejected' ? 'text-alluvium-red' :
                    entry.status === 'Under Scrutiny' ? 'text-tilled-earth' :
                    'text-graticule-teal'
                  }`)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-registry-ink">{entry.status}</span>
                    <span className="text-xs text-registry-ink/50">
                      {new Date(entry.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="text-sm text-registry-ink/70 mt-0.5">
                    <span className="font-medium">{entry.actor}</span>
                    <span className="text-registry-ink/40"> · {entry.role}</span>
                  </div>
                  <p className="text-sm text-registry-ink/60 mt-1">{entry.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action area */}
        <div className="p-6 border-t border-graticule-teal/30 bg-survey-paper/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-sm uppercase tracking-wider text-graticule-teal">Actions</h3>
            <span className="text-xs text-registry-ink/50 font-mono">Your role: {role}</span>
          </div>

          {availableActions.length === 0 ? (
            <p className="text-sm text-registry-ink/50 italic py-2">
              No actions available for your role at this stage of the proposal.
            </p>
          ) : (
            <>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment for this action (optional)..."
                className="w-full px-4 py-2.5 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white text-sm mb-4 resize-none"
                rows={2}
              />
              <div className="flex gap-3 flex-wrap">
                {availableActions.map((action) => {
                  const Icon = actionIcons[action];
                  return (
                    <button
                      key={action}
                      onClick={() => setConfirmAction(action)}
                      disabled={isSubmitting}
                      className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${actionStyles[action]}`}
                    >
                      <Icon className="w-4 h-4" />
                      {action}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-alluvium-red/10 border border-alluvium-red/30 text-alluvium-red text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-registry-ink/40 flex items-center justify-center p-4"
            onClick={() => !isSubmitting && setConfirmAction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-graticule-teal/30 shadow-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-serif font-semibold text-registry-ink">Confirm Action</h3>
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={isSubmitting}
                  className="text-graticule-teal hover:text-registry-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-registry-ink/70 mb-2">
                You are about to <span className="font-medium text-registry-ink">{confirmAction.toLowerCase()}</span> proposal{" "}
                <span className="font-mono text-xs text-graticule-teal">{proposal.id}</span>.
              </p>
              <p className="text-sm text-registry-ink font-medium mb-4">{proposal.projectName}</p>
              {comment.trim() && (
                <div className="mb-4 p-3 bg-survey-paper border border-graticule-teal/20 text-sm text-registry-ink/70">
                  <span className="text-xs text-graticule-teal uppercase tracking-wider font-medium">Comment: </span>
                  {comment.trim()}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-registry-ink border border-graticule-teal/30 hover:bg-graticule-teal/10 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-5 py-2 font-medium text-sm border transition-colors disabled:opacity-50 ${actionStyles[confirmAction]}`}
                >
                  {isSubmitting ? "Processing..." : `Confirm ${confirmAction}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-graticule-teal mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-registry-ink/50 font-medium uppercase tracking-wider">{label}</div>
        <div className="text-sm text-registry-ink font-medium">{value}</div>
      </div>
    </div>
  );
}
