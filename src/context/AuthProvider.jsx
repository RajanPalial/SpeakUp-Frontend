import { createContext, useState } from "react";
const AuthContext = createContext({});
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [userTree, setUserTree] = useState([]);
  return (
    <AuthContext.Provider value={{ auth, setAuth, userTree, setUserTree }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
