import React, { useCallback, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { LockOutlined } from "@mui/icons-material";
import { useStateValue } from "../../state-management/state-provider";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { formatPhoneNumber } from "../../utils/utils";

function CustomerSignUp() {
  const [{ customerUser }, dispatch] = useStateValue();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [expandForm, setExpandForm] = useState(false);
  const [code, setCode] = useState("");

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      },
      auth
    );
  };

  const handlePhoneInput = (e) => {
    e.preventDefault();

    setPhoneNumber(`+1${e.target.value}`);
  };

  const signUpWithPhone = (e) => {
    e.preventDefault();
    if (phoneNumber.length === 12) {
      generateRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((confirmationResult) => {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          setExpandForm(true);
          window.confirmationResult = confirmationResult;
        })
        .catch((error) => {
          // Error; SMS not sent
          // ...
        });
    }
  };

  //    Fetch leads from firestore
  const addUIDToLead = async (user) => {
    const leadsQuery = query(
      collection(db, "leads"),
      where("phone", "==", formatPhoneNumber(user.phoneNumber))
    );

    var leads = [];
    const querySnapshot = await getDocs(leadsQuery);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      leads.push({
        id: doc.data().id,
        phone: doc.data().phone,
        status: doc.data().status,
      });
    });

    leads.forEach((lead) => {
      setDoc(doc(db, "leads", lead.id), { uid: user.uid }, { merge: true });
    });
  };

  const verifyCode = async (e) => {
    e.preventDefault();

    setCode(e.target.value);

    if (code.length === 6) {
      let confirmationResult = window.confirmationResult;
      confirmationResult
        .confirm(code)
        .then((result) => {
          // User signed in successfully.
          const user = result.user;
          if (user) {
            console.log(user);
            const newUser = doc(db, "users", user.uid);
            const userData = {
              id: user.uid,
              phone: formatPhoneNumber(user.phoneNumber),
              type: "customer",
            };
            setDoc(newUser, userData, { merge: true });
            addUIDToLead(user);
          }
          // ...
        })
        .catch((error) => {
          // User couldn't sign in (bad verification code?)
          // ...
        });
    }
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
          <LockOutlined />
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
            key="phone"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            size="small"
            name="phone"
            label="Phone Number"
            type="tel"
            id="phone"
            autoComplete="tel"
            // value={phoneNumber}
            onChange={handlePhoneInput}
          />

          <Collapse in={expandForm}>
            <TextField
              key="code"
              variant="outlined"
              margin="normal"
              required
              fullWidth
              size="small"
              name="code"
              label="Comfirmation Code"
              type="tel"
              id="code"
              autoComplete="tel"
              value={code}
              onChange={verifyCode}
            />
          </Collapse>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              margin: (theme) => theme.spacing(3, 0, 2),
            }}
            onClick={expandForm ? verifyCode : signUpWithPhone}
          >
            Sign In
          </Button>
        </Box>
      </Box>
      <div id="recaptcha-container"></div>
    </Container>
  );
}

export default CustomerSignUp;
