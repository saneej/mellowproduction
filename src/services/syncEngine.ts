import { MediaItem, SyncLog, Project } from "../types/gallery";
import { storageManager } from "./storage/StorageManager";
import { 
  getMediaByProject, 
  saveMediaBatch, 
  updateProject, 
  updateEventFolder, 
  saveSyncLog,
  getEventFolders
} from "./dbService";

export type SyncStep = 'idle' | 'scanning_folders' | 'reading_files' | 'comparing_duplicates' | 'updating_firestore' | 'completed' | 'failed';

export interface SyncProgressCallbackData {
  step: SyncStep;
  message: string;
  progressPercent: number;
  filesScanned: number;
  filesAdded: number;
  filesUpdated: number;
  filesRemoved: number;
}

export class SyncEngine {
  private activeSyncs: Set<string> = new Set();

  /**
   * Syncs media for an event folder or an entire project from Google Drive into Firestore metadata.
   */
  async syncProject(
    project: Project,
    targetEventId?: string,
    targetDriveFolderId?: string,
    apiKey?: string,
    onProgress?: (data: SyncProgressCallbackData) => void
  ): Promise<SyncLog> {
    const startTime = Date.now();
    const syncKey = `${project.id}_${targetEventId || "all"}`;

    if (this.activeSyncs.has(syncKey)) {
      throw new Error("Synchronization is already in progress for this project.");
    }

    this.activeSyncs.add(syncKey);

    const updateProgress = (step: SyncStep, message: string, percent: number, scanned = 0, added = 0, updated = 0, removed = 0) => {
      if (onProgress) {
        onProgress({
          step,
          message,
          progressPercent: percent,
          filesScanned: scanned,
          filesAdded: added,
          filesUpdated: updated,
          filesRemoved: removed
        });
      }
    };

    let filesAdded = 0;
    let filesUpdated = 0;
    let filesRemoved = 0;
    let failedFiles = 0;
    const errorMessages: string[] = [];

    try {
      // STEP 1: Scanning Folders
      updateProgress('scanning_folders', "Scanning Google Drive folder structure...", 10);

      // Determine folders to scan
      let eventsToScan: Array<{ id: string; folderId: string; title: string }> = [];

      if (targetEventId && targetDriveFolderId) {
        eventsToScan.push({ id: targetEventId, folderId: targetDriveFolderId, title: "Event Folder" });
      } else {
        const events = await getEventFolders(project.id);
        eventsToScan = events.map(e => ({
          id: e.id,
          folderId: e.driveFolderId,
          title: e.title
        })).filter(e => !!e.folderId);

        // Fallback to project default cover if no event folders
        if (eventsToScan.length === 0 && project.driveFolders?.length) {
          eventsToScan = project.driveFolders.map(df => ({
            id: df.id,
            folderId: df.driveFolderId,
            title: df.name
          }));
        }
      }

      if (eventsToScan.length === 0) {
        throw new Error("No Google Drive folder IDs configured for this project.");
      }

      // STEP 2: Reading Files
      updateProgress('reading_files', `Reading files from ${eventsToScan.length} folder(s)...`, 35);
      const provider = storageManager.getProvider("gdrive");

      const existingMedia = await getMediaByProject(project.id);
      const existingMap = new Map<string, MediaItem>();
      existingMedia.forEach(m => existingMap.set(m.driveFileId, m));

      const newMediaBatch: MediaItem[] = [];
      const currentScannedFileIds = new Set<string>();

      let totalScanned = 0;

      for (const evt of eventsToScan) {
        try {
          const files = await provider.listFolderFiles(evt.folderId, apiKey);
          totalScanned += files.length;

          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            currentScannedFileIds.add(f.id);

            const existing = existingMap.get(f.id);

            if (existing) {
              // Duplicate / Existing Check: Compare modified dates or metadata
              if (existing.modifiedDate !== f.modifiedDate || existing.isDeleted) {
                filesUpdated++;
                newMediaBatch.push({
                  ...existing,
                  fileName: f.name,
                  mimeType: f.mimeType,
                  fileSize: f.size,
                  width: f.width,
                  height: f.height,
                  tinyThumbnailUrl: f.thumbnailUrls.tiny,
                  smallThumbnailUrl: f.thumbnailUrls.small,
                  mediumThumbnailUrl: f.thumbnailUrls.medium,
                  hdUrl: f.thumbnailUrls.hd,
                  originalUrl: f.thumbnailUrls.original,
                  thumbnailUrl: f.thumbnailUrls.medium,
                  fullUrl: f.thumbnailUrls.hd,
                  isVideo: f.isVideo,
                  videoUrl: f.videoPreviewUrl,
                  duration: f.duration,
                  resolution: f.resolution,
                  isDeleted: false,
                  modifiedDate: f.modifiedDate || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              }
            } else {
              // New File
              filesAdded++;
              newMediaBatch.push({
                id: `media-${f.id}-${Date.now()}`,
                projectId: project.id,
                eventId: evt.id,
                driveFileId: f.id,
                fileName: f.name,
                mimeType: f.mimeType,
                fileSize: f.size,
                width: f.width,
                height: f.height,
                tinyThumbnailUrl: f.thumbnailUrls.tiny,
                smallThumbnailUrl: f.thumbnailUrls.small,
                mediumThumbnailUrl: f.thumbnailUrls.medium,
                hdUrl: f.thumbnailUrls.hd,
                originalUrl: f.thumbnailUrls.original,
                thumbnailUrl: f.thumbnailUrls.medium,
                fullUrl: f.thumbnailUrls.hd,
                isVideo: f.isVideo,
                videoUrl: f.videoPreviewUrl,
                duration: f.duration,
                resolution: f.resolution,
                order: i + 1,
                isDeleted: false,
                createdDate: f.createdDate || new Date().toISOString(),
                modifiedDate: f.modifiedDate || new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          }
        } catch (err: any) {
          failedFiles++;
          errorMessages.push(`Folder ${evt.title}: ${err.message}`);
        }
      }

      // STEP 3: Check for removed files (Files in Firestore that no longer exist in Drive)
      existingMedia.forEach(m => {
        if (!currentScannedFileIds.has(m.driveFileId) && !m.isDeleted) {
          filesRemoved++;
          newMediaBatch.push({
            ...m,
            isDeleted: true,
            updatedAt: new Date().toISOString()
          });
        }
      });

      // STEP 4: Updating Firestore
      updateProgress('updating_firestore', `Saving metadata for ${newMediaBatch.length} items to database...`, 80, totalScanned, filesAdded, filesUpdated, filesRemoved);

      if (newMediaBatch.length > 0) {
        await saveMediaBatch(newMediaBatch);
      }

      // Update project status & last sync stats
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      const lastSyncStats = {
        added: filesAdded,
        updated: filesUpdated,
        removed: filesRemoved,
        failed: failedFiles,
        durationMs
      };

      await updateProject(project.id, {
        lastSync: new Date().toISOString(),
        syncStatus: 'completed',
        lastSyncStats,
        totalPhotos: (project.totalPhotos || 0) + filesAdded,
        totalVideos: (project.totalVideos || 0) + (newMediaBatch.filter(m => m.isVideo).length)
      });

      // Also update event folder lastSync
      for (const evt of eventsToScan) {
        await updateEventFolder(evt.id, { lastSync: new Date().toISOString() });
      }

      const log: SyncLog = {
        id: `synclog-${Date.now()}`,
        projectId: project.id,
        eventId: targetEventId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        durationMs,
        filesAdded,
        filesUpdated,
        filesDeleted: filesRemoved,
        failedFiles,
        errorMessages: errorMessages.length > 0 ? errorMessages : undefined,
        status: failedFiles > 0 && filesAdded === 0 ? 'failed' : 'completed'
      };

      await saveSyncLog(log);

      updateProgress('completed', `Synchronization completed in ${(durationMs / 1000).toFixed(1)}s`, 100, totalScanned, filesAdded, filesUpdated, filesRemoved);

      return log;
    } catch (err: any) {
      console.error("SyncEngine error:", err);
      const endTime = Date.now();
      const log: SyncLog = {
        id: `synclog-${Date.now()}`,
        projectId: project.id,
        eventId: targetEventId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        durationMs: endTime - startTime,
        filesAdded,
        filesUpdated,
        filesDeleted: filesRemoved,
        failedFiles: failedFiles + 1,
        errorMessages: [err.message || "Unknown synchronization error"],
        status: 'failed'
      };

      await saveSyncLog(log);
      await updateProject(project.id, { syncStatus: 'failed' });

      updateProgress('failed', `Sync failed: ${err.message}`, 0);
      throw err;
    } finally {
      this.activeSyncs.delete(syncKey);
    }
  }
}

export const syncEngine = new SyncEngine();
