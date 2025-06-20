import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { firebaseConfig } from "../firebase/firebaseConfig";

const FirebaseApp = initializeApp(firebaseConfig);
const Auth = getAuth(FirebaseApp);
const DB = getFirestore(FirebaseApp);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);  // ✅ Add token state
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const unsubscribe = onIdTokenChanged(Auth, async (u) => {
    setUser(u || null);
    if (u) {
      const freshToken = await u.getIdToken(true); // force refresh
      const tokenResult = await u.getIdTokenResult(true); // also fresh
      setRole("user");
      setToken(freshToken);  // ✅ use freshToken here only
      console.log("Refreshed Token:", freshToken); // <-- debug token
    } else {
      setToken(null);
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  const login = async () => {

  const result = await signInWithPopup(Auth, new GoogleAuthProvider());
  const refreshedToken = await result.user.getIdToken(true); // ✅ force refresh
  setToken(refreshedToken); // ✅ immediately update token state
  };

  

  const logout = () => signOut(Auth);

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
