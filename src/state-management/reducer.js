export const initialState = {
  searchText: "",
  user: null,
};

const reducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.user,
      };

    case "SET_USER_PROFILE":
      return {
        ...state,
        userProfile: action.userProfile,
      };

    case "SET_SEARCH_TEXT":
      return {
        ...state,
        searchText: action.searchText,
      };

    default:
      return state;
  }
};

export default reducer;
