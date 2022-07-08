import React, { useCallback, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  auth,
  db,
  onMessageListener,
  // eslint-disable-next-line
  requestForToken,
} from "./services/firebase";
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
// eslint-disable-next-line
import Loading from "./components/loading";
// eslint-disable-next-line
import toast, { Toaster } from "react-hot-toast";
import SalesmenList from "./components/salesmen-list/salesmen-list";
import { AuthContext } from "./state-management/auth-context-provider";
import SalesDashboard from "./components/sales-components/sales-dashboard";

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
  // eslint-disable-next-line
  const { currentUser } = useContext(AuthContext);
  // const [notification, setNotification] = useState({ title: "", body: "" });

  const RequireAuth = ({ children }) => {

    return currentUser ? children : <Navigate to="/sign-in" />;
  };

  // const notify = () => toast(<ToastDisplay />);
  // function ToastDisplay() {
  //   return (
  //     <div>
  //       <p>
  //         <b>{notification?.title}</b>
  //       </p>
  //       <p>{notification?.body}</p>
  //     </div>
  //   );
  // }

  // useEffect(() => {
  // updateAuth();
  // if (notification?.title) {
  //   notify();
  // }
  // }, [updateAuth]);

  // requestForToken();

  // onMessageListener()
  //   .then((payload) => {
  //     setNotification({
  //       title: payload?.notification?.title,
  //       body: payload?.notification?.body,
  //     });
  //   })
  //   .catch((err) => console.log("failed: ", err));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster />
      <Router>
        {currentUser && <MainAppBar />}
        <Box style={{ marginTop: currentUser && "75px" }}>
          <Routes>
            <Route path="/">
              <Route path="sign-in" element={<SignIn />} />
              <Route
                index
                element={
                  <RequireAuth>
                    <LeadDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="salesmen-list"
                element={
                  <RequireAuth>
                    <SalesmenList />
                  </RequireAuth>
                }
              />
              <Route
                path="/sales"
                element={
                  <RequireAuth>
                    <SalesDashboard />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="/customer-view/:leadId" element={<CustomerAppBar />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
