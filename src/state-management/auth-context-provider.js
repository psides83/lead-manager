import { createContext, useEffect, useReducer, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AuthContextReducer from "./auth-context-reducer";
import { auth, db } from "../services/firebase";

export const AUTH_ACTION = {
  LOGIN: "LOGIN",
  PDI_LOGIN: "PDI_LOGIN",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER"
}

const INITIAL_STATE = {
  currentUser: null,
  userProfile: JSON.parse(localStorage.getItem("userProfile")) || null,
  pdiUser: JSON.parse(localStorage.getItem("pdiUser")) || null,
};

export const AuthContext = createContext(INITIAL_STATE);


export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthContextReducer, INITIAL_STATE);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch({ type: AUTH_ACTION.LOGOUT });
        setAuthLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "users", firebaseUser.uid));
        dispatch({
          type: AUTH_ACTION.LOGIN,
          currentUser: firebaseUser,
          userProfile: profileSnap.exists() ? profileSnap.data() : null,
        });
      } catch (_) {
        dispatch({
          type: AUTH_ACTION.LOGIN,
          currentUser: firebaseUser,
          userProfile: null,
        });
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.currentUser));
    localStorage.setItem("userProfile", JSON.stringify(state.userProfile));
    localStorage.setItem("pdiUser", JSON.stringify(state.pdiUser));
  }, [state.currentUser, state.userProfile, state.pdiUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        userProfile: state.userProfile,
        pdiUser: state.pdiUser,
        authLoading,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
