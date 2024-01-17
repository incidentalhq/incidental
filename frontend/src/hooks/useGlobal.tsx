import { createContext, useContext, useState } from "react";
import {
  IOrganisation,
  IProject,
  ISubscription,
  ITodo,
} from "shared-types/models";

const useGlobalProvider = () => {
  const [subscription, setSubscription] = useState<ISubscription>();
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [organisation, setOrganisation] = useState<IOrganisation>();
  const [projects, setProjects] = useState<IProject>([]);

  return {
    subscription,
    setSubscription,
    setTodos,
    todos,
    organisation,
    setOrganisation,
    projects,
    setProjects,
  };
};

// Create a type from the return values of _useDataProvider
type GlobalContextType = ReturnType<typeof useGlobalProvider>;

// Main context provider
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

type Props = {
  children?: React.ReactNode;
};

// Provides data for a single spreadsheet component
export const GlobalProvider: React.FC<Props> = ({ children }) => {
  const value = useGlobalProvider();
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

const useGlobal = () => {
  const context = useContext(GlobalContext);

  if (context === undefined) {
    throw new Error("Global context is undefined");
  }

  return context;
};

export default useGlobal;
