import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_CONFIG } from "../config/urls";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



/**
 * Fetches a CSRF token from the server
 * @returns The CSRF token as a string
 */
export async function getCookie(): Promise<string> {
  try {
    const csrfRes = await fetch(`${API_CONFIG.baseUrl}/auth/csrf-token`, {
      credentials: "include",
    });

    if (!csrfRes.ok) {
      throw new Error("Failed to fetch CSRF token");
    }

    const { csrfToken } = await csrfRes.json();
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
}

export function getBearerToken () {
  return process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY!
}



/**
 * Get CSRF token from backend.
 */
export async function getCsrfToken(): Promise<string> {
  const csrfRes = await fetch(`${API_CONFIG.baseUrl}/auth/csrf-token`, {
    credentials: "include", // include cookies for session
  });

  if (!csrfRes.ok) throw new Error("Failed to fetch CSRF token");
  const { csrfToken } = await csrfRes.json();
  return csrfToken;
}

export function getUploadUrl(uploadRes: any): string {
  if (!uploadRes) return "";
  if (typeof uploadRes === "string") return uploadRes;
  if (uploadRes.url) return uploadRes.url;
  if (uploadRes.data && uploadRes.data.publicUrl) return uploadRes.data.publicUrl;
  if (uploadRes.data && uploadRes.data?.data) {
    const inner = uploadRes.data.data;
    if (typeof inner === "string") return inner;
    if (inner.publicUrl) return inner.publicUrl;
  }
  return (uploadRes.data && String(uploadRes.data)) || JSON.stringify(uploadRes);
}


/**
 * Upload a single file to Supabase via backend.
 * @param file - File object from <input type="file" />
 */
export async function uploadSingleFile(file: File): Promise<any> {
  const csrfToken = await getCsrfToken();

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_CONFIG.baseUrl}/supabase/upload`, {
    method: "POST",
    credentials: "include",
    headers: {
      "x-csrf-token": csrfToken,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("File upload failed");
  return res.json();
}

/**
 * Upload multiple files to Supabase via backend.
 * @param files - File[] array from <input type="file" multiple />
 */
export async function uploadMultipleFiles(files: File[]): Promise<any> {
  const csrfToken = await getCsrfToken();

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`${API_CONFIG.baseUrl}}/supabase/upload-multiple`, {
    method: "POST",
    credentials: "include",
    headers: {
      "x-csrf-token": csrfToken,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Multiple file upload failed");
  return res.json();
}



// ✅ Policy Class Enum
export enum PolicyClass {
  TravelInsurance = 'TravelInsurance',
  BlockchainExploitInsurance = 'BlockchainExploitInsurance',
  FireInsurance = 'FireInsurance',
  MotorInsurance = 'MotorInsurance',
  PersonalAccidentInsurance = 'PersonalAccidentInsurance',
  HealthInsurance = 'HealthInsurance',
  InvalidClassOfInsurance = 'InvalidClassOfInsurance',
}


export enum PremiumFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  ANNUALLY = 'ANNUALLY',
  INVALID = 'INVALID',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Successful = 'Successful',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
  InvalidPaymentStatus = 'InvalidPaymentStatus',
}


  // ✅ Proposal Status Enum
  export enum ProposalStatus {
    Draft = 'Draft',
    Submitted = 'Submitted',
    UnderReview = 'UnderReview',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Expired = 'Expired',
    InvalidStatus = 'InvalidStatus',
  }
  
  // ✅ Rejection Reason Enum
  export enum RejectionReason {
    IncompleteProposal = 'IncompleteProposal',
    Misrepresentation = 'Misrepresentation',
    NonDisclosure = 'NonDisclosure',
    RiskTooHigh = 'RiskTooHigh',
    LacksInsurableInterest = 'LacksInsurableInterest',
    PoorMoralHazard = 'PoorMoralHazard',
    PoorPhysicalHazard = 'PoorPhysicalHazard',
    UndisclosedReason = 'UndisclosedReason',
    NotRejected = 'NotRejected',
    LacksKYC = 'LacksKYC',
    InvalidReason = 'InvalidReason',
  }


  // More explicit version with type aliases
export type DecimalString = string; // Represents numeric/decimal values as strings
export type BigNumberString = string; // Represents large numbers (precision 78, scale 0)

export interface InsuranceProduct {
  id: string;
  productName: string;
  productDescription: string;
  productCode: string;
  policyClass: PolicyClass;
  subjectMatter: string;
  basicRate: DecimalString; // precision: 10, scale: 4
  defaultPremiumFrequency: PremiumFrequency;
  frequencyFactor: number;
  minimumSumInsured?: BigNumberString; // precision: 78, scale: 0
  maximumSumInsured?: BigNumberString; // precision: 78, scale: 0
  isActive: boolean;
  bannerImageUrl?: string;
  productBenefits?: string[];
  requiredDocuments?: string[];
  productFAQs?: string[][];
  createdAt: Date;
  updatedAt: Date;
}




  export function convertRejectionReasonToCode(reason: RejectionReason): number {
    switch (reason) {
      case RejectionReason.IncompleteProposal: return 0;
      case RejectionReason.Misrepresentation: return 1;
      case RejectionReason.NonDisclosure: return 2;
      case RejectionReason.RiskTooHigh: return 3;
      case RejectionReason.LacksInsurableInterest: return 4;
      case RejectionReason.PoorMoralHazard: return 5;
      case RejectionReason.PoorPhysicalHazard: return 6;
      case RejectionReason.UndisclosedReason: return 7;
      case RejectionReason.NotRejected: return 8;
      case RejectionReason.LacksKYC: return 9;
      default: return 100;
    }
  }
  
  export function convertRejectionCodeToReason(code: number): RejectionReason {
    switch (code) {
      case 0: return RejectionReason.IncompleteProposal;
      case 1: return RejectionReason.Misrepresentation;
      case 2: return RejectionReason.NonDisclosure;
      case 3: return RejectionReason.RiskTooHigh;
      case 4: return RejectionReason.LacksInsurableInterest;
      case 5: return RejectionReason.PoorMoralHazard;
      case 6: return RejectionReason.PoorPhysicalHazard;
      case 7: return RejectionReason.UndisclosedReason;
      case 8: return RejectionReason.NotRejected;
      case 9: return RejectionReason.LacksKYC;
      default: return RejectionReason.InvalidReason;
    }
  }
  

  
  export function convertProposalStatusToCode(status: ProposalStatus): number {
    switch (status) {
      case ProposalStatus.Draft: return 0;
      case ProposalStatus.Submitted: return 1;
      case ProposalStatus.UnderReview: return 2;
      case ProposalStatus.Approved: return 3;
      case ProposalStatus.Rejected: return 4;
      case ProposalStatus.Expired: return 5;
      default: return 100;
    }
  }
  
  export function convertProposalCodeToStatus(code: number): ProposalStatus {
    switch (code) {
      case 0: return ProposalStatus.Draft;
      case 1: return ProposalStatus.Submitted;
      case 2: return ProposalStatus.UnderReview;
      case 3: return ProposalStatus.Approved;
      case 4: return ProposalStatus.Rejected;
      case 5: return ProposalStatus.Expired;
      default: return ProposalStatus.InvalidStatus;
    }
  }
  

  
  export function convertPolicyClassToCode(policyClass: PolicyClass): number {
    switch (policyClass) {
      case PolicyClass.TravelInsurance: return 0;
      case PolicyClass.BlockchainExploitInsurance: return 1;
      case PolicyClass.FireInsurance: return 2;
      case PolicyClass.MotorInsurance: return 3;
      case PolicyClass.PersonalAccidentInsurance: return 4;
      case PolicyClass.HealthInsurance: return 5;
      default: return 100;
    }
  }
  
  export function convertPolicyCodeToClass(code: number): PolicyClass {
    switch (code) {
      case 0: return PolicyClass.TravelInsurance;
      case 1: return PolicyClass.BlockchainExploitInsurance;
      case 2: return PolicyClass.FireInsurance;
      case 3: return PolicyClass.MotorInsurance;
      case 4: return PolicyClass.PersonalAccidentInsurance;
      case 5: return PolicyClass.HealthInsurance;
      default: return PolicyClass.InvalidClassOfInsurance;
    }
  }
  

  
  export function convertPremiumFrequencyToCode(frequency: PremiumFrequency): number {
    switch (frequency) {
      case PremiumFrequency.MONTHLY: return 0;
      case PremiumFrequency.QUARTERLY: return 1;
      case PremiumFrequency.HALF_YEARLY: return 2;
      case PremiumFrequency.ANNUALLY: return 3;
      default: return 100;
    }
  }
  
  export function convertPremiumCodeToFrequency(code: number): PremiumFrequency {
    switch (code) {
      case 0: return PremiumFrequency.MONTHLY;
      case 1: return PremiumFrequency.QUARTERLY;
      case 2: return PremiumFrequency.HALF_YEARLY;
      case 3: return PremiumFrequency.ANNUALLY;
      default: return PremiumFrequency.INVALID;
    }
  }


  export interface StarknetEvent {
    keys: string[];
    data: string[];
  }

 export function stringToHex(str: string): string {
    return "0x" + Buffer.from(str, "utf8").toString("hex");
  }
  