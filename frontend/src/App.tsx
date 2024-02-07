import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AuthGuard from "@/components/Guard/AuthGuard";
import ReadyGuard from "@/components/Guard/ReadyGuard";
import DefaultLayout from "@/components/Layout/DefaultLayout";
import { ApiServiceProvider } from "@/hooks/useApi";
import { GlobalProvider } from "@/hooks/useGlobal";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Login from "@/pages/Login/Login";

import { AuthProvider } from "@/hooks/useAuth";
import Register from "@/pages/Register/Register";
import RegisterSuccess from "@/pages/Register/Success";
import { RoutePaths } from "./routes";
import OAuthComplete from "./pages/OAuth/Complete";
import IncidentsList from "./pages/Incidents/List";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const DefaultLayoutRoutes = () => (
  <DefaultLayout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/incidents" element={<IncidentsList />} />
    </Routes>
  </DefaultLayout>
);

const AuthenticatedRoutes = () => (
  <AuthGuard>
    <ReadyGuard>
      <Routes>
        <Route path="/*" element={<DefaultLayoutRoutes />} />
      </Routes>
    </ReadyGuard>
  </AuthGuard>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GlobalProvider>
          <ApiServiceProvider>
            <AuthProvider>
              <Routes>
                <Route path={RoutePaths.LOGIN} element={<Login />} />
                <Route path={RoutePaths.REGISTER} element={<Register />} />
                <Route
                  path={RoutePaths.OAUTH_COMPLETE}
                  element={<OAuthComplete />}
                />
                <Route
                  path={RoutePaths.REGISTER_SUCCESS}
                  element={<RegisterSuccess />}
                />
                <Route path="/*" element={<AuthenticatedRoutes />} />
              </Routes>
            </AuthProvider>
          </ApiServiceProvider>
        </GlobalProvider>
      </BrowserRouter>
      <ToastContainer hideProgressBar={true} autoClose={2000} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
