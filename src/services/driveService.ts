import { MediaItem } from "../types/gallery";

export const extractDriveFolderId = (urlOrId: string): string => {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  
  // Match folder URL patterns like drive.google.com/drive/folders/ID or drive.google.com/drive/u/0/folders/ID
  const folderMatch = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }
  
  // If user pasted a file URL instead of folder URL
  const fileMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }

  // Otherwise assume it's the raw ID
  return trimmed;
};

export const extractDriveFileId = (urlOrId: string): string => {
  if (!urlOrId || typeof urlOrId !== "string") return "";
  const trimmed = urlOrId.trim();
  const fileMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }
  return trimmed;
};

export const getDriveImageUrl = (fileId: string, size: number = 2048): string => {
  if (!fileId || typeof fileId !== "string") return "";
  // If it's already a full http URL
  if (fileId.startsWith("http://") || fileId.startsWith("https://")) {
    return fileId;
  }
  return `https://lh3.googleusercontent.com/d/${fileId}=s${size}`;
};

export const getDriveLqipUrl = (fileId: string): string => {
  if (!fileId || typeof fileId !== "string") return "";
  if (fileId.startsWith("http://") || fileId.startsWith("https://")) {
    return fileId;
  }
  return `https://lh3.googleusercontent.com/d/${fileId}=s50`;
};

export const getDriveVideoEmbedUrl = (fileId: string): string => {
  if (!fileId) return "";
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

export const getDriveDownloadUrl = (fileId: string): string => {
  if (!fileId) return "";
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

/**
 * Syncs files from a Google Drive Folder ID via the backend API handler.
 */
export const syncDriveFolder = async (
  projectId: string,
  eventId: string,
  folderId: string,
  apiKey?: string
): Promise<Partial<MediaItem>[]> => {
  try {
    const response = await fetch("/api/drive/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, eventId, folderId, apiKey })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Sync failed" }));
      throw new Error(err.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error syncing Google Drive folder:", error);
    throw error;
  }
};
