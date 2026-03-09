import React, { createContext, useContext, useState } from "react";

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState("borrower"); // default role

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used inside RoleProvider");
  }

  return context;
}
