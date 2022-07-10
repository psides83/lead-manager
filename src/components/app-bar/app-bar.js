import React, { useContext, useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import AddLead from "../lead-components/add-lead";
import { AgricultureRounded, MenuRounded } from "@mui/icons-material";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { auth } from "../../services/firebase";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../state-management/auth-context-provider";
import { SearchContext } from "../../state-management/search-provider";
import DynamicSnackbar from "../ui-components/snackbar";
import AppBarMenu from "./app-bar-menu";
import UserAccountDialog from "../user-components/user-account-dialog";

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

export default function MainAppBar(props) {
  const { searchText, searchDispatch } = useContext(SearchContext);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  var [message, setMessage] = useState("");

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  const handleSearchInput = (e) => {
    searchDispatch({
      type: "SEARCH",
      searchText: e.target.value,
    });
  };

  // Menu button
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <HideOnScroll {...props}>
        <AppBar elevation={8}>
          <Toolbar>
            <Link to="/" style={{ color: "white" }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
                sx={{ mr: 2 }}
                // onClick={useNavigate("/")}
              >
                <AgricultureRounded />
              </IconButton>
            </Link>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            >
              Lead Manager
            </Typography>
            <Box sx={{ flexGrow: 4 }} />
            <Search sx={{ mr: 2 }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                value={searchText}
                onChange={handleSearchInput}
              />
            </Search>
            <AddLead
              setMessage={setMessage}
              setOpenError={setOpenError}
              setOpenSuccess={setOpenSuccess}
            />

            <IconButton
              size="large"
              color="inherit"
              aria-label="open drawer"
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
        </AppBar>
      </HideOnScroll>

      <AppBarMenu
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        auth={auth}
        open={open}
        setOpenSuccess={setOpenSuccess}
        setOpenError={setOpenError}
        setMessage={setMessage}
      />

      <DynamicSnackbar
        message={message}
        openSuccess={openSuccess}
        openError={openError}
        handleClose={handleClose}
      />
    </Box>
  );
}
