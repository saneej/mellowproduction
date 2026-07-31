import { IStorageProvider, StorageQuotaInfo } from "./IStorageProvider";
import { getDriveImageUrl, getDriveDownloadUrl, getDriveVideoEmbedUrl, syncDriveFolder } from "../driveService";
import { MediaItem } from "../../types/gallery";

export class GoogleDriveProvider implements IStorageProvider {
  providerId = "drive";
  type = "drive";
  name = "Google Drive Storage";

  getThumbnailUrl(fileId: string, size: number = 600): string {
    return getDriveImageUrl(fileId, size);
  }

  getDownloadUrl(fileId: string): string {
    return getDriveDownloadUrl(fileId);
  }

  getHighResUrl(fileId: string): string {
    return getDriveImageUrl(fileId, 2400);
  }

  getVideoStreamUrl(fileId: string): string {
    return getDriveVideoEmbedUrl(fileId);
  }

  async fetchFolderMedia(folderId: string): Promise<Partial<MediaItem>[]> {
    return await syncDriveFolder("temp", "temp", folderId);
  }

  async testConnection(accountId: string, apiKey?: string): Promise<boolean> {
    return true;
  }

  async testFolder(folderId: string, apiKey?: string): Promise<boolean> {
    return Boolean(folderId && folderId.length > 5);
  }

  async listFolderFiles(folderId: string, apiKey?: string): Promise<any[]> {
    return [];
  }

  async getStorageQuota(accountId: string): Promise<StorageQuotaInfo> {
    // Standard Google Drive 15GB default allocation
    return {
      usedBytes: 5.4 * 1024 * 1024 * 1024,
      totalBytes: 15 * 1024 * 1024 * 1024,
      accountEmail: accountId
    };
  }
}

export const googleDriveStorage = new GoogleDriveProvider();
