//Imports
import React, { useCallback, useContext, useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { setDoc, doc, deleteDoc } from "@firebase/firestore";
import moment from "moment";
import { userInputs, userTypes } from "../../models/arrays";
import {
  Box,
  Grid,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  AccountCircleRounded,
  CheckRounded,
  Close,
  DeleteRounded,
  SaveRounded,
} from "@mui/icons-material";
import { AuthContext, AUTH_ACTION } from "../../state-management/auth-context-provider";

export default function UserAccountDialog(props) {
  //#region State Properties
  const { setMessage, setOpenSuccess, setOpenError } = props;
  const { currentUser, userProfile, dispatch } = useContext(AuthContext);
  var [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    type: "",
    yearStarted: "",
  });
  const [importedData, setImportedData] = useState({});
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [isShowingConfirmDialog, setIsShowingConfirmDialog] = useState(false);
  var [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  //#endregion

  const handleCloseDialog = (e) => {
    setIsShowingDialog(false);
    setIsShowingConfirmDialog(false);
    resetLeadForm();
  };

  const handleToggleDialog = () => {
    setSuccess(false);
    setLoading(false);
    setIsShowingDialog(!isShowingDialog);
  };

  const handleCloseConfirmDialog = () => {
    setIsShowingConfirmDialog(false);
  };

  const handleToggleConfirmDialog = () => {
    setIsShowingConfirmDialog(!isShowingConfirmDialog);
  };

  // load data from lead
  const loadUserData = useCallback(() => {
    if (userProfile && isShowingDialog) {
      setUserData({
        id: userProfile.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        type: userProfile.type,
        yearStarted: userProfile.yearStarted,
        notificationToken: userProfile.notificationToken,
      });
      setImportedData({
        id: userProfile.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        type: userProfile.type,
        yearStarted: userProfile.yearStarted,
        notificationToken: userProfile.notificationToken,
      });
      setLoading(false);
    }
  }, [isShowingDialog, userProfile]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle deleting of child record.
  const deleteLead = async () => {
    await deleteDoc(doc(db, "users", userProfile?.id));

    handleCloseConfirmDialog();
    handleCloseDialog();
  };

  // Add the lead to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
  const setUserToFirestore = async () => {
    const userRef = doc(db, "users", userProfile?.id);

    await setDoc(userRef, userData, { merge: true });
  };

  // Reset the Lead form
  const resetLeadForm = async () => {
    setUserData({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      type: "",
      yearStarted: "",
      notificationToken: "",
    });
    setImportedData({});
  };

  //   update user profile context
  const updateUserProfile = async () => {
    dispatch({
      type: AUTH_ACTION.UPDATE_USER,
      userProfile: userData,
    });
  };

  // Requst submission validation.
  const userSubmitValidation = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (userData.firstName === "" || userData.lastName === "") {
      setMessage("User must have a name to be updated");
      setOpenError(true);
      return;
    } else {
      await updateUserProfile()
        .then(() => {
          setUserToFirestore();
        })
        .then(() => {
          setLoading(false);
          setSuccess(true);
          setMessage("User successfully edited");
          setOpenSuccess(true);
          handleCloseDialog();
          resetLeadForm();
        })
        .catch((error) => {
          loadUserData();
          setLoading(false);
          setMessage(`${error}`);
          setOpenError(true);
        });
    }
  };

  // sets the state of the save button based on whether data in the form has changed or is being saved
  const buttonIsDisabled = () => {
    if (isShowingDialog && userProfile) {
      if (loading) return true;

      if (
        userData.firstName !== importedData.firstName ||
        userData.firstName === ""
      )
        return false;
      if (
        userData.lastName !== importedData.lastName ||
        userData.firstName === ""
      )
        return false;
      if (userData.email !== importedData.email) return false;
      if (userData.type !== importedData.type) return false;
      if (userData.yearStarted !== importedData.yearStarted) return false;
      return true;
    }
  };

  // handle the onChange for the lead inputs
  const handleInput = (e, id) => {
    var value = e.target.value;

    if (id === "firstName") {
      const firstName = e.target.value;

      value = firstName.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
        letter.toUpperCase()
      );
    }

    if (id === "lastName") {
      const lastName = e.target.value;

      value = lastName.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
        letter.toUpperCase()
      );
    }

    setUserData({ ...userData, [id]: value });
  };

  //  handles the userData object values for the lead inputs
  const handleUserValues = (id) => {
    switch (id) {
      case "firstName":
        return userData.firstName;
      case "lastName":
        return userData.lastName;
      case "email":
        return userData.email;
      case "type":
        return userData.type;
      case "yearStarted":
        return userData.yearStarted;
      default:
        return "";
    }
  };

  // UI view of the submission form
  return (
    <>
      <Tooltip title="Account Settings">
        <IconButton
          aria-label="edit"
          color="inherit"
          onClick={handleToggleDialog}
        >
          <AccountCircleRounded color="inherit" />
        </IconButton>
      </Tooltip>

      <Dialog
        onClose={handleCloseDialog}
        open={isShowingDialog}
        style={{ backdropFilter: "blur(5px)" }}
        PaperProps={{ style: { borderRadius: 8 }, elevation: 24 }}
      >
        <Box
          sx={{
            maxWidth: "380px",
            padding: (theme) => theme.spacing(1),
            paddingLeft: (theme) => theme.spacing(4),
            paddingRight: (theme) => theme.spacing(4),
            paddingBottom: (theme) => theme.spacing(3),
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <DialogTitle variant="body1"><strong>User:</strong> {userData.email}</DialogTitle>
            <IconButton sx={{ height: 44 }} onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Stack>
          <Grid container spacing={2}>
            {userInputs.map((input) => (
              <Grid item key={input.id} xs={input.gridXS} sm={input.gridSM}>
                <TextField
                  required={input.required}
                  fullWidth
                  autoFocus={input.autoFocus}
                  size="small"
                  id={input.id}
                  name={input.id}
                  label={input.label}
                  type={input.type}
                  labelid={input.id}
                  variant="outlined"
                  select={input.select}
                  value={handleUserValues(input.id)}
                  onChange={(e) => handleInput(e, input.id)}
                  InputProps={input.inputProps}
                >
                  {input.select &&
                    userTypes.map((type, index) => (
                      <MenuItem key={index} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                color="error"
                onClick={handleToggleConfirmDialog}
                startIcon={<DeleteRounded />}
              >
                Delete
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ position: "relative" }}>
                <Button
                  fullWidth
                  disabled={buttonIsDisabled()}
                  variant="contained"
                  endIcon={success ? <CheckRounded /> : <SaveRounded />}
                  onClick={userSubmitValidation}
                >
                  {loading && (
                    <CircularProgress
                      size={24}
                      color="primary"
                      sx={{
                        // color: green[500],
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginTop: "-12px",
                        marginLeft: "-12px",
                      }}
                    />
                  )}
                  {loading ? "Saving" : success ? "Success" : "Save"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Dialog>

      <Dialog onClose={handleCloseConfirmDialog} open={isShowingConfirmDialog}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "5px 25px 25px 25px",
          }}
        >
          <DialogTitle>Confirm Delete</DialogTitle>

          <div>
            <Typography>Are you sure you want to</Typography>
            <Typography>delete this Lead?</Typography>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: "25px",
              }}
            >
              <Button
                variant="outlined"
                color="info"
                onClick={handleCloseConfirmDialog}
              >
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={deleteLead}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
