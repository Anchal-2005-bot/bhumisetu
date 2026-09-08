import express from "express";
import session from "express-session";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type Role = "National" | "State" | "District" | "LAO Officer" | "PIA/Agency";

export interface SessionUser {
  role: Role;
  name: string;
  designation: string;
  jurisdiction: string;
  department: string;
}

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

export const ROLE_PRESETS: Record<Role, SessionUser> = {
  "National": {
    role: "National",
    name: "Dr. Arvind Panagariya",
    designation: "Chief Coordinator & Special Secretary",
    jurisdiction: "All India (National Apex)",
    department: "PM GatiShakti / Dept. of Land Resources",
  },
  "State": {
    role: "State",
    name: "Smt. Meenakshi Sundaram, IAS",
    designation: "Principal Secretary (Revenue)",
    jurisdiction: "State Nodal (Maharashtra & Haryana)",
    department: "Department of Revenue & Disaster Management",
  },
  "District": {
    role: "District",
    name: "Shri Rajesh Kumar, IAS",
    designation: "District Magistrate & Collector",
    jurisdiction: "Pune District",
    department: "District Land Acquisition Authority",
  },
  "LAO Officer": {
    role: "LAO Officer",
    name: "Er. Suresh Patil",
    designation: "Competent Authority & Land Acquisition Officer (CALA)",
    jurisdiction: "Pune Division (Zone 4)",
    department: "Office of the Special Land Acquisition Officer",
  },
  "PIA/Agency": {
    role: "PIA/Agency",
    name: "Shri Vikram Malhotra",
    designation: "Chief Project Director",
    jurisdiction: "Western Corridor Projects",
    department: "National Highways Authority of India (NHAI)",
  },
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Session configuration for mock auth
  app.use(
    session({
      secret: "bhoomisetu-mock-secret-key-2026",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // allow standard HTTP for local development
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax",
      },
    })
  );

  // Default demo session fallback if not explicitly logged in (optional default to PIA/Agency or unauthenticated)
  // We keep unauthenticated by default so the login screen demo is clean and verifiable

  // RBAC Middleware helpers
  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.session?.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required. Please select a role to log in.",
      });
    }
    next();
  }

  function requireRole(allowedRoles: Role[]) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!req.session?.user) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required. Please log in with an authorized role.",
        });
      }

      if (!allowedRoles.includes(req.session.user.role)) {
        return res.status(403).json({
          error: "Forbidden",
          message: `Access denied. Role '${req.session.user.role}' is not authorized. Allowed roles: ${allowedRoles.join(", ")}.`,
          currentRole: req.session.user.role,
          requiredRoles: allowedRoles,
        });
      }

      next();
    };
  }

  // --- Auth API Routes ---

  // Check current session
  app.get("/api/auth/session", (req, res) => {
    if (req.session?.user) {
      return res.json({ authenticated: true, user: req.session.user });
    }
    return res.json({ authenticated: false, user: null });
  });

  // Login with role selector
  app.post("/api/auth/login", (req, res) => {
    const { role, name, jurisdiction, designation, department } = req.body;
    const validRole = role as Role;
    if (!validRole || !ROLE_PRESETS[validRole]) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const preset = ROLE_PRESETS[validRole];
    const user: SessionUser = {
      role: validRole,
      name: name?.trim() || preset.name,
      designation: designation?.trim() || preset.designation,
      jurisdiction: jurisdiction?.trim() || preset.jurisdiction,
      department: department?.trim() || preset.department,
    };

    req.session.user = user;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to establish session" });
      }
      res.json({ success: true, user });
    });
  });

  // Quick switch role (for instant demo role-switching without clearing form)
  app.post("/api/auth/switch-role", (req, res) => {
    const { role } = req.body;
    const validRole = role as Role;
    if (!validRole || !ROLE_PRESETS[validRole]) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const preset = ROLE_PRESETS[validRole];
    const user: SessionUser = {
      role: validRole,
      name: preset.name,
      designation: preset.designation,
      jurisdiction: preset.jurisdiction,
      department: preset.department,
    };

    req.session.user = user;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to switch session role" });
      }
      res.json({ success: true, user });
    });
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to destroy session" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // --- Mock API Routes for BhoomiSetu ---

  const validTransitions: Record<string, string[]> = {
    "Draft": ["Submitted"],
    "Submitted": ["Under Scrutiny", "Rejected"],
    "Under Scrutiny": ["Approved", "Rejected"],
    "Approved": [],
    "Rejected": [],
  };

  const roleAllowedActions: Record<string, string[]> = {
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

  let mockProposals: any[] = [
    {
      id: "PRJ-2026-001",
      projectName: "Delhi-Mumbai Expressway (Phase 4)",
      ministry: "MoRTH",
      category: "Highway",
      state: "Haryana",
      district: "Nuh",
      status: "Approved",
      dateSubmitted: "2025-11-12",
      areaRequired: 450.5,
      riskProfile: {
        level: "Low",
        score: 12,
        factors: ["Favorable historical state timeline", "Low objection count (12)"]
      },
      statusHistory: [
        { status: "Submitted", timestamp: "2025-11-12T09:00:00Z", actor: "PIA Rep (MoRTH)", role: "agency", comment: "Initial proposal submitted." },
        { status: "Under Scrutiny", timestamp: "2025-11-15T14:30:00Z", actor: "State Coordinator", role: "state", comment: "Forwarded for SIA review." },
        { status: "Approved", timestamp: "2025-12-01T11:00:00Z", actor: "Joint Secretary", role: "national", comment: "Cleared all RFCTLARR compliance checks." },
      ]
    },
    {
      id: "PRJ-2026-002",
      projectName: "Pune-Nashik Semi High-Speed Rail",
      ministry: "Ministry of Railways",
      category: "Rail",
      state: "Maharashtra",
      district: "Pune",
      status: "Under Scrutiny",
      dateSubmitted: "2026-01-05",
      areaRequired: 120.0,
      riskProfile: {
        level: "High",
        score: 84,
        factors: ["High historical district delay rate (68%)", "Urban density delays", "High objection volume (450+)"]
      },
      statusHistory: [
        { status: "Submitted", timestamp: "2026-01-05T10:00:00Z", actor: "PIA Rep (Railways)", role: "agency", comment: "Initial proposal submitted." },
        { status: "Under Scrutiny", timestamp: "2026-01-08T16:00:00Z", actor: "State Coordinator", role: "state", comment: "SIA report under evaluation." },
      ]
    },
    {
      id: "PRJ-2026-003",
      projectName: "Chennai-Bengaluru Industrial Corridor (Node 2)",
      ministry: "DPIIT",
      category: "Industrial Corridor",
      state: "Tamil Nadu",
      district: "Kanchipuram",
      status: "Under Scrutiny",
      dateSubmitted: "2025-08-20",
      areaRequired: 315.2,
      riskProfile: {
        level: "Medium",
        score: 45,
        factors: ["Approaching Sec 19 Declaration SLA", "Moderate objection count (142)"]
      },
      statusHistory: [
        { status: "Submitted", timestamp: "2025-08-20T08:30:00Z", actor: "PIA Rep (DPIIT)", role: "agency", comment: "Initial proposal submitted." },
        { status: "Under Scrutiny", timestamp: "2025-08-25T13:00:00Z", actor: "State Coordinator", role: "state", comment: "Awaiting SIA clearance." },
      ]
    }
  ];

  let mockCompensation = [
    { id: "COMP-101", ulpin: "06122344556677", ownerName: "Gram Panchayat, Khedki", marketValue: 8500000, solatium: 8500000, totalAssessed: 17000000, amountDisbursed: 17000000, disbursementDate: "2026-08-15", status: "Disbursed" },
    { id: "COMP-102", ulpin: "27122344556688", ownerName: "Smt. Kavita Patil", marketValue: 4200000, solatium: 4200000, totalAssessed: 8400000, amountDisbursed: 0, disbursementDate: null, status: "Processing DBT" },
    { id: "COMP-103", ulpin: "55443322110099", ownerName: "Abdul Khan", marketValue: 3200000, solatium: 3200000, totalAssessed: 6400000, amountDisbursed: 0, disbursementDate: null, status: "Pending" }
  ];

  let mockDocuments = [
    { id: "DOC-8821", title: "Gazette_Sec11_3(A)_Nuh_Signed.pdf", type: "Gazette", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-10-12", checksum: "8f4e2a...c91b", status: "Verified" },
    { id: "DOC-8822", title: "SIA_Report_PuneNashik_Draft.pdf", type: "Report", version: "v2.1", uploadedBy: "PIA Rep", uploadDate: "2025-10-25", checksum: "3b91ec...4a22", status: "Pending Signature" },
    { id: "DOC-8823", title: "Award_Enquiry_Kanchipuram.pdf", type: "Legal", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-11-05", checksum: "7c22df...11e3", status: "Verified" },
  ];

  // Proposal routes
  app.get("/api/proposals", (req, res) => {
    res.json(mockProposals);
  });

  // Proposal creation: Only PIA/Agency, State, and National can submit proposals
  app.post("/api/proposals", (req, res) => {
    const userRole = req.session?.user?.role;
    if (userRole && !["PIA/Agency", "State", "National", "agency", "state", "national"].includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Role '${userRole}' is not authorized to submit proposals. Only PIA/Agency, State, and National roles can submit.`,
      });
    }

    const id = `PRJ-2026-00${mockProposals.length + 1}`;
    const now = new Date().toISOString();
    const newProposal = {
      ...req.body,
      id,
      status: "Submitted",
      dateSubmitted: now.split("T")[0],
      submittedBy: req.session?.user?.name || "PIA Rep",
      submittingRole: req.session?.user?.role || "PIA/Agency",
      riskProfile: {
        level: "Medium",
        score: 50,
        factors: ["Insufficient historical data for accurate prediction", "Standard SLA applies"]
      },
      statusHistory: [
        { status: "Submitted", timestamp: now, actor: req.session?.user?.name || "PIA Rep", role: (req.session?.user?.role || "agency").toLowerCase(), comment: "Initial proposal submitted." }
      ]
    };
    mockProposals.unshift(newProposal);
    res.json(newProposal);
  });

  // Role Protected: Proposal status transitions and RFCTLARR statutory approval
  app.patch("/api/proposals/:id/status", (req, res) => {
    const { id } = req.params;
    const { action, role, comment, status, remarks } = req.body;
    const activeRole = req.session?.user?.role || role;

    const proposal = mockProposals.find((p) => p.id === id);
    if (!proposal) {
      return res.status(404).json({ error: `Proposal ${id} not found` });
    }

    const actionToStatus: Record<string, string> = {
      "Approve": "Approved",
      "Reject": "Rejected",
      "Submit for Scrutiny": "Under Scrutiny",
    };

    let targetStatus = status;
    let targetAction = action;

    if (action) {
      targetStatus = actionToStatus[action];
      if (!targetStatus) {
        return res.status(400).json({ error: `Unknown action: ${action}` });
      }
    } else if (status) {
      if (status === "Approved") targetAction = "Approve";
      else if (status === "Rejected") targetAction = "Reject";
      else if (status === "Under Scrutiny") targetAction = "Submit for Scrutiny";
    }

    const validStatuses = ["Under Scrutiny", "Approved", "Rejected", "Submitted"];
    if (!targetStatus || !validStatuses.includes(targetStatus)) {
      return res.status(400).json({ error: `Invalid status or action.` });
    }

    // Role check: District & State can approve/reject; National/PIA can submit for scrutiny
    if (targetStatus === "Approved" || targetStatus === "Rejected") {
      const canApprove = activeRole === "District" || activeRole === "State" || activeRole === "district" || activeRole === "state";
      if (!canApprove) {
        return res.status(403).json({
          error: "Forbidden",
          message: `Role '${activeRole || "Unknown"}' is not authorized to approve proposals. Only District and State authorities possess statutory sanction power.`,
        });
      }
    }

    if (targetAction && activeRole) {
      const allowedActions = roleAllowedActions[activeRole] || [];
      if (!allowedActions.includes(targetAction)) {
        return res.status(403).json({
          error: "Forbidden",
          message: `Role "${activeRole}" is not permitted to perform action "${targetAction}".`,
        });
      }
    }

    const allowed = validTransitions[proposal.status] || [];
    if (proposal.status && allowed.length > 0 && !allowed.includes(targetStatus)) {
      return res.status(409).json({
        error: `Cannot transition from "${proposal.status}" to "${targetStatus}". Valid transitions: ${allowed.join(", ") || "none"}`,
      });
    }

    proposal.status = targetStatus;
    proposal.statusHistory = proposal.statusHistory || [];
    const now = new Date().toISOString();
    const actorName = req.session?.user?.name || (activeRole === "National" || activeRole === "national" ? "Joint Secretary" : activeRole === "State" || activeRole === "state" ? "State Coordinator" : activeRole === "District" || activeRole === "district" ? "District Collector" : "PIA Rep");
    const commentText = comment || remarks || `Status changed to ${targetStatus} by ${activeRole || "Officer"}.`;

    proposal.statusHistory.push({
      status: targetStatus,
      timestamp: now,
      actor: actorName,
      role: (activeRole || "agency").toLowerCase(),
      comment: commentText,
    });

    res.json({
      ...proposal,
      success: true,
      message: `Proposal ${id} status successfully changed to '${targetStatus}' by ${activeRole || "Officer"} (${actorName}).`,
      proposal,
      updatedBy: req.session?.user,
      remarks: commentText,
    });
  });

  app.get("/api/alerts", (req, res) => {
    res.json([
      { id: "ALT-001", type: "Lapse Risk", message: "Section 24(2) lapse risk: Award is 4.8 years old with pending possession for CBIC Node 2.", projectId: "PRJ-2026-003", projectName: "CBIC Node 2", timestamp: "2026-09-08T10:30:00Z", severity: "Critical", isRead: false },
      { id: "ALT-002", type: "SLA Breach", message: "Sec 19 Declaration delayed by 45 days beyond SIA clearance.", projectId: "PRJ-2026-002", projectName: "Pune-Nashik Semi High-Speed Rail", timestamp: "2026-09-08T08:15:00Z", severity: "Warning", isRead: false },
      { id: "ALT-003", type: "Approval Pending", message: "District LAO submitted compensation award for Nuh Expressway Phase.", projectId: "PRJ-2026-001", projectName: "Delhi-Mumbai Expressway", timestamp: "2026-09-07T16:45:00Z", severity: "Info", isRead: true },
    ]);
  });

  app.get("/api/compensation", (req, res) => {
    res.json(mockCompensation);
  });

  // Only LAO Officer and District can disburse compensation
  app.post("/api/compensation/:id/disburse", requireRole(["LAO Officer", "District"]), (req, res) => {
    const { id } = req.params;
    const record = mockCompensation.find((c) => c.id === id);
    if (!record) {
      return res.status(404).json({ error: `Compensation record ${id} not found` });
    }

    record.status = "Disbursed";
    record.amountDisbursed = record.totalAssessed;
    record.disbursementDate = new Date().toISOString().split("T")[0];

    res.json({
      success: true,
      message: `Statutory compensation of ₹${record.totalAssessed.toLocaleString("en-IN")} disbursed to ${record.ownerName} by ${req.session.user?.role}.`,
      record,
    });
  });

  app.get("/api/rnr", (req, res) => {
    res.json([
      { id: "RNR-001", ulpin: "06122344556677", familyHead: "Ramesh Singh", category: "Agricultural Labourer", displacementStatus: "Displaced", entitlements: { housing: true, employment: true, annuity: false }, overallStatus: "In Progress" },
      { id: "RNR-002", ulpin: "27122344556688", familyHead: "Smt. Kavita Patil", category: "Owner", displacementStatus: "Affected Not Displaced", entitlements: { housing: false, employment: false, annuity: true }, overallStatus: "Settled" },
      { id: "RNR-003", ulpin: "55443322110099", familyHead: "Abdul Khan", category: "Owner", displacementStatus: "Affected Not Displaced", entitlements: { housing: false, employment: false, annuity: true }, overallStatus: "Pending" }
    ]);
  });

  app.get("/api/documents", (req, res) => {
    res.json(mockDocuments);
  });
  
  app.get("/api/kpis", (req, res) => {
    res.json({
      areaNotified: "1,45,210 Ha",
      areaAcquired: "1,28,500 Ha",
      compensationAssessed: "₹42,450 Cr",
      compensationDisbursed: "₹39,800 Cr",
      familiesAffected: "34,205",
      familiesRnR: "28,450",
    });
  });

  app.get("/api/parcels", (req, res) => {
    // Generate some mock GeoJSON data for parcels
    const parcels = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "1",
            ulpin: "06122344556677",
            status: "Notification",
            owner: "Gram Panchayat, Khedki",
            area: 4.5,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.2090, 28.6139],
                [77.2095, 28.6139],
                [77.2095, 28.6145],
                [77.2090, 28.6145],
                [77.2090, 28.6139],
              ]
            ]
          }
        },
        {
          type: "Feature",
          properties: {
            id: "2",
            ulpin: "27122344556688",
            status: "Award",
            owner: "Smt. Kavita Patil",
            area: 1.2,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.2100, 28.6150],
                [77.2110, 28.6150],
                [77.2110, 28.6160],
                [77.2100, 28.6160],
                [77.2100, 28.6150],
              ]
            ]
          }
        }
      ]
    };
    res.json(parcels);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
