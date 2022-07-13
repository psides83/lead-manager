import { createContext, useEffect, useReducer } from "react";
import AuthContextReducer from "./auth-context-reducer";

export const AUTH_ACTION = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER"
}

const INITIAL_STATE = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null,
  userProfile: JSON.parse(localStorage.getItem("userProfile")) || null,
};

export const AuthContext = createContext(INITIAL_STATE);


export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthContextReducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.currentUser));
    localStorage.setItem("userProfile", JSON.stringify(state.userProfile));
  }, [state.currentUser, state.userProfile]);

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        userProfile: state.userProfile,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
