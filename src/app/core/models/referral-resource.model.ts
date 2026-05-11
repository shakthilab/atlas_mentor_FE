export enum OwnerType {
  REFERRAL = 'REFERRAL',
  COMPANY = 'COMPANY'
}

export enum StorageType {
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  ONEDRIVE = 'ONEDRIVE',
  DROPBOX = 'DROPBOX',
  S3_UPLOAD = 'S3_UPLOAD',
  OTHER = 'OTHER'
}

export enum ResourceType {
  DOCUMENT = 'DOCUMENT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  SPREADSHEET = 'SPREADSHEET',
  PRESENTATION = 'PRESENTATION',
  LINK = 'LINK',
  OTHER = 'OTHER'
}

export interface ReferralResource {
  id: number;
  ownerId: number;
  ownerType: OwnerType;
  ownerName: string;
  uploadedById: number;
  uploadedByName: string;
  storageType: StorageType;
  externalUrl: string | null;
  filePath: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  resourceType: ResourceType;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface ReferralResourceRequest {
  ownerId?: number;
  ownerIds?: number[];
  ownerType: OwnerType;
  storageType: StorageType;
  externalUrl: string | null;
  filePath: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  resourceType: ResourceType;
  description: string;
  expiresAt: string | null;
}

export interface ReferralResourcePage {
  content: ReferralResource[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
