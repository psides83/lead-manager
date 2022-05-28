import React, { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { auth, db } from "./services/firebase";
import MainAppBar from "./components/app-bar.js";
import LeadDashboard from "./components/dashboard.js";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/system";
import { useStateValue } from "./state-management/state-provider";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SignUp from "./components/sign-up";
import SignIn from "./components/sign-in";
import CustomerView from "./components/customer-view";
import CustomerAppBar from "./components/customer-app-bar";
import CustomerDashboard from "./components/customer-dashboard";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#367C2B",
    },
    secondary: {
      main: "#FFDE00",
    },
    success: {
      main: "#66bb6a",
    },
    error: {
      main: "#f44336",
    },
    info: {
      main: "#708090",
    },
    background: {
      default: "#e3e8e8",
    },
  },
});

export default function App() {
  const [{ user }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [userProfile, setProfile] = useState({});
  const customer = {
    name: "Johnny Barrett",
    phone: "3343994356",
  };

  const fetchProfile = useCallback(async () => {
    try {
      onSnapshot(doc(db, "users", user?.uid), (doc) => {
        console.log("Current User: ", doc.data());
        setProfile(doc.data());
        dispatch({
          type: "SET_USER_PROFILE",
          userProfile: doc.data(),
        });
      });
    } catch (error) {
      console.log("error", error);
    }
  }, [user]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // setTimeout( function() { setLoading(false); }, 2000);

        dispatch({
          type: "SET_USER",
          user: user,
        });
        setLoading(false);
      } else {
        // User is signed out
        dispatch({
          type: "SET_USER",
          user: null,
        });
        setLoading(false);
      }
    });

    fetchProfile();
  }, [dispatch, fetchProfile]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {user && <MainAppBar />}
      <Box style={{ marginTop: user && "75px" }}>
        <Router>
          <Routes>
            <Route
              path="/customer-view"
              element={<CustomerAppBar customer={customer} />}
            />
            <Route path="/" element={user ? <LeadDashboard /> : <SignIn />} />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}
