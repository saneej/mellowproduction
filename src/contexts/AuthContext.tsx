import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { logActivity, getAdminUsers } from "../services/dbService";
import { UserRole, AdminUser } from "../types/gallery";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  role: UserRole | null;
  adminProfile: AdminUser | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  // Role Permission checks
  canManageAdmins: boolean;
  canChangeSettings: boolean;
  canDeleteProjects: boolean;
  canViewAnalytics: boolean;
  canManageDrive: boolean;
  canEditProjects: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  role: null,
  adminProfile: null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  logout: async () => {},
  canManageAdmins: false,
  canChangeSettings: false,
  canDeleteProjects: false,
  canViewAnalytics: false,
  canManageDrive: false,
  canEditProjects: false,
  authError: null,
  clearAuthError: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAdminAuthorization = async (currentUser: User): Promise<boolean> => {
    const userEmail = currentUser.email?.toLowerCase().trim() || "";
    
    // Primary Owner bypass (always authorized as owner)
    if (userEmail === "msaneejk4@gmail.com") {
      setIsAdmin(true);
      setRole("owner");
      setAdminProfile({
        id: "admin-owner-saneej",
        email: userEmail,
        name: currentUser.displayName || "Saneej (Owner)",
        role: "owner",
        addedAt: new Date().toISOString(),
        avatarUrl: currentUser.photoURL || undefined
      });
      return true;
    }

    // Fetch allowed admins from Firestore / Service
    const adminUsers = await getAdminUsers();
    const matchedAdmin = adminUsers.find(a => a.email.toLowerCase() === userEmail);

    if (matchedAdmin) {
      setIsAdmin(true);
      setRole(matchedAdmin.role);
      setAdminProfile({
        ...matchedAdmin,
        name: currentUser.displayName || matchedAdmin.name || userEmail.split("@")[0],
        avatarUrl: currentUser.photoURL || matchedAdmin.avatarUrl
      });
      return true;
    }

    // Default: Check if email ends with admin domain or fallback for newly added admins
    setIsAdmin(false);
    setRole(null);
    setAdminProfile(null);
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const authorized = await checkAdminAuthorization(currentUser);
        if (!authorized) {
          setAuthError(`Access Denied: Email (${currentUser.email}) is not authorized as a Mellow Production Admin. Contact the workspace owner to add your account.`);
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
          setRole(null);
        } else {
          setAuthError(null);
        }
      } else {
        setIsAdmin(false);
        setRole(null);
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const authorized = await checkAdminAuthorization(res.user);
      if (!authorized) {
        setAuthError(`Access Denied: ${res.user.email} is not registered in Mellow Admin Users. Contact Saneej (Owner) to grant access.`);
        await signOut(auth);
        setUser(null);
        setIsAdmin(false);
        setRole(null);
        throw new Error("Unauthorized admin email address.");
      }
      setUser(res.user);
      logActivity("LOGIN", `Admin signed in with Google: ${res.user.email}`, { email: res.user.email });
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (!authError && err.message) setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const authorized = await checkAdminAuthorization(res.user);
      if (!authorized) {
        setAuthError(`Access Denied: ${res.user.email} is not registered as an Admin.`);
        await signOut(auth);
        setUser(null);
        setIsAdmin(false);
        setRole(null);
        throw new Error("Unauthorized admin email.");
      }
      setUser(res.user);
      logActivity("LOGIN", `Admin signed in with Email: ${email}`, { email });
    } catch (err: any) {
      console.error("Email Sign-In Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    setRole(null);
    setAdminProfile(null);
  };

  // Granular RBAC Permissions
  const canManageAdmins = role === "owner";
  const canChangeSettings = role === "owner";
  const canDeleteProjects = role === "owner" || role === "admin";
  const canViewAnalytics = role === "owner" || role === "admin";
  const canManageDrive = role === "owner" || role === "admin";
  const canEditProjects = role === "owner" || role === "admin" || role === "editor";

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      role, 
      adminProfile, 
      signInWithGoogle, 
      signInWithEmail, 
      logout,
      canManageAdmins,
      canChangeSettings,
      canDeleteProjects,
      canViewAnalytics,
      canManageDrive,
      canEditProjects,
      authError,
      clearAuthError: () => setAuthError(null)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

