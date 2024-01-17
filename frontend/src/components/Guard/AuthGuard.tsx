import { PropsWithChildren, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import useApiService from "@/hooks/useApi";
import useAuth from "@/hooks/useAuth";
import { getAuthFromBrowser, pushOAuthRequest } from "@/utils/storage";

// If Oauth request push request into a local queue
const pushOAuthRequestsIfExists = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  if (!code || !state) {
    return;
  }

  pushOAuthRequest(code, state);
};

const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const [redirect, setRedirect] = useState(false);
  const cookieData = getAuthFromBrowser();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { apiService } = useApiService();

  useEffect(() => {
    // load user info from local storage
    if (cookieData && !user) {
      setUser(cookieData);
      apiService.setCurrentUser(cookieData);

      // if we're on the login page, but have authenticated then redirect to root page
      if (location.pathname === "/login") {
        navigate("/");
      }
    }

    // redirect to login page
    if (!user && !cookieData) {
      pushOAuthRequestsIfExists();
      setRedirect(true);
    }
  }, [cookieData, user, setUser, navigate]);

  if (redirect) {
    return <Navigate to={"/login"} />;
  }

  if (!user) {
    return null;
  }

  return children;
};

export default AuthGuard;
