export const initialState = {
  loading: true,
  // searchText: "",
};

const reducer = (state, action) => {
  switch (action.type) {

    // case "SET_SEARCH_TEXT":
    //   return {
    //     ...state,
    //     searchText: action.searchText,
    //   };

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
