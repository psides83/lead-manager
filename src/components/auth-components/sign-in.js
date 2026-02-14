import React, { useContext, useState } from "react";
// eslint-disable-next-line
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { doc, getDoc } from "firebase/firestore";
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
import { AuthContext, AUTH_ACTION } from "../../state-management/auth-context-provider";
import { pdiAuth, pdiDB } from "../../services/pdi-firebase";

export default function SignIn() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  var [validationMessage, setValidationMessage] = useState("");

  const fetchProfile = async (database, userId) => {
    const docRef = doc(database, "users", userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return docSnap.data();
  };

  const signIn = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    setOpenError(false);
    setOpenSuccess(false);

    try {
      const [primaryResult, pdiResult] = await Promise.allSettled([
        signInWithEmailAndPassword(auth, email, password),
        signInWithEmailAndPassword(pdiAuth, email, password),
      ]);

      if (primaryResult.status !== "fulfilled") {
        setValidationMessage("The email and/or password do not match");
        setOpenError(true);
        return;
      }

      const primaryUser = primaryResult.value.user;
      const userProfile = await fetchProfile(db, primaryUser.uid);
      if (!userProfile) {
        setValidationMessage("Your Lead Manager profile could not be found.");
        setOpenError(true);
        return;
      }

      dispatch({
        type: AUTH_ACTION.LOGIN,
        currentUser: primaryUser,
        userProfile,
      });

      if (pdiResult.status === "fulfilled") {
        const pdiProfile = await fetchProfile(pdiDB, pdiResult.value.user.uid);
        if (pdiProfile) {
          dispatch({
            type: AUTH_ACTION.PDI_LOGIN,
            pdiUser: pdiProfile,
          });
        } else {
          setValidationMessage(
            "Signed in. Setup request profile is missing in the PDI database.",
          );
          setOpenSuccess(true);
        }
      } else {
        setValidationMessage(
          "Signed in. Setup request access is limited because PDI sign-in failed.",
        );
        setOpenSuccess(true);
      }

      navigate("/");
    } catch (error) {
      setValidationMessage("Unable to sign in right now. Please try again.");
      setOpenError(true);
    } finally {
      setIsSigningIn(false);
    }
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
            disabled={isSigningIn}
            sx={{
              margin: (theme) => theme.spacing(3, 0, 2),
            }}
            onClick={signIn}
          >
            {isSigningIn ? "Signing In..." : "Sign In"}
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
