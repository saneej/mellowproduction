export const APP_CONFIG = {
  name: "Mellow Production",
  subtitle: "Video Production & High-Resolution Client Photo Galleries",
  version: "2.4.0",
  developer: "saneejified",
  developerUrl: "https://instagram.com/heysaneej",
  supportEmail: "support@mellowproduction.com",
};

export const DEFAULT_THEME = {
  mode: "dark",
  brandColor: "red",
  primaryColor: "#B90003",
};

export const EVENT_CATEGORIES = [
  { id: "wedding", label: "Wedding & Marriage" },
  { id: "engagement", label: "Engagement & Pre-wedding" },
  { id: "corporate", label: "Corporate & Brand Ads" },
  { id: "event", label: "Live Event & Concert" },
  { id: "commercial", label: "Commercial & TVC" },
] as const;

export const SORT_OPTIONS = [
  { id: "manual", label: "Custom Order" },
  { id: "date_created", label: "Capture Date" },
  { id: "file_name", label: "File Name" },
  { id: "file_size", label: "File Size" },
] as const;

export const STORAGE_PROVIDERS = {
  GOOGLE_DRIVE: "drive",
  AWS_S3: "s3",
  CLOUDFLARE_R2: "r2",
  DROPBOX: "dropbox",
} as const;

export const DEFAULT_CLIENT_PERMISSIONS = {
  canView: true,
  canDownload: true,
  canFavorite: true,
  downloadOriginalQuality: true,
  downloadZip: true,
};
