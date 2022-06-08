import React, { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { auth, db, onMessageListener, requestForToken } from "./services/firebase";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/system";
import { useStateValue } from "./state-management/state-provider";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import MainAppBar from "./components/lead-components/app-bar";
import LeadDashboard from "./components/lead-components/dashboard";
import CustomerAppBar from "./components/customer-components/customer-app-bar";
import SignIn from "./components/lead-components/sign-in";
import Loading from "./components/loading";
import CustomerSignUp from "./components/customer-components/customer-sign-up";
import toast, { Toaster } from "react-hot-toast";
import SalesDataGrid from "./components/sales-components/sales-data-grid";

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
  const [{ user, customerUser, loading }, dispatch] = useStateValue();
  const [userProfile, setProfile] = useState({});
  const [notification, setNotification] = useState({title: '', body: ''});

  const notify = () =>  toast(<ToastDisplay/>);
  function ToastDisplay() {
    return (
      <div>
        <p><b>{notification?.title}</b></p>
        <p>{notification?.body}</p>
      </div>
    );
  };

  const fetchProfile = (user) => {
    if (user) {
      try {
        onSnapshot(doc(db, "users", user?.uid), (doc) => {
          console.log("Current User: ", doc.data());
          dispatch({
            type: "SET_USER_PROFILE",
            userProfile: doc.data(),
          });
        });
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const updateAuth = useCallback(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // setTimeout( function() { setLoading(false); }, 2000);
        if (user.email == null) {
          dispatch({
            type: "SET_CUSTOMER_USER",
            customerUser: user,
          });
          fetchProfile(user);
          return;
        }
        dispatch({
          type: "SET_USER",
          user: user,
        });
        fetchProfile(user);
      } else {
        // User is signed out
        dispatch({
          type: "SET_USER",
          user: null,
        });
        // User is signed out
        dispatch({
          type: "SET_CUSTOMER_USER",
          customerUser: null,
        });

        // User is signed out
        dispatch({
          type: "SET_USER_PROFILE",
          userProfile: null,
        });
      }
    });
  }, [auth]);

  useEffect(() => {
    updateAuth();
    if (notification?.title ){
      notify()
     }
  }, [dispatch, updateAuth, notification]);

  // requestForToken();

  onMessageListener()
    .then((payload) => {
      setNotification({title: payload?.notification?.title, body: payload?.notification?.body});     
    })
    .catch((err) => console.log('failed: ', err));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster /> 
      {user && <MainAppBar />}
      <Box style={{ marginTop: user && "75px" }}>
        <Router>
          <Routes>
            <Route path="/sales" element={user ? <SalesDataGrid /> : <SignIn />} />
            <Route
              path="/customer-view"
              element={customerUser ? <CustomerAppBar /> : <CustomerSignUp />}
            />
            <Route path="/" element={user ? <LeadDashboard /> : <SignIn />} />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}
