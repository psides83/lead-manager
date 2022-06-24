export const initialState = {
  loading: true,
  searchText: "",
  user: null,
  customerUser: null,
  userProfile: null,
};

const reducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.user,
      };

    case "SET_CUSTOMER_USER":
      return {
        ...state,
        customerUser: action.customerUser,
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

    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading,
      };

    default:
      return state;
  }
};

export default reducer;
