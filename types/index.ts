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