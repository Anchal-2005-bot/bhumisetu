import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock API Routes for BhoomiSetu

  let mockProposals = [
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
      }
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
      }
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
      }
    }
  ];

  app.get("/api/proposals", (req, res) => {
    res.json(mockProposals);
  });

  app.post("/api/proposals", (req, res) => {
    const newProposal = {
      ...req.body,
      id: `PRJ-2026-00${mockProposals.length + 1}`,
      status: "Submitted",
      dateSubmitted: new Date().toISOString().split('T')[0],
      riskProfile: {
        level: "Medium",
        score: 50,
        factors: ["Insufficient historical data for accurate prediction", "Standard SLA applies"]
      }
    };
    mockProposals.unshift(newProposal);
    res.json(newProposal);
  });

  app.get("/api/alerts", (req, res) => {
    res.json([
      { id: "ALT-001", type: "Lapse Risk", message: "Section 24(2) lapse risk: Award is 4.8 years old with pending possession for CBIC Node 2.", projectId: "PRJ-2026-003", projectName: "CBIC Node 2", timestamp: "2026-09-08T10:30:00Z", severity: "Critical", isRead: false },
      { id: "ALT-002", type: "SLA Breach", message: "Sec 19 Declaration delayed by 45 days beyond SIA clearance.", projectId: "PRJ-2026-002", projectName: "Pune-Nashik Semi High-Speed Rail", timestamp: "2026-09-08T08:15:00Z", severity: "Warning", isRead: false },
      { id: "ALT-003", type: "Approval Pending", message: "District LAO submitted compensation award for Nuh Expressway Phase.", projectId: "PRJ-2026-001", projectName: "Delhi-Mumbai Expressway", timestamp: "2026-09-07T16:45:00Z", severity: "Info", isRead: true },
    ]);
  });


  app.get("/api/compensation", (req, res) => {
    res.json([
      { id: "COMP-101", ulpin: "06122344556677", ownerName: "Gram Panchayat, Khedki", marketValue: 8500000, solatium: 8500000, totalAssessed: 17000000, amountDisbursed: 17000000, disbursementDate: "2026-08-15", status: "Disbursed" },
      { id: "COMP-102", ulpin: "27122344556688", ownerName: "Smt. Kavita Patil", marketValue: 4200000, solatium: 4200000, totalAssessed: 8400000, amountDisbursed: 0, disbursementDate: null, status: "Processing DBT" },
      { id: "COMP-103", ulpin: "55443322110099", ownerName: "Abdul Khan", marketValue: 3200000, solatium: 3200000, totalAssessed: 6400000, amountDisbursed: 0, disbursementDate: null, status: "Pending" }
    ]);
  });

  app.get("/api/rnr", (req, res) => {
    res.json([
      { id: "RNR-001", ulpin: "06122344556677", familyHead: "Ramesh Singh", category: "Agricultural Labourer", displacementStatus: "Displaced", entitlements: { housing: true, employment: true, annuity: false }, overallStatus: "In Progress" },
      { id: "RNR-002", ulpin: "27122344556688", familyHead: "Smt. Kavita Patil", category: "Owner", displacementStatus: "Affected Not Displaced", entitlements: { housing: false, employment: false, annuity: true }, overallStatus: "Settled" },
      { id: "RNR-003", ulpin: "55443322110099", familyHead: "Abdul Khan", category: "Owner", displacementStatus: "Affected Not Displaced", entitlements: { housing: false, employment: false, annuity: true }, overallStatus: "Pending" }
    ]);
  });

  app.get("/api/documents", (req, res) => {
    res.json([
      { id: "DOC-8821", title: "Gazette_Sec11_3(A)_Nuh_Signed.pdf", type: "Gazette", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-10-12", checksum: "8f4e2a...c91b", status: "Verified" },
      { id: "DOC-8822", title: "SIA_Report_PuneNashik_Draft.pdf", type: "Report", version: "v2.1", uploadedBy: "PIA Rep", uploadDate: "2025-10-25", checksum: "3b91ec...4a22", status: "Pending Signature" },
      { id: "DOC-8823", title: "Award_Enquiry_Kanchipuram.pdf", type: "Legal", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-11-05", checksum: "7c22df...11e3", status: "Verified" },
    ]);
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
