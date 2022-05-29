//Imports
import React, { useCallback, useEffect, useRef, useState } from "react";
import { db } from "../../services/firebase";
import { setDoc, doc, deleteDoc } from "@firebase/firestore";
// import { useStateValue } from "../state-management/StateProvider";
import moment from "moment";
import { leadStatusArray } from "../../models/arrays";
// import { sendNewleadEmail } from "../services/email-service";
import { styled } from "@mui/material/styles";
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
  Checkbox,
  FormControlLabel,
  CircularProgress,
  // Container,
  // Avatar,
  // FormGroup,
  // Alert,
  // Chip,
  // Snackbar,
} from "@mui/material";
import {
  CheckRounded,
  Close,
  DeleteRounded,
  EditRounded,
  SaveRounded,
} from "@mui/icons-material";
import { PhoneNumberMask } from "./phone-number-mask";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function EditLead(props) {
  //#region State Properties
  const { lead, setValidationMessage, setOpenSuccess, setOpenError } = props;
  // const [openSuccess, setOpenSuccess] = useState(false);
  // const [openError, setOpenError] = useState(false);
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [phone, setPhone] = useState("");
  var [willFinance, setWillFinance] = useState(false);
  var [hasTrade, setHasTrade] = useState(false);
  var [willPurchase, setWillPurchase] = useState(false);
  var [status, setStatus] = useState("Lead Created");
  var [notes, setNotes] = useState("");
  var [changeLog, setChangeLog] = useState([]);
  var [change, setChange] = useState([]);
  const [importedData, setImportedData] = useState({});
  const [dataHasChanges, setDataHasChanges] = useState(false);
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [isShowingConfirmDialog, setIsShowingConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const timer = useRef();

  // var [validationMessage, setValidationMessage] = useState("");
  //#endregion

  const handleCloseDialog = () => {
    setIsShowingDialog(false);
    setIsShowingConfirmDialog(false);
    resetLeadForm();
    // setSuccess(false);
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
  const loadLeadData = useCallback(() => {
    if (lead) {
      setName(lead.name);
      setPhone(lead.phone);
      setEmail(lead.email);
      setWillFinance(lead.willFinance);
      setHasTrade(lead.hasTrade);
      setWillPurchase(lead.willPurchase);
      setStatus(lead.status);
      setNotes(lead.notes);
      setChangeLog(lead.changeLog);
      setImportedData({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        willFinance: lead.willFinance,
        hasTrade: lead.hasTrade,
        willPurchase: lead.willPurchase,
        status: lead.status,
        notes: lead.notes,
      });
    }
  }, [isShowingDialog]);

  useEffect(() => {
    loadLeadData();
  }, [loadLeadData]);

  // Handle deleting of child record.
  const deleteLead = async () => {
    await deleteDoc(doc(db, "leads", lead?.id));

    handleCloseConfirmDialog();
    handleCloseDialog();
  };

  // Array of work options that populate the checkbox setion of the form.
  var checkBoxes = [
    {
      id: "1",
      title: "Financed",
      checkedState: willFinance,
    },
    {
      id: "2",
      title: "Has trade",
      checkedState: hasTrade,
    },
    {
      id: "3",
      title: "Will Purchase",
      checkedState: willPurchase,
    },
  ];

  // Handle changes in the checkboxes.
  const handleChange = (event) => {
    switch (event.target.id) {
      case "1":
        if (!willFinance) {
          setWillFinance(true);
        } else {
          setWillFinance(false);
        }

        if (event.target.value !== importedData.willFinance) {
          setDataHasChanges(true);
        } else if (event.target.value === importedData.willFinance) {
          setDataHasChanges(false);
        }
        break;
      case "2":
        if (!hasTrade) {
          setHasTrade(true);
        } else {
          setHasTrade(false);
        }

        if (event.target.value !== importedData.hasTrade) {
          setDataHasChanges(true);
        } else if (event.target.value === importedData.hasTrade) {
          setDataHasChanges(false);
        }
        break;
      case "3":
        if (!willPurchase) {
          setWillPurchase(true);
        } else {
          setWillPurchase(false);
        }

        if (event.target.value !== importedData.willPurchase) {
          setDataHasChanges(true);
        } else if (event.target.value === importedData.willPurchase) {
          setDataHasChanges(false);
        }
        break;
      default:
        break;
    }
  };

  const logChanges = () => {
    if (name !== importedData.name) {
      setChange(
        change.push(
          `Name edited from ${
            importedData.name === "" ? "BLANK" : importedData.name
          } to ${name === "" ? "BLANK" : name}`
        )
      );
      console.log("you made it here")
    }

    if (email !== importedData.email) {
      setChange(
        change.push(
          `Email edited from ${
            importedData.email === "" ? "BLANK" : importedData.email
          } to ${email === "" ? "BLANK" : email}`
        )
      );
    }

    if (phone !== importedData.phone) {
      setChange(
        change.push(
          `Phone # edited from ${
            importedData.phone === "" ? "BLANK" : importedData.phone
          } to ${phone === "" ? "BLANK" : phone}`
        )
      );
    }

    if (status !== importedData.status) {
      setChange(
        change.push(`status updated from ${importedData.status} to ${status}`)
      );
    }

    if (notes !== importedData.notes) {
      setChange(
        change.push(
          `Notes edited from ${
            importedData.notes === "" ? "BLANK" : importedData.notes
          } to ${notes === "" ? "BLANK" : notes}`
        )
      );
    }

    if (willFinance !== importedData.willFinance) {
      setChange(
        change.push(
          `Fill Finance edited from ${importedData.willFinance} to ${willFinance}`
        )
      );
    }

    if (hasTrade !== importedData.hasTrade) {
      setChange(
        change.push(
          `Has Trade edited from ${importedData.hasTrade} to ${hasTrade}`
        )
      );
    }

    if (willPurchase !== importedData.willPurchase) {
      setChange(
        change.push(
          `Will Purchase edited from ${importedData.willPurchase} to ${willPurchase}`
        )
      );
    }
  };

  // Add the lead to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
  const setLeadToFirestore = async () => {
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    logChanges();
    var changeString = change.toString().replace(/,/g, ", ");

    if (changeString[0] === ",") {
      changeString = changeString.substring(1).trim();
    }

    console.log(changeString);

    changeLog.push({
      id: id,
      change: changeString,
      timestamp: timestamp,
    });

    const firestoreLead = {
      name: name,
      email: email,
      phone: phone,
      status: status,
      notes: notes,
      willFinance: willFinance,
      hasTrade: hasTrade,
      willPurchase: willPurchase,
      changeLog: changeLog,
    };

    const leadRef = doc(db, "leads", lead.id);

    await setDoc(leadRef, firestoreLead, { merge: true });

    setLoading(false);
    setSuccess(true);
    setValidationMessage("lead successfully edited");
    setOpenSuccess(true);
    // timer.current = window.setTimeout(() => {
      handleCloseDialog();
      resetLeadForm();
    // }, 1000);

    // sendNewleadEmail(
    //   timestamp,
    //   equipmentList,
    //   fullName,
    //   userProfile,
    //   salesman
    // );
  };

  // Reset the Lead form
  const resetLeadForm = async () => {
    setName("");
    setEmail("");
    setPhone("");
    setStatus("Lead Created");
    setNotes("");
    setWillFinance(false);
    setHasTrade(false);
    setWillPurchase(false);
    setChangeLog([]);
    setChange([]);
    setImportedData({});
    setDataHasChanges(false);
  };

  // Requst submission validation.
  const leadSubmitValidation = async (event) => {
    event.preventDefault();
    setLoading(true);

    const lowerCaseLetters = /[a-z]/g;
    const upperCaseLetters = /[A-Z]/g;

    if (name === "") {
      setValidationMessage("Lead must have a name to be created");
      setOpenError(true);
      return;
    } else {
      await setLeadToFirestore();
    }
  };

  // Handle lead name input and capitolize each word
  const handleNameInput = (e) => {
    const names = e.target.value;

    const finalName = names.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
      letter.toUpperCase()
    );

    setName(finalName);

    if (e.target.value !== importedData.name) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.name) {
      setDataHasChanges(false);
    }
  };

  // Handle lead email input and capitolize each word
  const handleEmailInput = (e) => {
    setEmail(e.target.value);

    if (e.target.value !== importedData.email) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.email) {
      setDataHasChanges(false);
    }
  };

  // Handle lead phone input and capitolize each word
  const handlePhoneInput = (e) => {
    setPhone(e.target.value);

    if (e.target.value !== importedData.phone) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.phone) {
      setDataHasChanges(false);
    }
  };

  // Handle lead notes input and capitolize each word
  const handleNotesInput = (e) => {
    setNotes(e.target.value);

    if (e.target.value !== importedData.notes) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.notes) {
      setDataHasChanges(false);
    }
  };

  // Handle lead status input and capitolize each word
  const handleStatusChange = (e) => {
    setStatus(e.target.value);

    if (e.target.value !== importedData.status) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.status) {
      setDataHasChanges(false);
    }
  };

  // UI view of the submission form
  return (
    <>
      <Tooltip title="Edit Lead">
        <IconButton aria-label="edit" onClick={handleToggleDialog}>
          <EditRounded />
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
            <DialogTitle variant="h4">Edit Lead</DialogTitle>
            <IconButton sx={{ height: 44 }} onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                size="small"
                id="name"
                name="name"
                label="Name"
                variant="outlined"
                value={name}
                onChange={handleNameInput}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                size="small"
                id="email"
                name="email"
                label="Email"
                variant="outlined"
                value={email}
                onChange={handleEmailInput}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="tel"
                size="small"
                id="phone"
                name="phone"
                label="Phone"
                variant="outlined"
                value={phone}
                InputProps={{
                  inputComponent: PhoneNumberMask,
                }}
                onChange={handlePhoneInput}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="status"
                variant="outlined"
                labelid="status"
                sx={{
                  "&:before": {
                    borderColor: (theme) => theme.palette.secondary.main,
                  },
                  "&:after": {
                    borderColor: (theme) => theme.palette.secondary.main,
                  },
                  "&:not(.Mui-disabled):hover::before": {
                    borderColor: (theme) => theme.palette.secondary.main,
                  },
                }}
                select
                label="Status"
                value={status}
                onChange={handleStatusChange}
              >
                {leadStatusArray.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                multiline
                size="small"
                id="notes"
                name="notes"
                label="Notes"
                variant="outlined"
                value={notes}
                onChange={handleNotesInput}
              />
            </Grid>

            <Grid item>
              <Stack direction="row">
                {checkBoxes.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    control={
                      <Checkbox
                        id={option.id}
                        checked={option.checkedState}
                        onChange={handleChange}
                        color="primary"
                        value={option.checkedState}
                      />
                    }
                    label={
                      <Typography style={{ fontSize: 14 }}>
                        {option.title}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            </Grid>

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
                  disabled={!dataHasChanges || loading}
                  variant="contained"
                  endIcon={success ? <CheckRounded /> : <SaveRounded />}
                  onClick={leadSubmitValidation}
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
                  {success ? "Success" : loading ? "Saving" : "Save"}
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
