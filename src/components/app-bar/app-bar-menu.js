import React, { useContext } from "react";
import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import {
  InsertChartRounded,
  LogoutRounded,
  PeopleAltRounded,
} from "@mui/icons-material";
import { AuthContext } from "../../state-management/auth-context-provider";
import { useNavigate } from "react-router-dom";

function AppBarMenu(props) {
  const { anchorEl, setAnchorEl, auth, open } = props;
  const { currentUser, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  return (
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
  );
}

export default AppBarMenu;
