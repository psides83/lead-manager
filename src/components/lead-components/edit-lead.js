//Imports
import React, { useCallback, useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { setDoc, doc, deleteDoc } from "@firebase/firestore";
import moment from "moment";
import { addLeadInputs, leadStatusArray } from "../../models/arrays";
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
} from "@mui/material";
import {
  CheckRounded,
  Close,
  DeleteRounded,
  EditRounded,
  SaveRounded,
} from "@mui/icons-material";

export default function EditLead(props) {
  //#region State Properties
  const { lead, setMessage, setOpenSuccess, setOpenError } = props;
  var [change, setChange] = useState([]);
  var [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Lead Created",
    notes: "",
    quoteLink: "",
    willFinance: false,
    hasTrade: false,
    willPurchase: false,
    changeLog: [],
  });
  const [importedData, setImportedData] = useState({});
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [isShowingConfirmDialog, setIsShowingConfirmDialog] = useState(false);
  var [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  //#endregion

  const handleCloseDialog = () => {
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
  const loadLeadData = useCallback(() => {
    if (lead && isShowingDialog) {
      setLeadData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        notes: lead.notes,
        quoteLink: lead.quoteLink === undefined ? "" : lead.quoteLink,
        willFinance: lead.willFinance,
        hasTrade: lead.hasTrade,
        willPurchase: lead.willPurchase,
        changeLog: lead.changeLog,
      });
      setImportedData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        notes: lead.notes,
        quoteLink: lead.quoteLink === undefined ? "" : lead.quoteLink,
        willFinance: lead.willFinance,
        hasTrade: lead.hasTrade,
        willPurchase: lead.willPurchase,
        changeLog: lead.changeLog,
      });
      setLoading(false)
    }
  }, [isShowingDialog, lead]);

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
      id: "willFinance",
      title: "Financed",
      checkedState: leadData.willFinance,
    },
    {
      id: "hasTrade",
      title: "Has trade",
      checkedState: leadData.hasTrade,
    },
    {
      id: "willPurchase",
      title: "Will Purchase",
      checkedState: leadData.willPurchase,
    },
  ];

  // Handle changes in the checkboxes.
  const handleChange = (event) => {
    const id = event.target.id;

    switch (id) {
      case "willFinance":
        if (!leadData.willFinance) {
          setLeadData({ ...leadData, [id]: true });
        } else {
          setLeadData({ ...leadData, [id]: false });
        }
        break;
      case "hasTrade":
        if (!leadData.hasTrade) {
          setLeadData({ ...leadData, [id]: true });
        } else {
          setLeadData({ ...leadData, [id]: false });
        }
        break;
      case "willPurchase":
        if (!leadData.willPurchase) {
          setLeadData({ ...leadData, [id]: true });
        } else {
          setLeadData({ ...leadData, [id]: false });
        }
        break;
      default:
        break;
    }
  };

  // builds chang log data for values that have changed
  const logChanges = () => {
    if (leadData.name !== importedData.name) {
      setChange(
        change.push(
          `Name edited from ${
            importedData.name === "" ? "BLANK" : importedData.name
          } to ${leadData.name === "" ? "BLANK" : leadData.name}`
        )
      );
    }

    if (leadData.email !== importedData.email) {
      setChange(
        change.push(
          `Email edited from ${
            importedData.email === "" ? "BLANK" : importedData.email
          } to ${leadData.email === "" ? "BLANK" : leadData.email}`
        )
      );
    }

    if (leadData.phone !== importedData.phone) {
      setChange(
        change.push(
          `Phone # edited from ${
            importedData.phone === "" ? "BLANK" : importedData.phone
          } to ${leadData.phone === "" ? "BLANK" : leadData.phone}`
        )
      );
    }

    if (leadData.status !== importedData.status) {
      setChange(
        change.push(
          `status updated from ${importedData.status} to ${leadData.status}`
        )
      );
    }

    if (leadData.notes !== importedData.notes) {
      setChange(
        change.push(
          `Notes edited from ${
            importedData.notes === "" ? "BLANK" : importedData.notes
          } to ${leadData.notes === "" ? "BLANK" : leadData.notes}`
        )
      );
    }

    if (leadData.quoteLink !== importedData.quoteLink) {
      setChange(
        change.push(
          `Quote Link edited from ${
            importedData.quoteLink === "" ? "BLANK" : importedData.quoteLink
          } to ${leadData.quoteLink === "" ? "BLANK" : leadData.quoteLink}`
        )
      );
    }

    if (leadData.willFinance !== importedData.willFinance) {
      setChange(
        change.push(
          `Fill Finance edited from ${importedData.willFinance} to ${leadData.willFinance}`
        )
      );
    }

    if (leadData.hasTrade !== importedData.hasTrade) {
      setChange(
        change.push(
          `Has Trade edited from ${importedData.hasTrade} to ${leadData.hasTrade}`
        )
      );
    }

    if (leadData.willPurchase !== importedData.willPurchase) {
      setChange(
        change.push(
          `Will Purchase edited from ${importedData.willPurchase} to ${leadData.willPurchase}`
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

    leadData.changeLog.push({
      id: id,
      change: changeString,
      timestamp: timestamp,
    });

    const leadRef = doc(db, "leads", lead.id);

    await setDoc(leadRef, leadData, { merge: true });
  };

  // Reset the Lead form
  const resetLeadForm = async () => {
    setLeadData({
      name: "",
      email: "",
      phone: "",
      status: "Lead Created",
      notes: "",
      quoteLink: "",
      willFinance: false,
      hasTrade: false,
      willPurchase: false,
    });
    setChange([]);
    setImportedData({});
  };

  // Requst submission validation.
  const leadSubmitValidation = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (leadData.name === "") {
      setMessage("Lead must have a name to be created");
      setOpenError(true);
      return;
    } else {
      await setLeadToFirestore().then(() => {
        setLoading(false);
        setSuccess(true);
        setMessage("lead successfully edited");
        setOpenSuccess(true);
        handleCloseDialog();
        resetLeadForm();
      }).catch((error) => {
        loadLeadData()
        setLoading(false);
        setMessage(`${error}`);
        setOpenError(true);
      })
    }
  };

  // sets the state of the save button based on whether data in the form has changed or is being saved
  const buttonIsDisabled = () => {
    if (isShowingDialog && lead) {

      if (loading) return true;
  
      if (leadData.name !== importedData.name) return false;
      if (leadData.email !== importedData.email) return false;
      if (leadData.phone !== importedData.phone) return false;
      if (leadData.status !== importedData.status) return false;
      if (leadData.quoteLink !== importedData.quoteLink) return false;
      if (leadData.notes !== importedData.notes) return false;
      if (leadData.willFinance !== importedData.willFinance) return false;
      if (leadData.hasTrade !== importedData.hasTrade) return false;
      if (leadData.willPurchase !== importedData.willPurchase) return false;
      return true;
    }
  };

  // handle the onChange for the lead inputs
  const handleInput = (e, id) => {
    var value = e.target.value;

    if (id === "name") {
      const names = e.target.value;

      value = names.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
        letter.toUpperCase()
      );
    }

    setLeadData({ ...leadData, [id]: value });
  };

  //  handles the leadData object values for the lead inputs
  const handleLeadValues = (id) => {
    switch (id) {
      case "name":
        return leadData.name;
      case "phone":
        return leadData.phone;
      case "email":
        return leadData.email;
      case "status":
        return leadData.status;
      case "notes":
        return leadData.notes;
      case "quoteLink":
        return leadData.quoteLink;
      default:
        return "";
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
            {addLeadInputs.map((input) => (
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
                  value={handleLeadValues(input.id)}
                  onChange={(e) => handleInput(e, input.id)}
                  InputProps={input.inputProps}
                >
                  {input.id === "status"
                    ? leadStatusArray.map((status, index) => (
                        <MenuItem key={index} value={status}>
                          {status}
                        </MenuItem>
                      ))
                    : null}
                </TextField>
              </Grid>
            ))}

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
                  disabled={buttonIsDisabled()}
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
