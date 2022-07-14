import { createContext, useEffect, useReducer } from "react";
import AuthContextReducer from "./auth-context-reducer";

export const AUTH_ACTION = {
  LOGIN: "LOGIN",
  PDI_LOGIN: "PDI_LOGIN",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER"
}

const INITIAL_STATE = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null,
  userProfile: JSON.parse(localStorage.getItem("userProfile")) || null,
  pdiUser: JSON.parse(localStorage.getItem("pdiUser")) || null,
};

export const AuthContext = createContext(INITIAL_STATE);


export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthContextReducer, INITIAL_STATE);

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
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
