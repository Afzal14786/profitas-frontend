export type PropertyStatus =
  | "draft"
  | "pending_verification"
  | "verified"
  | "rejected"
  | "archived";

export type PropertyType =
  | "commercial"
  | "office"
  | "retail"
  | "industrial"
  | "residential"
  | "mixed_use";

export type Property = {
  id: string;
  name: string;
  location: string;
  address?: string | null;
  propertyType: PropertyType;
  value: number;
  rentalYield: number | null;
  status: PropertyStatus;
  ownershipDetails?: string | null;
  organizationId?: string | null;
  ownerUserId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type Organization = {
  id: string;
  name: string;
  type: "property_owner" | "property_developer" | "partner";
  email: string;
  roleInOrg?: "owner" | "admin" | "member";
  isActive: boolean;
};

export type LiquidityType = "sell_match" | "get_credit";

export type LiquidityStatus =
  | "requested"
  | "processing"
  | "completed"
  | "rejected"
  | "cancelled";

export type ListingStatus = "active" | "matched" | "closed" | "cancelled";

export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type CreditStatus =
  | "requested"
  | "routed"
  | "approved"
  | "rejected"
  | "disbursed";

export type Offer = {
  id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
};

export type Listing = {
  id: string;
  liquidityRequestId: string;
  propertyId: string;
  askingPrice: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreditApplication = {
  id: string;
  liquidityRequestId: string;
  propertyId: string;
  investorId: string;
  lenderId: string | null;
  requestedAmount: number;
  status: CreditStatus;
  createdAt: string;
  updatedAt: string;
};

export type LiquidityRequest = {
  id: string;
  propertyId: string;
  requestedBy: string;
  liquidityType: LiquidityType;
  status: LiquidityStatus;
  createdAt: string;
  updatedAt: string;
  listing?: Listing | null;
  creditApplication?: CreditApplication | null;
};

export type PartnerType =
  | "bank"
  | "nbfc"
  | "institution"
  | "property_platform"
  | "legal_advocate"
  | "property_manager";

export type Partner = {
  id: string;
  organizationId: string;
  partnerType: PartnerType;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  services: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizationName?: string;
  organizationEmail?: string;
};

export type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserStats = {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  investors: number;
};

export type VerificationType = "title" | "ownership" | "encumbrance" | "dispute";

export type VerificationStatus =
  | "pending"
  | "in_review"
  | "verified"
  | "rejected";

export type Verification = {
  id: string;
  propertyId: string;
  documentId: string | null;
  verificationType: VerificationType;
  status: VerificationStatus;
  verifiedBy: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ComplianceType = "regulatory" | "documentation" | "disclosure";

export type ComplianceStatus =
  | "pending"
  | "in_review"
  | "compliant"
  | "non_compliant";

export type ComplianceRecord = {
  id: string;
  propertyId: string;
  complianceType: ComplianceType;
  status: ComplianceStatus;
  reviewedBy: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ComplianceStats = {
  total: number;
  pending: number;
  inReview: number;
  compliant: number;
  nonCompliant: number;
};

export type DocumentType =
  | "title"
  | "ownership"
  | "encumbrance"
  | "sale_agreement"
  | "lease"
  | "investment_agreement"
  | "collateral"
  | "compliance"
  | "other";

export type DocumentStatus = "pending" | "verified" | "rejected";

export type DocumentItem = {
  id: string;
  propertyId: string;
  uploadedBy: string;
  documentType: DocumentType;
  fileName: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  cloudinaryFormat: string | null;
  cloudinaryBytes: number | null;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
};