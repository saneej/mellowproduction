import { MediaItem } from "../../types/gallery";

export interface StorageQuotaInfo {
  usedBytes: number;
  totalBytes: number;
  accountEmail?: string;
}

export interface IStorageProvider {
  providerId: string;
  type?: string;
  name: string;
  
  // URL Resolvers
  getThumbnailUrl(fileId: string, size?: number): string;
  getDownloadUrl(fileId: string): string;
  getHighResUrl(fileId: string): string;

  // Folder Sync abstraction
  fetchFolderMedia(folderId: string): Promise<Partial<MediaItem>[]>;
  
  // Storage Quota & Admin Testing
  getStorageQuota?(accountId: string): Promise<StorageQuotaInfo>;
  testConnection?(accountId: string, apiKey?: string): Promise<boolean>;
  testFolder?(folderId: string, apiKey?: string): Promise<boolean>;
  listFolderFiles?(folderId: string, apiKey?: string): Promise<any[]>;
}
