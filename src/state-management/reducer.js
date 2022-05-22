export const initialState = {
  loading: true,
  searchText: ""
};

const reducer = (state, action) => {
   console.log(action);
   switch(action.type) {

       case "SET_USER":
           return {
               ...state,
               user: action.user,
           };

       case "SET_SEARCH_TEXT":
           return {
               ...state,
               searchText: action.searchText,
           };

       default:
           return state;
   };
};

export default reducer;