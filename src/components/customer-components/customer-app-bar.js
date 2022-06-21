import React, { useCallback, useEffect, useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { Alert, Snackbar, Tab, Tabs, Tooltip } from "@mui/material";
import { useStateValue } from "../../state-management/state-provider";
import { AccountCircleRounded, AgricultureRounded } from "@mui/icons-material";
import Slide from "@mui/material/Slide";
import PropTypes from "prop-types";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { auth } from "../../services/firebase";
import CustomerDashboard from "./customer-dashboard";
import { onAuthStateChanged } from "firebase/auth";
import CustomerSignUp from "./customer-sign-up";
import Loading from "../loading";
import {
  useParams
} from "react-router-dom";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

function HideOnScroll(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function CustomerAppBar(props) {
  const { leads } = props
  const { leadId } = useParams();
  const [{ userProfile, customerUser, loading }, dispatch] = useStateValue();
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = useState(false);
  const [value, setValue] = useState("leads");
  var [validationMessage, setValidationMessage] = useState("");

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    };

    setOpenSuccess(false);
    setOpenError(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // const logout = (e) => {
  //   e.preventDefault();
  //   if (user) {
  //     // User is signed in, see docs for a list of available properties
  //     // https://firebase.google.com/docs/reference/js/firebase.User
  //     auth.signOut();
  //   }
  // };

  return (
    <>
      {/* {loading && <Loading/>} */}
    {/* {!customerUser ? <CustomerSignUp />
    : */}
    <>
      <Box sx={{ flexGrow: 1 }}>
        <HideOnScroll {...props}>
          <AppBar elevation={8}>
            <Toolbar>
              
                <AgricultureRounded 
                size="large"
                edge="start"
                color="inherit"
                sx={{ mr: 2 }} />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ flexGrow: 1 }}
              >
                SunSouth Customer Portal
              </Typography>

              <Box sx={{ flexGrow: 4 }} />
            </Toolbar>
          </AppBar>
        </HideOnScroll>

        <Snackbar
          open={openSuccess}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            {validationMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={openError}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            {validationMessage}
          </Alert>
        </Snackbar>
      </Box>
      <CustomerDashboard leadId={leadId} />
      </>
    {/* } */}
    </>
  );
}
