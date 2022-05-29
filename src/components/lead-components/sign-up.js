import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { auth, db } from "../../services/firebase";
import {
  setDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  collection,
} from "@firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  Alert,
  FormHelperText,
  Typography,
  OutlinedInput,
  Checkbox,
  Select,
  ListItemText,
  FormControl,
  InputLabel,
  Snackbar,
  Button,
  TextField,
  Grid,
  Avatar,
  MenuItem,
  Container,
  Box,
} from "@mui/material";

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  var [validationMessage, setValidationMessage] = useState("");

  const register = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;

        updateProfile(user, { fullName: `${firstName} ${lastName}` });

        if (user) {
          const newUser = doc(db, "users", user.uid);
          const userData = {
            id: user.uid,
            firstName: firstName,
            lastName: lastName,
            email: email,
          };
          setValidationMessage("Registration successful.");
          setOpenSuccess(true);
          setDoc(newUser, userData, { merge: true });
          navigate("/");
        }
      })
      .catch((error) => {
        setValidationMessage(
          "User already registered with this email address."
        );
        setOpenError(true);
      });
  };

  // Squipment submission validation.
  const signUpValidation = async (event) => {
    event.preventDefault();

    if (firstName === "") {
      setValidationMessage("First name is required to register.");
      setOpenError(true);
      return;
    } else if (lastName === "") {
      setValidationMessage("Last name is required to register.");
      setOpenError(true);
      return;
    } else if (password.length < 8) {
      setValidationMessage("Password must be at least 8 characters.");
      setOpenError(true);
      return;
    } else {
      register();
    }
  };

  // Forgot password.
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

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
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
        {/* <img style={{ width: "300px" }} src={fbceLogo} alt="" /> */}
        <Avatar
          sx={{
            margin: (theme) => theme.spacing(1),
            backgroundColor: (theme) => theme.palette.secondary.main,
          }}
        >
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box
          sx={{
            width: "100%",
            marginTop: (theme) => theme.spacing(1),
          }}
        >
          <Grid container spacing={2}>
            <Grid key="firstName" item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                size="small"
                id="firstName"
                label="First Name"
                autoFocus
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>

            <Grid key="lastName" item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                size="small"
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="lname"
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>

            <Grid key="email" item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                size="small"
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>

            <Grid key="password" item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                size="small"
                name="password"
                label="Password"
                type="password"
                id="password"
                helperText="Password must be at least 8 characters."
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
          </Grid>

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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              margin: (theme) => theme.spacing(3, 0, 2),
            }}
            onClick={signUpValidation}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="space-between">
            {/* <Grid item>
              <Link onClick={forgotPassword} variant="body2">
                Forgot password?
              </Link>
            </Grid> */}
            <Grid item>
              {/* <Link to="/sign-in" variant="body2">
                Already have an account? Sign in
              </Link> */}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}