import React, { useState } from "react";
import WalletContext from "./WalletContext";

const WalletContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <WalletContext.Provider value={{ user, setUser }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContextProvider;
