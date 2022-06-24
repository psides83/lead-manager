import React, { useState } from "react";
// eslint-disable-next-line
import { Link, useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { onSnapshot, doc } from "firebase/firestore";
import { useStateValue } from "../../state-management/state-provider";
import { auth, db } from "../../services/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  Alert,
  TextField,
  Button,
  Avatar,
  Grid,
  Typography,
  Container,
  Snackbar,
  Box,
} from "@mui/material";

export default function SignIn() {
  const navigate = useNavigate();
  const [{ user }, dispatch] = useStateValue();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  var [validationMessage, setValidationMessage] = useState("");

  const fetchProfile = async () => {
    try {
      onSnapshot(doc(db, "users", user?.uid), (doc) => {
        console.log("Current data: ", doc.data());
        dispatch({
          type: "SET_USER_PROFILE",
          userProfile: doc.data(),
        });
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const signIn = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        fetchProfile();
        navigate("/");
      })
      .catch((error) => {
        setValidationMessage("The email and/or password do not match");
        setOpenError(true);
      });
  };

  // Forgot password.
  // eslint-disable-next-line
  const forgotPassword = async () => {
    await sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        setValidationMessage("An email has been sent to reset your password");
        setOpenSuccess(true);
      })
      .catch((error) => {
        setValidationMessage("An email has been sent to reset your password");
        setOpenSuccess(true);
      });
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenError(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: (theme) => theme.spacing(8),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar
          sx={{
            margin: (theme) => theme.spacing(1),
            backgroundColor: (theme) => theme.palette.secondary.main,
          }}
        >
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box
          sx={{
            width: "100%",
            marginTop: (theme) => theme.spacing(1),
          }}
        >
          <TextField
            key="email"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            size="small"
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            key="password"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            size="small"
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Snackbar
            open={openError}
            autoHideDuration={3000}
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              {validationMessage}
            </Alert>
          </Snackbar>

          <Snackbar
            open={openSuccess}
            autoHideDuration={3000}
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity="success"
              sx={{ width: "100%" }}
            >
              {validationMessage}
            </Alert>
          </Snackbar>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              margin: (theme) => theme.spacing(3, 0, 2),
            }}
            onClick={signIn}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              {/* <Link onClick={forgotPassword} variant="body2">
                Forgot password?
              </Link> */}
            </Grid>
            {/* <Grid item>
              <Link to="/sign-up" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid> */}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}