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