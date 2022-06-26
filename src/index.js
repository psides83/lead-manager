import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
// import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { StateProvider } from "./state-management/state-provider";
import reducer, { initialState } from "./state-management/reducer";
import { AuthContextProvider } from "./state-management/auth-context-provider";
import { SearchContextProvider } from "./state-management/search-provider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <StateProvider initialState={initialState} reducer={reducer}>
      <AuthContextProvider>
        <SearchContextProvider>
          <App />
        </SearchContextProvider>
      </AuthContextProvider>
    </StateProvider>
  </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
