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
  if (fileId.startsWith("http://") || fileId.startsWith("https://") || fileId.startsWith("data:") || fileId.startsWith("blob:") || fileId.startsWith("/")) {
    return fileId;
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
};

export const getDriveLqipUrl = (fileId: string): string => {
  if (!fileId || typeof fileId !== "string") return "";
  if (fileId.startsWith("http://") || fileId.startsWith("https://") || fileId.startsWith("data:") || fileId.startsWith("blob:") || fileId.startsWith("/")) {
    return fileId;
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w50`;
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
 * Syncs files from a Google Drive Folder ID.
 * First tries the server-side proxy endpoint. If that fails (e.g. static hosting like Vercel or Netlify returning 404),
 * it falls back to a direct client-side fetch using the Google Drive API.
 */
export const syncDriveFolder = async (
  projectId: string,
  eventId: string,
  folderId: string,
  apiKey?: string
): Promise<Partial<MediaItem>[]> => {
  const accessToken = localStorage.getItem("google_drive_access_token") || undefined;
  try {
    const response = await fetch("/api/drive/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, eventId, folderId, apiKey, accessToken })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.items)) {
        return data.items;
      }
    }
    
    // If response was not ok, or structure didn't match, trigger direct client fallback
    throw new Error(`Proxy sync returned status ${response.status}`);
  } catch (error) {
    console.warn("Backend sync failed or unavailable, trying client-side direct Drive API fallback:", error);
    
    const activeApiKey = apiKey || (import.meta as any).env?.VITE_GOOGLE_DRIVE_API_KEY || (import.meta as any).env?.VITE_GOOGLE_API_KEY;

    try {
      let files: any[] = [];

      if (accessToken || activeApiKey) {
        const q = `'${folderId}' in parents and trashed=false`;
        const driveUrl = accessToken
          ? `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,imageMediaMetadata,videoMediaMetadata)&pageSize=100`
          : `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,imageMediaMetadata,videoMediaMetadata)&pageSize=100&key=${activeApiKey}`;

        const headers: Record<string, string> = {};
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const driveRes = await fetch(driveUrl, { headers });
        if (driveRes.ok) {
          const data = await driveRes.json();
          files = data.files || [];
        }
      }

      if (files.length === 0) {
        try {
          const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
          const pageRes = await fetch(embedUrl);
          if (pageRes.ok) {
            const html = await pageRes.text();
            const fileIdMatches = html.match(/\/file\/d\/([a-zA-Z0-9_-]{25,50})|id=([a-zA-Z0-9_-]{25,50})|lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{25,50})/g) || [];
            const extractedIds = new Set<string>();

            fileIdMatches.forEach(m => {
              const subMatch = m.match(/([a-zA-Z0-9_-]{25,50})/g);
              if (subMatch) {
                subMatch.forEach(id => {
                  if (id !== folderId && id.length >= 25) {
                    extractedIds.add(id);
                  }
                });
              }
            });

            extractedIds.forEach((id, idx) => {
              files.push({
                id,
                name: `Drive_Photo_${idx + 1}.jpg`,
                mimeType: "image/jpeg"
              });
            });
          }
        } catch (e) {
          console.warn("Client embedded folder fetch warning:", e);
        }
      }

      return files.map((f: any, idx: number) => {
        const nameLower = (f.name || "").toLowerCase();
        const isVid = (f.mimeType || "").toLowerCase().includes("video") || 
                      nameLower.endsWith(".mp4") || 
                      nameLower.endsWith(".mov") || 
                      nameLower.endsWith(".m4v") || 
                      nameLower.endsWith(".webm") || 
                      nameLower.endsWith(".avi") || 
                      nameLower.endsWith(".mkv");
        const isDriveId = f.id && !f.id.startsWith("http");

        const thumbnailUrl = isDriveId 
          ? (isVid ? `https://drive.google.com/thumbnail?id=${f.id}&sz=w800` : `https://lh3.googleusercontent.com/d/${f.id}=s800`) 
          : f.id;

        const fullUrl = isDriveId 
          ? (isVid ? `https://drive.google.com/thumbnail?id=${f.id}&sz=w1600` : `https://lh3.googleusercontent.com/d/${f.id}=s2048`) 
          : f.id;

        const videoUrl = isVid 
          ? (isDriveId ? `https://drive.google.com/file/d/${f.id}/preview` : f.id) 
          : undefined;

        return {
          projectId,
          eventId,
          driveFileId: f.id,
          fileName: f.name || `Media_${idx + 1}.${isVid ? 'mp4' : 'jpg'}`,
          mimeType: f.mimeType || (isVid ? "video/mp4" : "image/jpeg"),
          fileSize: f.size ? parseInt(f.size, 10) : undefined,
          width: f.imageMediaMetadata?.width || f.videoMediaMetadata?.width,
          height: f.imageMediaMetadata?.height || f.videoMediaMetadata?.height,
          thumbnailUrl,
          fullUrl,
          isVideo: isVid,
          videoUrl,
          order: idx + 1,
          modifiedDate: f.modifiedTime || f.createdTime || new Date().toISOString()
        };
      });
    } catch (fallbackErr) {
      console.error("Direct Google Drive client fallback failed entirely:", fallbackErr);
      return [];
    }
  }
};
