const AuthContextReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN": {
      return {
        currentUser: action.currentUser,
        userProfile: action.userProfile,
      };
    }
    case "LOGOUT": {
      return {
        currentUser: null,
        userProfile: null,
      };
    }
    default:
      return state;
  }
};

export default AuthContextReducer;