import React, { useContext, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { AgricultureRounded, MenuRounded, SearchRounded } from "@mui/icons-material";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { auth } from "../../services/firebase";
import { Link } from "react-router-dom";
import { SearchContext, SEARCH_ACTION } from "../../state-management/search-provider";
import DynamicSnackbar from "../ui-components/snackbar";
import AppBarMenu from "./app-bar-menu";
import AddLead from "../lead-components/add-lead/add-lead";
import UserAccountDialog from "../user-components/user-account-dialog";

function HideOnScroll(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function MainAppBar(props) {
  const { searchText, searchDispatch } = useContext(SearchContext);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [message, setMessage] = useState("");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  const handleSearchInput = (event) => {
    searchDispatch({
      type: SEARCH_ACTION.SEARCH,
      searchText: event.target.value,
    });
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <HideOnScroll {...props}>
        <AppBar
          elevation={0}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(90deg, #255d1f 0%, #367c2b 55%, #4b9a38 100%)",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ gap: 1.25 }}>
              <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                <IconButton size="large" edge="start" color="inherit" aria-label="Go to dashboard">
                  <AgricultureRounded />
                </IconButton>
              </Link>

              <Typography
                variant="h6"
                noWrap
                sx={{
                  flexShrink: 0,
                  display: { xs: "none", md: "block" },
                  color: "common.white",
                }}
              >
                Lead Manager
              </Typography>

              <TextField
                size="small"
                placeholder="Search leads by name or phone"
                value={searchText}
                onChange={handleSearchInput}
                sx={{
                  width: { xs: "100%", md: 360 },
                  ml: { xs: 0, md: 1 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "common.white",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.25)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.4)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(255,255,255,0.7)",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255,255,255,0.8)",
                    opacity: 1,
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded sx={{ color: "rgba(255,255,255,0.9)" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box sx={{ flexGrow: 1 }} />

              <AddLead
                setMessage={setMessage}
                setOpenError={setOpenError}
                setOpenSuccess={setOpenSuccess}
              />

              <IconButton
                size="large"
                color="inherit"
                aria-label="Open app menu"
                onClick={handleClick}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <MenuRounded />
              </IconButton>

              <UserAccountDialog
                setMessage={setMessage}
                setOpenSuccess={setOpenSuccess}
                setOpenError={setOpenError}
              />
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      <AppBarMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} auth={auth} open={open} />

      <DynamicSnackbar
        message={message}
        openSuccess={openSuccess}
        openError={openError}
        handleClose={handleClose}
      />
    </Box>
  );
}
