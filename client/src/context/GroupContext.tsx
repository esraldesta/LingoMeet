import { createContext, useContext, useState } from "react";

// Create a context
const GroupContext = createContext();

// Context provider component
export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);

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
