import { AUTH_ACTION } from "./auth-context-provider";

const AuthContextReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTION.LOGIN: {
      return {
        currentUser: action.currentUser,
        userProfile: action.userProfile,
      };
    }
    case AUTH_ACTION.LOGOUT: {
      return {
        currentUser: null,
        userProfile: null,
      };
    }
    case AUTH_ACTION.UPDATE_USER: {
      return {...state,
        userProfile: action.userProfile,
      };
    }
    default:
      return state;
  }
};

export default AuthContextReducer;