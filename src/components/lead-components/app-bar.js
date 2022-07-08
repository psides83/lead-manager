import React, { useContext, useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import AddLead from "./add-lead";
import { Alert, ListItemIcon, Menu, MenuItem, Snackbar } from "@mui/material";
import {
  AgricultureRounded,
  InsertChartRounded,
  LogoutRounded,
  MenuRounded,
  PeopleAltRounded,
} from "@mui/icons-material";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { auth } from "../../services/firebase";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../state-management/auth-context-provider";
import { SearchContext } from "../../state-management/search-provider";
import DynamicSnackbar from "../ui-components/snackbar";

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
  const {currentUser, dispatch} = useContext(AuthContext);
  const {searchText, searchDispatch} = useContext(SearchContext);
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = useState(false);
  const navigate = useNavigate();
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

  const logout = (e) => {
    e.preventDefault();
    if (currentUser) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      // User is signed out
      dispatch({
        type: "LOGOUT",
        currentUser: null,
        userProfile: null,
      });
      auth.signOut();
    }
  };

  // Menu button
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
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
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            navigate("/sales");
          }}
        >
          <ListItemIcon>
            <InsertChartRounded fontSize="small" />
          </ListItemIcon>
          Sales
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            navigate("/salesmen-list");
          }}
        >
          <ListItemIcon>
            <PeopleAltRounded fontSize="small" />
          </ListItemIcon>
          Salesmen
        </MenuItem>
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <LogoutRounded fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <DynamicSnackbar
        message={message}
        openSuccess={openSuccess}
        openError={openError}
        handleClose={handleClose}
      />
    </Box>
  );
}
