'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { account } from "../appwrite/appwrite";
import { Models } from "appwrite";
import { useRouter } from "next/navigation";


export interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  login: (
    email: string,
    password: string
  ) => Promise<Models.User<Models.Preferences> | null>;
  logout: () => Promise<void>;
  isAdmin: boolean | undefined;
  loading: boolean;
}


export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const accountDetails = await account.get();
      setUser(accountDetails);
      return accountDetails;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    return await checkUserStatus();
  };

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
    router.refresh()
  };

  const isAdmin = user?.labels?.includes("admin");

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
