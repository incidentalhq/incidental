"use client";
import { createContext, ReactNode } from "react";
import { IStatusPage } from "@/types/models";

type StatusPageContextType = {
  statusPage: IStatusPage;
};

export const StatusPageContext = createContext<StatusPageContextType | null>(
  null
);

const StatusPageProvider = ({
  children,
  statusPage,
}: {
  children: ReactNode;
  statusPage: IStatusPage;
}) => {
  return (
    <StatusPageContext.Provider value={{ statusPage }}>
      {children}
    </StatusPageContext.Provider>
  );
};

export default StatusPageProvider;
