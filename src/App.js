import React from "react";
// import "./style.css";
import MainAppBar from "./components/app-bar.js";
import LeadDashboard from "./components/dashboard.js";
// import { Box, Grid, Button, Snackbar, Alert } from "@mui/material";
// import { leads } from "./leads";
// import AddLead from "./add-lead.js";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/system";
// import { Add, CancelOutlined } from "@mui/icons-material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      // light: "#367C2B",
      main: "#367C2B",
      // dark: "#367C2B",
    },
    secondary: {
      // light: "#FFDE00",
      main: "#FFDE00",
      // dark: "#FFDE00",
    },
    success: {
      // light: "#81c784",
      main: "#66bb6a",
      // dark: "#388e3c",
    },
    error: {
      // light: "#e57373",
      main: "#f44336",
      // dark: "#d32f2f",
    },
    info: {
      // light: "#708090",
      main: "#708090",
      // dark: "#708090",
    },
    background: {
      // main: "#20301d",
      default: "#e3e8e8",
      // paper: "#f2f2f2",
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainAppBar />
      <Box style={{ marginTop: "75px" }}>
        <LeadDashboard />
      </Box>
    </ThemeProvider>
  );
}