import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren, useEffect } from "react";
import { toast } from "react-toastify";

import useApiService from "@/hooks/useApi";
import useAuth from "@/hooks/useAuth";
import useGlobal from "@/hooks/useGlobal";
import { APIError } from "@/services/transport";

type Props = PropsWithChildren;

const ReadyGuard: React.FC<Props> = ({ children }) => {
  const { apiService } = useApiService();
  const { logout } = useAuth();
  const { setSubscription, setOrganisation, setTodos, setProjects } =
    useGlobal();

  const worldQuery = useQuery({
    queryKey: ["world"],
    queryFn: () => apiService.getWorld(),
  });

  useEffect(() => {
    if (!worldQuery.error) {
      return;
    }
    if (worldQuery.error instanceof APIError) {
      toast(worldQuery.error.detail, { type: "error" });
    }
    logout();
    console.error(worldQuery.error);
  }, [worldQuery.error, logout]);

  useEffect(() => {
    if (worldQuery.isSuccess) {
      setSubscription(worldQuery.data.subscription);
      setOrganisation(worldQuery.data.organisation);
      setTodos(worldQuery.data.todos);
      setProjects(worldQuery.data.projects);
    }
  }, [
    worldQuery.data,
    worldQuery.isSuccess,
    setSubscription,
    setOrganisation,
    setTodos,
    setProjects,
  ]);

  if (!worldQuery.isFetched) {
    return <p>Loading</p>;
  }

  return children;
};

export default ReadyGuard;
