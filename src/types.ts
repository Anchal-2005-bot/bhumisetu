export interface KPI {
  areaNotified: string;
  areaAcquired: string;
  compensationAssessed: string;
  compensationDisbursed: string;
  familiesAffected: string;
  familiesRnR: string;
}

export interface ParcelProperties {
  id: string;
  ulpin: string;
  status: string;
  owner: string;
  area: number;
}

export interface RiskProfile {
  level: 'High' | 'Medium' | 'Low';
  score: number;
  factors: string[];
}

export interface Proposal {
  id: string;
  projectName: string;
  ministry: string;
  category: string;
  state: string;
  district: string;
  status: 'Draft' | 'Submitted' | 'Under Scrutiny' | 'Approved' | 'Rejected';
  dateSubmitted: string;
  areaRequired: number;
  riskProfile?: RiskProfile;
}

export interface Alert {
  id: string;
  type: 'SLA Breach' | 'Lapse Risk' | 'Approval Pending' | 'Milestone Due';
  message: string;
  projectId: string;
  projectName: string;
  timestamp: string;
  severity: 'Critical' | 'Warning' | 'Info';
  isRead: boolean;
}


export interface CompensationRecord {
  id: string;
  ulpin: string;
  ownerName: string;
  marketValue: number;
  solatium: number;
  totalAssessed: number;
  amountDisbursed: number;
  disbursementDate: string | null;
  status: 'Pending' | 'Processing DBT' | 'Disbursed';
}

export interface RnRRecord {
  id: string;
  ulpin: string;
  familyHead: string;
  category: 'Owner' | 'Tenant' | 'Agricultural Labourer';
  displacementStatus: 'Displaced' | 'Affected Not Displaced';
  entitlements: {
    housing: boolean;
    employment: boolean;
    annuity: boolean;
  };
  overallStatus: 'Pending' | 'In Progress' | 'Settled';
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: string;
  version: string;
  uploadedBy: string;
  uploadDate: string;
  checksum: string;
  status: 'Verified' | 'Pending Signature';
}
