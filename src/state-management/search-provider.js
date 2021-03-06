import { createContext, useReducer } from "react";

const INITIAL_STATE = {
  searchText: ""
};

export const SearchContext = createContext(INITIAL_STATE);

export const SearchContextProvider = ({ children }) => {
  const [state, searchDispatch] = useReducer(ContextReducer, INITIAL_STATE);

  return (
    <SearchContext.Provider
      value={{
        searchText: state.searchText,
        searchDispatch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

const ContextReducer = (state, action) => {
    switch (action.type) {
      case "SEARCH": {
          return {
            searchText: action.searchText,
          };
        }
      default:
        return state;
    }
  };