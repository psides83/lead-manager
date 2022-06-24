import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Alert, Snackbar } from "@mui/material";
import { useStateValue } from "../../state-management/state-provider";
import { AgricultureRounded } from "@mui/icons-material";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import CustomerDashboard from "./customer-dashboard";
// eslint-disable-next-line
import Loading from "../loading";
import { useParams } from "react-router-dom";

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
  const { leadId } = useParams();
  // eslint-disable-next-line
  const [{ loading }, dispatch] = useStateValue();
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = useState(false);
  // eslint-disable-next-line
  const [value, setValue] = useState("leads");
  // eslint-disable-next-line
  var [validationMessage, setValidationMessage] = useState("");

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  // eslint-disable-next-line
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
                  sx={{ mr: 2 }}
                />
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
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
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
