import { createContext, ReactElement, useContext, useState } from "react";

// Create a context
const GroupContext = createContext<string[]>();

// Context provider component
export const GroupProvider = ({ children }: { children: ReactElement }) => {
  const [groups, setGroups] = useState<string[]>([]);

  return (
    <GroupContext.Provider value={{ groups, setGroups }}>
      {children}
    </GroupContext.Provider>
  );
};

// Custom hook to use the GroupContext
export const useGroups = () => {
  return useContext(GroupContext);
};
