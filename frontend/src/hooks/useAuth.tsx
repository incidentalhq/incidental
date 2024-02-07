import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUser } from "@/types/models";

import { clearUserDataFromBrowser, saveAuthToBrowser } from "@/utils/storage";

import useApiService from "./useApi";

const _userAuthProvider = () => {
  const [user, setUser] = useState<IUser>();
  const navigate = useNavigate();
  const { apiService } = useApiService();

  const slackLogin = async (code: string) => {
    const data = await apiService.slackOpenIdLogin(code);
    setUser(data);
    saveAuthToBrowser(data);
    apiService.setCurrentUser(data);
    navigate("/");
  };

  const login = async (emailAddress: string, password: string) => {
    const data = await apiService.authUser({
      emailAddress,
      password,
    });
    setUser(data);
    saveAuthToBrowser(data);
    apiService.setCurrentUser(data);
    navigate("/");
  };

  const logout = () => {
    clearUserDataFromBrowser();
    setUser(undefined);
    navigate("/");
  };

  return { setUser, user, logout, login, slackLogin };
};

// Create a type from the return values of _useDataProvider
type AuthContextType = ReturnType<typeof _userAuthProvider>;

// Main context provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children?: React.ReactNode;
};

// Provides data for a single spreadsheet component
export const AuthProvider: React.FC<Props> = ({ children }) => {
  const value = _userAuthProvider();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth can only be used within an Auth context");
  }

  return context;
};

export default useAuth;
