import { AUTH_ACTION } from "./auth-context-provider";

const AuthContextReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTION.LOGIN: {
      return {...state, 
        currentUser: action.currentUser,
        userProfile: action.userProfile,
      };
    }
    case AUTH_ACTION.PDI_LOGIN: {
      return {...state, 
        pdiUser: action.pdiUser
      };
    }
    case AUTH_ACTION.LOGOUT: {
      return {
        currentUser: null,
        userProfile: null,
        pdiUser: null,
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