import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  Project, 
  EventFolder, 
  MediaItem, 
  FavoriteSelection, 
  ActivityLog, 
  AdminSettings,
  AdminUser,
  UserRole,
  DriveAccount,
  DownloadLog,
  AdminNotification,
  SyncLog
} from "../types/gallery";

// Collection Names
const PROJECTS_COL = "projects";
const EVENTS_COL = "events";
const MEDIA_COL = "media";
const FAVORITES_COL = "favorites";
const LOGS_COL = "activity_logs";
const SETTINGS_COL = "settings";
const ADMINS_COL = "admin_users";
const DRIVE_ACCOUNTS_COL = "drive_accounts";
const DOWNLOADS_COL = "download_logs";
const NOTIFICATIONS_COL = "notifications";

// Initial Admin Users
const INITIAL_ADMINS: AdminUser[] = [
  {
    id: "admin-saneej",
    email: "msaneejk4@gmail.com",
    name: "Saneej (Owner)",
    role: "owner",
    addedBy: "System",
    addedAt: new Date("2026-01-01").toISOString()
  }
];

// Initial Drive Accounts
const INITIAL_DRIVE_ACCOUNTS: DriveAccount[] = [
  {
    id: "drive-main",
    email: "mellowproduction.drive@gmail.com",
    name: "Mellow Primary Workspace",
    projectCount: 3,
    status: "connected",
    lastSync: new Date().toISOString(),
    isDefault: true
  }
];

// Initial Notifications
const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif-1",
    title: "System Initialized",
    message: "Mellow Production Admin Workspace active with Firestore and Google Drive Integration.",
    type: "info",
    timestamp: new Date().toISOString(),
    isRead: false
  },
  {
    id: "notif-2",
    title: "Google Drive Connected",
    message: "Drive account mellowproduction.drive@gmail.com connected successfully.",
    type: "success",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    isRead: true
  }
];

// Initial Settings
const INITIAL_SETTINGS: AdminSettings = {
  brandTitle: "Mellow Production",
  websiteLogoUrl: "https://i.postimg.cc/j250f7G7/logo-white.png",
  allowedAdminEmails: ["msaneejk4@gmail.com"],
  allowClientDownloads: true,
  allowClientFavorites: true,
  theme: "dark",
  primaryColor: "#B90003",
  accentColor: "#FFFFFF",
  sessionTimeoutMinutes: 120,
  autoSyncDrive: true,
  syncIntervalHours: 6
};

// Local In-Memory Fallback Cache
let localAdminsState = [...INITIAL_ADMINS];
let localDriveAccountsState = [...INITIAL_DRIVE_ACCOUNTS];
let localDownloadsState: DownloadLog[] = [];
let localNotificationsState = [...INITIAL_NOTIFICATIONS];
let localSettingsState = { ...INITIAL_SETTINGS };


// --- Sample Seed Data for immediate demonstration ---
const SAMPLE_PROJECTS: Project[] = [
  {
    id: "proj-ahmed-amina",
    title: "Ahmed & Amina Wedding",
    slug: "ahmed-amina",
    clientName: "Ahmed & Amina",
    clientEmail: "ahmed.amina@example.com",
    category: "wedding",
    date: "2026-03-15",
    coverImage: "1y8O84iZ7G3I3Z-kE8B_eH3_N2p6XqR7m", // Drive ID or URL
    isPinProtected: true,
    pin: "2026",
    isPublished: true,
    eventCount: 3,
    createdAt: new Date("2026-03-16").toISOString(),
    updatedAt: new Date("2026-03-16").toISOString(),
  },
  {
    id: "proj-rahul-priya",
    title: "Rahul & Priya Engagement",
    slug: "rahul-priya",
    clientName: "Rahul & Priya",
    clientEmail: "rahul.priya@example.com",
    category: "engagement",
    date: "2026-02-20",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    isPinProtected: false,
    isPublished: true,
    eventCount: 1,
    createdAt: new Date("2026-02-21").toISOString(),
    updatedAt: new Date("2026-02-21").toISOString(),
  },
  {
    id: "proj-tech-summit-2026",
    title: "Kerala Tech Leadership Summit",
    slug: "tech-summit-2026",
    clientName: "Kerala Tech Forum",
    clientEmail: "events@keralatech.org",
    category: "corporate",
    date: "2026-01-10",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    isPinProtected: false,
    isPublished: true,
    eventCount: 2,
    createdAt: new Date("2026-01-11").toISOString(),
    updatedAt: new Date("2026-01-11").toISOString(),
  }
];

const SAMPLE_EVENTS: EventFolder[] = [
  // Ahmed & Amina Sub-events
  {
    id: "event-ahmed-nikah",
    projectId: "proj-ahmed-amina",
    title: "Nikah Ceremony",
    slug: "nikah",
    coverImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    driveFolderId: "1A2B3C_NIKAH_DRIVE_FOLDER",
    order: 1,
    isPublished: true,
    isPinProtected: false,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "event-ahmed-reception",
    projectId: "proj-ahmed-amina",
    title: "Grand Reception",
    slug: "reception",
    coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    driveFolderId: "1A2B3C_RECEPTION_DRIVE_FOLDER",
    order: 2,
    isPublished: true,
    isPinProtected: false,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "event-ahmed-outdoor",
    projectId: "proj-ahmed-amina",
    title: "Sunset Outdoor Shoot",
    slug: "outdoor",
    coverImage: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80",
    driveFolderId: "1A2B3C_OUTDOOR_DRIVE_FOLDER",
    order: 3,
    isPublished: true,
    isPinProtected: false,
    createdAt: new Date("2026-03-16").toISOString()
  },
  // Rahul & Priya Single Event
  {
    id: "event-rahul-main",
    projectId: "proj-rahul-priya",
    title: "Engagement Ceremony",
    slug: "engagement-ceremony",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    driveFolderId: "1A2B3C_RAHUL_DRIVE_FOLDER",
    order: 1,
    isPublished: true,
    isPinProtected: false,
    createdAt: new Date("2026-02-21").toISOString()
  }
];

const SAMPLE_MEDIA: MediaItem[] = [
  // Nikah Photos
  {
    id: "media-nikah-1",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-nikah",
    driveFileId: "1YhQ2qS0-SamplePhoto1",
    fileName: "Mellow_Nikah_001.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 1,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "media-nikah-2",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-nikah",
    driveFileId: "1YhQ2qS0-SamplePhoto2",
    fileName: "Mellow_Nikah_002.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 2,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "media-nikah-3",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-nikah",
    driveFileId: "1YhQ2qS0-SamplePhoto3",
    fileName: "Mellow_Nikah_003.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 3,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "media-nikah-4",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-nikah",
    driveFileId: "1YhQ2qS0-SamplePhoto4",
    fileName: "Mellow_Nikah_004.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 4,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "media-nikah-5",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-nikah",
    driveFileId: "1YhQ2qS0-SampleVideo1",
    fileName: "Mellow_Nikah_Highlight.mp4",
    mimeType: "video/mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=2400&q=90",
    isVideo: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "02:45",
    order: 5,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "media-nikah-6",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-nikah",
    driveFileId: "1YhQ2qS0-SamplePhoto5",
    fileName: "Mellow_Nikah_005.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 6,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "media-nikah-7",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-nikah",
    driveFileId: "1YhQ2qS0-SamplePhoto6",
    fileName: "Mellow_Nikah_006.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 7,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "media-nikah-8",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-nikah",
    driveFileId: "1YhQ2qS0-SamplePhoto7",
    fileName: "Mellow_Nikah_007.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 8,
    createdAt: new Date("2026-03-16").toISOString()
  },

  // Reception Photos
  {
    id: "media-reception-1",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-reception",
    driveFileId: "1YhQ2qS0-Reception1",
    fileName: "Mellow_Reception_001.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 1,
    createdAt: new Date("2026-03-16").toISOString()
  },
  {
    id: "media-reception-2",
    projectId: "proj-ahmed-amina",
    eventId: "event-ahmed-reception",
    driveFileId: "1YhQ2qS0-Reception2",
    fileName: "Mellow_Reception_002.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 2,
    createdAt: new Date("2026-03-16").toISOString()
  },

  // Rahul Engagement Photos
  {
    id: "media-rahul-1",
    projectId: "proj-rahul-priya",
    eventId: "event-rahul-main",
    driveFileId: "1YhQ2qS0-Rahul1",
    fileName: "Rahul_Priya_001.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 1,
    createdAt: new Date("2026-02-21").toISOString()
  },
  {
    id: "media-rahul-2",
    projectId: "proj-rahul-priya",
    eventId: "event-rahul-main",
    driveFileId: "1YhQ2qS0-Rahul2",
    fileName: "Rahul_Priya_002.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    fullUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2400&q=90",
    isVideo: false,
    order: 2,
    createdAt: new Date("2026-02-21").toISOString()
  }
];

// In-Memory cache fallback for instant rendering if Firestore query is loading or cold
let localProjectsState = [...SAMPLE_PROJECTS];
let localEventsState = [...SAMPLE_EVENTS];
let localMediaState = [...SAMPLE_MEDIA];
let localFavoritesState: FavoriteSelection[] = [];
let localLogsState: ActivityLog[] = [
  {
    id: "log-1",
    type: "LOGIN",
    description: "Admin logged into Mellow Production Dashboard",
    timestamp: new Date().toISOString(),
    userEmail: "msaneejk4@gmail.com"
  },
  {
    id: "log-2",
    type: "SYNC",
    description: "Synced Google Drive folder for Ahmed & Amina Nikah",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userEmail: "msaneejk4@gmail.com"
  }
];

// --- Database API Service Functions ---

export const getProjects = async (): Promise<Project[]> => {
  try {
    const colRef = collection(db, PROJECTS_COL);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Seed sample data to Firestore in background
      seedInitialData();
      return localProjectsState;
    }
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    localProjectsState = docs;
    return docs;
  } catch (err) {
    console.warn("Firestore fetch projects fallback to memory:", err);
    return localProjectsState;
  }
};

export const getProjectBySlug = async (slug: string): Promise<Project | null> => {
  try {
    const colRef = collection(db, PROJECTS_COL);
    const q = query(colRef, where("slug", "==", slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0];
      return { id: docData.id, ...docData.data() } as Project;
    }
    // Fallback to local
    return localProjectsState.find(p => p.slug === slug) || null;
  } catch (err) {
    console.warn("Firestore error, fallback slug match:", err);
    return localProjectsState.find(p => p.slug === slug) || null;
  }
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, PROJECTS_COL, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Project;
    }
    return localProjectsState.find(p => p.id === id) || null;
  } catch (err) {
    return localProjectsState.find(p => p.id === id) || null;
  }
};

export const createProject = async (projectData: Partial<Project> & { title: string; clientName: string; slug: string }): Promise<Project> => {
  const now = new Date().toISOString();
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    title: projectData.title,
    clientName: projectData.clientName,
    slug: projectData.slug,
    category: projectData.category || "wedding",
    date: projectData.date || now.split("T")[0],
    coverImage: projectData.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600",
    isPinProtected: projectData.isPinProtected || false,
    isPublished: projectData.isPublished ?? true,
    eventCount: projectData.eventCount || 1,
    viewsCount: projectData.viewsCount || 0,
    downloadsCount: projectData.downloadsCount || 0,
    favoritesCount: projectData.favoritesCount || 0,
    ...projectData,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const colRef = collection(db, PROJECTS_COL);
    const docRef = await addDoc(colRef, {
      ...projectData,
      createdAt: now,
      updatedAt: now,
    });
    newProject.id = docRef.id;
  } catch (err) {
    console.warn("Saving project locally due to Firestore error:", err);
  }

  localProjectsState.unshift(newProject);
  logActivity("CREATE_PROJECT", `Created new project: ${newProject.title}`, { projectId: newProject.id });
  return newProject;
};

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<void> => {
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, PROJECTS_COL, id);
    await updateDoc(docRef, { ...projectData, updatedAt: now });
  } catch (err) {
    console.warn("Updating project locally:", err);
  }

  localProjectsState = localProjectsState.map(p => p.id === id ? { ...p, ...projectData, updatedAt: now } : p);
  logActivity("UPDATE_PROJECT", `Updated project ID: ${id}`, { projectId: id });
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PROJECTS_COL, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Deleting project locally:", err);
  }

  localProjectsState = localProjectsState.filter(p => p.id !== id);
  localEventsState = localEventsState.filter(e => e.projectId !== id);
  localMediaState = localMediaState.filter(m => m.projectId !== id);
  logActivity("DELETE_PROJECT", `Deleted project ID: ${id}`);
};

// --- Events Functions ---

export const getEventsByProject = async (projectId: string): Promise<EventFolder[]> => {
  try {
    const colRef = collection(db, EVENTS_COL);
    const q = query(colRef, where("projectId", "==", projectId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventFolder));
      return docs.sort((a, b) => a.order - b.order);
    }
  } catch (err) {
    console.warn("Firestore fetch events fallback:", err);
  }
  return localEventsState.filter(e => e.projectId === projectId).sort((a, b) => a.order - b.order);
};

export const getEventFolders = getEventsByProject;

export const updateEventFolder = async (id: string, updates: Partial<EventFolder>): Promise<void> => {
  try {
    await updateDoc(doc(db, EVENTS_COL, id), updates as any);
  } catch (err) {
    console.warn("Update event folder fallback:", err);
  }
  localEventsState = localEventsState.map(e => e.id === id ? { ...e, ...updates } : e);
};

export const getEventBySlug = async (projectId: string, eventSlug: string): Promise<EventFolder | null> => {
  try {
    const colRef = collection(db, EVENTS_COL);
    const q = query(colRef, where("projectId", "==", projectId), where("slug", "==", eventSlug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as EventFolder;
    }
  } catch (err) {
    console.warn("Firestore error event slug match:", err);
  }
  return localEventsState.find(e => e.projectId === projectId && e.slug === eventSlug) || null;
};

export const createEvent = async (eventData: Omit<EventFolder, "id" | "createdAt">): Promise<EventFolder> => {
  const now = new Date().toISOString();
  const newEvent: EventFolder = {
    id: `event-${Date.now()}`,
    ...eventData,
    createdAt: now
  };

  try {
    const colRef = collection(db, EVENTS_COL);
    const docRef = await addDoc(colRef, { ...eventData, createdAt: now });
    newEvent.id = docRef.id;
  } catch (err) {
    console.warn("Creating event locally:", err);
  }

  localEventsState.push(newEvent);
  return newEvent;
};

export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, EVENTS_COL, id));
  } catch (err) {
    console.warn("Deleting event locally:", err);
  }
  localEventsState = localEventsState.filter(e => e.id !== id);
  localMediaState = localMediaState.filter(m => m.eventId !== id);
};

// --- Media Items Functions ---

export const getMediaByEvent = async (eventId: string, includeDeleted = false): Promise<MediaItem[]> => {
  try {
    const colRef = collection(db, MEDIA_COL);
    const q = query(colRef, where("eventId", "==", eventId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
      const filtered = includeDeleted ? docs : docs.filter(m => !m.isDeleted);
      return filtered.sort((a, b) => a.order - b.order);
    }
  } catch (err) {
    console.warn("Firestore fetch media fallback:", err);
  }
  const filtered = includeDeleted ? localMediaState.filter(m => m.eventId === eventId) : localMediaState.filter(m => m.eventId === eventId && !m.isDeleted);
  return filtered.sort((a, b) => a.order - b.order);
};

export const getMediaByProject = async (projectId: string, includeDeleted = false): Promise<MediaItem[]> => {
  try {
    const colRef = collection(db, MEDIA_COL);
    const q = query(colRef, where("projectId", "==", projectId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
      const filtered = includeDeleted ? docs : docs.filter(m => !m.isDeleted);
      return filtered.sort((a, b) => a.order - b.order);
    }
  } catch (err) {
    console.warn("Firestore fetch media by project fallback:", err);
  }
  const filtered = includeDeleted ? localMediaState.filter(m => m.projectId === projectId) : localMediaState.filter(m => m.projectId === projectId && !m.isDeleted);
  return filtered.sort((a, b) => a.order - b.order);
};

export const searchMediaIndex = async (
  projectId: string, 
  searchTerm: string, 
  filterType: 'all' | 'image' | 'video' = 'all'
): Promise<MediaItem[]> => {
  const allMedia = await getMediaByProject(projectId);
  if (!searchTerm.trim() && filterType === 'all') return allMedia;

  const term = searchTerm.toLowerCase().trim();
  return allMedia.filter(m => {
    const matchesTerm = !term || 
      m.fileName.toLowerCase().includes(term) ||
      m.eventId.toLowerCase().includes(term) ||
      m.driveFileId.toLowerCase().includes(term);

    const matchesType = filterType === 'all' || 
      (filterType === 'video' && m.isVideo) || 
      (filterType === 'image' && !m.isVideo);

    return matchesTerm && matchesType;
  });
};

export const getSortedMedia = (
  media: MediaItem[], 
  sortBy: 'date_created' | 'date_modified' | 'file_name' | 'file_size' | 'manual' = 'manual',
  sortOrder: 'asc' | 'desc' = 'asc'
): MediaItem[] => {
  const sorted = [...media];
  sorted.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date_created') {
      comparison = new Date(a.createdDate || a.createdAt).getTime() - new Date(b.createdDate || b.createdAt).getTime();
    } else if (sortBy === 'date_modified') {
      comparison = new Date(a.modifiedDate || a.createdAt).getTime() - new Date(b.modifiedDate || b.createdAt).getTime();
    } else if (sortBy === 'file_name') {
      comparison = a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' });
    } else if (sortBy === 'file_size') {
      comparison = (a.fileSize || 0) - (b.fileSize || 0);
    } else {
      comparison = a.order - b.order;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  return sorted;
};

export const saveMediaBatch = async (items: Omit<MediaItem, "id" | "createdAt">[]): Promise<MediaItem[]> => {
  const now = new Date().toISOString();
  const createdItems: MediaItem[] = [];

  try {
    const batch = writeBatch(db);
    for (const item of items) {
      const docRef = doc(collection(db, MEDIA_COL));
      const newItem: MediaItem = {
        id: docRef.id,
        ...item,
        createdAt: now,
      };
      batch.set(docRef, { ...item, createdAt: now });
      createdItems.push(newItem);
    }
    await batch.commit();
  } catch (err) {
    console.warn("Saving media locally due to Firestore batch error:", err);
    items.forEach((item, idx) => {
      createdItems.push({
        id: `media-${Date.now()}-${idx}`,
        ...item,
        createdAt: now
      });
    });
  }

  localMediaState.push(...createdItems);
  return createdItems;
};

export const deleteMedia = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, MEDIA_COL, id));
  } catch (err) {
    console.warn("Delete media local fallback:", err);
  }
  localMediaState = localMediaState.filter(m => m.id !== id);
};

// --- Client Favorites Selection Functions ---

export const saveFavorites = async (
  projectId: string, 
  eventId: string, 
  clientName: string, 
  clientEmail: string, 
  selectedMediaIds: string[],
  selectedFileNames: string[],
  notes?: string
): Promise<FavoriteSelection> => {
  const favObj: FavoriteSelection = {
    id: `fav-${Date.now()}`,
    projectId,
    eventId,
    clientName,
    clientEmail,
    selectedMediaIds,
    selectedFileNames,
    notes,
    createdAt: new Date().toISOString()
  };

  try {
    const colRef = collection(db, FAVORITES_COL);
    const docRef = await addDoc(colRef, favObj);
    favObj.id = docRef.id;
  } catch (err) {
    console.warn("Save favorites local fallback:", err);
  }

  localFavoritesState.unshift(favObj);
  logActivity("FAVORITE", `Client ${clientName} selected ${selectedMediaIds.length} favorites`, { projectId, eventId });
  return favObj;
};

export const getFavoritesByProject = async (projectId: string): Promise<FavoriteSelection[]> => {
  try {
    const colRef = collection(db, FAVORITES_COL);
    const q = query(colRef, where("projectId", "==", projectId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as FavoriteSelection));
    }
  } catch (err) {
    console.warn("Fetch favorites local fallback:", err);
  }
  return localFavoritesState.filter(f => f.projectId === projectId);
};

// --- Activity Logs ---

export const logActivity = async (
  type: ActivityLog["type"],
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  const logObj: ActivityLog = {
    id: `log-${Date.now()}`,
    type,
    description,
    timestamp: new Date().toISOString(),
    metadata
  };

  try {
    const colRef = collection(db, LOGS_COL);
    await addDoc(colRef, logObj);
  } catch (err) {
    // console.warn("Log activity error:", err);
  }
  localLogsState.unshift(logObj);
};

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  try {
    const colRef = collection(db, LOGS_COL);
    const q = query(colRef, orderBy("timestamp", "desc"), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog));
    }
  } catch (err) {
    // fallback
  }
  return localLogsState;
};

// --- Admin Users Management ---

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const colRef = collection(db, ADMINS_COL);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser));
      localAdminsState = docs;
      return docs;
    }
  } catch (err) {
    console.warn("Firestore fetch admins fallback:", err);
  }
  return localAdminsState;
};

export const addAdminUser = async (email: string, role: UserRole, addedBy: string = "Owner"): Promise<AdminUser> => {
  const cleanEmail = email.trim().toLowerCase();
  const newAdmin: AdminUser = {
    id: `admin-${Date.now()}`,
    email: cleanEmail,
    role,
    addedBy,
    addedAt: new Date().toISOString()
  };

  try {
    const colRef = collection(db, ADMINS_COL);
    const docRef = await addDoc(colRef, newAdmin);
    newAdmin.id = docRef.id;
  } catch (err) {
    console.warn("Add admin user local fallback:", err);
  }

  // Ensure email is not duplicated in local list
  localAdminsState = localAdminsState.filter(a => a.email.toLowerCase() !== cleanEmail);
  localAdminsState.push(newAdmin);

  // Update allowed admin emails list in local settings state
  if (!localSettingsState.allowedAdminEmails.includes(cleanEmail)) {
    localSettingsState.allowedAdminEmails.push(cleanEmail);
  }

  logActivity("MANAGE_ADMIN", `Added new admin email: ${cleanEmail} with role: ${role}`, { email: cleanEmail, role });
  addNotification("Admin Added", `New admin account ${cleanEmail} assigned role ${role.toUpperCase()}`, "info");

  return newAdmin;
};

export const updateAdminRole = async (id: string, role: UserRole): Promise<void> => {
  try {
    const docRef = doc(db, ADMINS_COL, id);
    await updateDoc(docRef, { role });
  } catch (err) {
    console.warn("Update admin role local fallback:", err);
  }
  localAdminsState = localAdminsState.map(a => a.id === id ? { ...a, role } : a);
  logActivity("MANAGE_ADMIN", `Updated admin role ID ${id} to ${role}`);
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  const target = localAdminsState.find(a => a.id === id);
  try {
    await deleteDoc(doc(db, ADMINS_COL, id));
  } catch (err) {
    console.warn("Delete admin user local fallback:", err);
  }
  localAdminsState = localAdminsState.filter(a => a.id !== id);
  if (target) {
    localSettingsState.allowedAdminEmails = localSettingsState.allowedAdminEmails.filter(e => e.toLowerCase() !== target.email.toLowerCase());
    logActivity("MANAGE_ADMIN", `Revoked admin access for: ${target.email}`);
    addNotification("Admin Removed", `Revoked admin permissions for ${target.email}`, "warning");
  }
};

// --- Google Drive Accounts ---

export const getDriveAccounts = async (): Promise<DriveAccount[]> => {
  try {
    const colRef = collection(db, DRIVE_ACCOUNTS_COL);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriveAccount));
    }
  } catch (err) {
    console.warn("Firestore drive accounts fallback:", err);
  }
  return localDriveAccountsState;
};

export const addDriveAccount = async (email: string, name: string): Promise<DriveAccount> => {
  const newAccount: DriveAccount = {
    id: `drive-${Date.now()}`,
    email,
    name,
    projectCount: 0,
    status: "connected",
    lastSync: new Date().toISOString()
  };

  try {
    const colRef = collection(db, DRIVE_ACCOUNTS_COL);
    const docRef = await addDoc(colRef, newAccount);
    newAccount.id = docRef.id;
  } catch (err) {
    console.warn("Add drive account fallback:", err);
  }

  localDriveAccountsState.push(newAccount);
  logActivity("SYNC", `Connected Google Drive account: ${email}`);
  addNotification("Google Drive Connected", `New Drive account ${email} connected successfully.`, "success");
  return newAccount;
};

export const updateDriveAccount = async (id: string, updates: Partial<DriveAccount>): Promise<void> => {
  try {
    await updateDoc(doc(db, DRIVE_ACCOUNTS_COL, id), updates as any);
  } catch (err) {
    console.warn("Update drive account fallback:", err);
  }
  localDriveAccountsState = localDriveAccountsState.map(a => a.id === id ? { ...a, ...updates } : a);
};

export const deleteDriveAccount = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, DRIVE_ACCOUNTS_COL, id));
  } catch (err) {
    console.warn("Delete drive account local fallback:", err);
  }
  localDriveAccountsState = localDriveAccountsState.filter(a => a.id !== id);
};

// --- Sync Logs Management ---

let localSyncLogsState: SyncLog[] = [];

export const saveSyncLog = async (log: SyncLog): Promise<void> => {
  try {
    const colRef = collection(db, "syncLogs");
    await addDoc(colRef, log);
  } catch (err) {
    // local fallback
  }
  localSyncLogsState.unshift(log);
};

export const getSyncLogs = async (projectId?: string): Promise<SyncLog[]> => {
  try {
    const colRef = collection(db, "syncLogs");
    const q = projectId 
      ? query(colRef, where("projectId", "==", projectId), orderBy("startTime", "desc"), limit(50))
      : query(colRef, orderBy("startTime", "desc"), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SyncLog));
    }
  } catch (err) {
    // fallback
  }
  return projectId ? localSyncLogsState.filter(l => l.projectId === projectId) : localSyncLogsState;
};

// --- Download Tracking Logs ---

export const logDownload = async (
  projectId: string,
  projectTitle: string,
  fileName: string,
  downloadType: 'single' | 'zip'
): Promise<void> => {
  const downloadLog: DownloadLog = {
    id: `dl-${Date.now()}`,
    projectId,
    projectTitle,
    fileName,
    downloadTime: new Date().toISOString(),
    downloadType
  };

  try {
    const colRef = collection(db, DOWNLOADS_COL);
    await addDoc(colRef, downloadLog);
  } catch (err) {
    // local fallback
  }

  localDownloadsState.unshift(downloadLog);
  logActivity("DOWNLOAD", `Downloaded ${downloadType} asset: ${fileName} (${projectTitle})`);
};

export const getDownloadLogs = async (): Promise<DownloadLog[]> => {
  try {
    const colRef = collection(db, DOWNLOADS_COL);
    const q = query(colRef, orderBy("downloadTime", "desc"), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DownloadLog));
    }
  } catch (err) {
    // fallback
  }
  return localDownloadsState;
};

// --- Notifications Center ---

export const getNotifications = async (): Promise<AdminNotification[]> => {
  try {
    const colRef = collection(db, NOTIFICATIONS_COL);
    const q = query(colRef, orderBy("timestamp", "desc"), limit(30));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminNotification));
    }
  } catch (err) {
    // fallback
  }
  return localNotificationsState;
};

export const addNotification = async (title: string, message: string, type: AdminNotification['type']): Promise<void> => {
  const notif: AdminNotification = {
    id: `notif-${Date.now()}`,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    isRead: false
  };

  try {
    await addDoc(collection(db, NOTIFICATIONS_COL), notif);
  } catch {
    // fallback
  }
  localNotificationsState.unshift(notif);
};

export const markNotificationRead = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COL, id), { isRead: true });
  } catch {
    // fallback
  }
  localNotificationsState = localNotificationsState.map(n => n.id === id ? { ...n, isRead: true } : n);
};

// --- Admin Settings ---

export const getAdminSettings = async (): Promise<AdminSettings> => {
  try {
    const colRef = collection(db, SETTINGS_COL);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return { ...localSettingsState, ...snap.docs[0].data() } as AdminSettings;
    }
  } catch (err) {
    // fallback
  }
  return localSettingsState;
};

export const updateAdminSettings = async (settings: Partial<AdminSettings>): Promise<AdminSettings> => {
  try {
    const colRef = collection(db, SETTINGS_COL);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      await updateDoc(doc(db, SETTINGS_COL, snap.docs[0].id), settings);
    } else {
      await addDoc(colRef, { ...localSettingsState, ...settings });
    }
  } catch (err) {
    console.warn("Update settings fallback:", err);
  }

  localSettingsState = { ...localSettingsState, ...settings };
  logActivity("UPDATE_PROJECT", "Updated system settings");
  return localSettingsState;
};

// --- Part 3: Project Wizard & Management Helpers ---

export const checkSlugExists = async (slug: string, excludeProjectId?: string): Promise<boolean> => {
  try {
    const projects = await getProjects();
    return projects.some(p => p.slug === slug && p.id !== excludeProjectId);
  } catch {
    return localProjectsState.some(p => p.slug === slug && p.id !== excludeProjectId);
  }
};

export const cloneProject = async (projectId: string): Promise<Project | null> => {
  try {
    const original = await getProjectById(projectId);
    if (!original) return null;

    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newTitle = `${original.title} (Copy)`;

    const clonedData = {
      ...original,
      title: newTitle,
      clientName: original.clientName || "Client",
      slug: newSlug,
      viewsCount: 0,
      downloadsCount: 0,
      favoritesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    delete (clonedData as Record<string, unknown>).id;

    const newProject = await createProject(clonedData);

    // Clone events
    const events = await getEventsByProject(projectId);
    for (const evt of events) {
      const newEvtData = {
        ...evt,
        projectId: newProject.id,
        createdAt: new Date().toISOString(),
      };
      delete (newEvtData as Record<string, unknown>).id;
      await createEvent(newEvtData);
    }

    logActivity("CREATE_PROJECT", `Cloned project "${original.title}" as "${newTitle}"`);
    return newProject;
  } catch (err) {
    console.error("Failed to clone project:", err);
    return null;
  }
};

export const exportProjectJson = async (projectId: string): Promise<string> => {
  const project = await getProjectById(projectId);
  if (!project) throw new Error("Project not found");

  const events = await getEventsByProject(projectId);
  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    project,
    events,
  };

  return JSON.stringify(exportData, null, 2);
};

export const importProjectJson = async (jsonString: string): Promise<Project> => {
  const parsed = JSON.parse(jsonString);
  const projData: Partial<Project> = parsed.project || parsed;
  
  // Ensure unique slug
  let slug = projData.slug || "imported-project";
  let count = 1;
  while (await checkSlugExists(slug)) {
    slug = `${projData.slug || "imported-project"}-${count++}`;
  }

  const newProjData = {
    ...projData,
    title: projData.title ? `${projData.title} (Imported)` : "Imported Project",
    clientName: projData.clientName || "Imported Client",
    slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewsCount: 0,
    downloadsCount: 0,
    favoritesCount: 0,
  };
  delete (newProjData as Record<string, unknown>).id;

  const newProject = await createProject(newProjData);

  if (Array.isArray(parsed.events)) {
    for (const evt of parsed.events) {
      const newEvtData = {
        ...evt,
        projectId: newProject.id,
        createdAt: new Date().toISOString(),
      };
      delete (newEvtData as Record<string, unknown>).id;
      await createEvent(newEvtData);
    }
  }

  logActivity("CREATE_PROJECT", `Imported project "${newProject.title}" from JSON backup`);
  return newProject;
};

export const bulkProjectAction = async (
  projectIds: string[], 
  action: 'archive' | 'hide' | 'unhide' | 'delete' | 'sync'
): Promise<void> => {
  for (const id of projectIds) {
    if (action === 'archive') {
      await updateProject(id, { isArchived: true, status: 'archived' });
    } else if (action === 'hide') {
      await updateProject(id, { isPublished: false, status: 'hidden' });
    } else if (action === 'unhide') {
      await updateProject(id, { isPublished: true, status: 'active' });
    } else if (action === 'delete') {
      await deleteProject(id);
    } else if (action === 'sync') {
      await updateProject(id, { updatedAt: new Date().toISOString() });
    }
  }
  logActivity("UPDATE_PROJECT", `Bulk ${action} executed on ${projectIds.length} projects`);
};

// --- Seed initial data helper ---
const seedInitialData = async () => {
  try {
    for (const proj of SAMPLE_PROJECTS) {
      const docRef = doc(db, PROJECTS_COL, proj.id);
      await updateDoc(docRef, proj as unknown as Record<string, unknown>).catch(() => {});
    }
  } catch {
    // ignore
  }
};

