export type EventCategory = string;

export type UserRole = 'owner' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  addedBy?: string;
  addedAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export type ProjectStatus = 'active' | 'hidden' | 'password_protected' | 'archived' | 'syncing' | 'sync_error';

export interface CoverMedia {
  type: 'image' | 'video';
  url: string;
  source?: 'gdrive' | 'cloudinary' | 'bunny' | 'vimeo' | 'youtube' | 'direct';
  posterUrl?: string;
}

export interface AccessCode {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  expirationDate?: string;
  maxUses?: number;
  usedCount?: number;
  notes?: string;
  permissions: {
    canView: boolean;
    canDownload: boolean;
    canFavorite: boolean;
    canViewHiddenEvents?: boolean;
    downloadOriginalQuality?: boolean;
    downloadZip?: boolean;
  };
}

export interface DriveFolderConfig {
  id: string;
  name: string;
  driveFolderId: string;
  apiKey?: string;
  driveAccountId?: string;
  status?: 'connected' | 'error' | 'syncing' | 'untested';
  fileCount?: number;
  lastSync?: string;
  folderPath?: string;
  coverImage?: string;
}

export type AutoSyncSchedule = 'disabled' | '1h' | '6h' | '12h' | '24h';

export interface SyncLog {
  id: string;
  projectId: string;
  eventId?: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  filesAdded: number;
  filesUpdated: number;
  filesDeleted: number;
  failedFiles: number;
  errorMessages?: string[];
  status: 'completed' | 'failed' | 'partial';
}

export interface LandingPageConfig {
  heroStyle?: 'classic_editorial' | 'split_hero' | 'dark_luxury' | 'romantic_card' | 'minimal_nordic';
  showBrideGroom?: boolean;
  brideName?: string;
  groomName?: string;
  hashtag?: string;
  welcomeMessage?: string;
  quoteText?: string;
  cursiveFont?: string;
  accentColor?: string;
  showCountdown?: boolean;
  eventDateText?: string;
  locationText?: string;
  showHashtagBadge?: boolean;
  heroOverlayOpacity?: number;
  bannerImage?: string;
  subEventLayout?: 'grid' | 'cards' | 'carousel' | 'minimal_list';
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  clientEmail?: string;
  groomName?: string;
  brideName?: string;
  hashtag?: string;
  category?: string;
  date: string; // ISO string YYYY-MM-DD
  coverImage: string;
  coverImages?: string[];
  coverMedia?: CoverMedia;
  isPinProtected: boolean;
  pin?: string;
  isPublished: boolean;
  isArchived?: boolean;
  status?: ProjectStatus;
  eventCount: number;
  driveAccountId?: string;
  driveFolders?: DriveFolderConfig[];
  accessCodes?: AccessCode[];
  layout?: 'grid' | 'masonry' | 'timeline' | 'justified' | 'carousel' | 'collage';
  theme?: 'classic_editorial' | 'dark_luxury' | 'earthy_sand' | 'clean_nordic' | 'vintage_warmth' | 'modern_minimalist' | 'romantic_blush' | 'mellowwedding' | 'mellow_wedding';
  titleFontFamily?: string;
  customTitleFontUrl?: string;
  customTitleFontName?: string;
  landingPageConfig?: LandingPageConfig;
  progressiveLoading?: boolean;
  defaultEventId?: string;
  allowClientDownloads?: boolean;
  allowClientFavorites?: boolean;
  syncSchedule?: AutoSyncSchedule;
  syncStatus?: 'syncing' | 'completed' | 'failed' | 'pending';
  lastSyncStats?: {
    added: number;
    updated: number;
    removed: number;
    failed: number;
    durationMs: number;
  };
  viewsCount?: number;
  downloadsCount?: number;
  favoritesCount?: number;
  totalPhotos?: number;
  totalVideos?: number;
  createdAt: string;
  updatedAt: string;
  lastSync?: string;
  isSynced?: boolean;
}

export interface EventFolder {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  coverImage: string;
  driveFolderId: string;
  driveAccountId?: string;
  order: number;
  isPublished: boolean;
  isPinProtected?: boolean;
  pin?: string;
  parentId?: string | null; // For nested sub-folders
  mediaCount?: number;
  lastSync?: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  projectId: string;
  eventId: string;
  driveFileId: string;
  driveAccountId?: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  width?: number;
  height?: number;
  // Multi-tier thumbnail URLs
  tinyThumbnailUrl?: string;   // ~50-100px blur placeholder
  smallThumbnailUrl?: string;  // ~400px gallery grid
  mediumThumbnailUrl?: string; // ~800px modal preview
  hdUrl?: string;              // ~1600-2048px preview
  originalUrl?: string;        // original download
  thumbnailUrl: string;        // fallback/default grid URL
  fullUrl: string;             // fallback/default preview URL
  isVideo: boolean;
  videoUrl?: string;
  duration?: string;           // formatted e.g. "02:45"
  resolution?: string;         // e.g. "1080p", "4K"
  order: number;
  isDeleted?: boolean;         // marked deleted if missing in Drive, so can restore
  createdDate?: string;
  modifiedDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FavoriteSelection {
  id: string;
  projectId: string;
  eventId: string;
  clientName: string;
  clientEmail: string;
  selectedMediaIds: string[];
  selectedFileNames: string[];
  notes?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'LOGIN' | 'SYNC' | 'VIEW' | 'FAVORITE' | 'DOWNLOAD' | 'CREATE_PROJECT' | 'UPDATE_PROJECT' | 'DELETE_PROJECT' | 'MANAGE_ADMIN';
  description: string;
  timestamp: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface DriveAccount {
  id: string;
  email: string;
  name: string;
  apiKey?: string;
  projectCount: number;
  folderCount?: number;
  status: 'connected' | 'disconnected' | 'error' | 'disabled';
  connectionHealth?: 'healthy' | 'degraded' | 'error';
  lastSync: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface DownloadLog {
  id: string;
  projectId: string;
  projectTitle: string;
  fileName: string;
  downloadTime: string;
  downloadType: 'single' | 'zip';
  userSession?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface AdminSettings {
  brandTitle: string;
  websiteLogoUrl?: string;
  faviconUrl?: string;
  googleDriveApiKey?: string;
  defaultPin?: string;
  allowedAdminEmails: string[];
  allowClientDownloads: boolean;
  allowClientFavorites: boolean;
  theme: 'dark' | 'light' | 'system';
  primaryColor: string;
  accentColor: string;
  sessionTimeoutMinutes: number;
  autoSyncDrive: boolean;
  syncIntervalHours: number;
}

