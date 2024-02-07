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
  const { setOrganisation } = useGlobal();

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
      setOrganisation(worldQuery.data.organisation);
    }
  }, [worldQuery.data, worldQuery.isSuccess, setOrganisation]);

  if (!worldQuery.isFetched) {
    return <p>Loading</p>;
  }

  return children;
};

export default ReadyGuard;
