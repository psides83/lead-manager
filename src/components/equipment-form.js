//Imports
import React, { useCallback, useEffect, useState } from "react";
import { db } from "../services/firebase";
import { setDoc, doc, deleteDoc } from "@firebase/firestore";
// import { useStateValue } from "../state-management/StateProvider";
import moment from "moment";
import {
  equipmentAvailabilityArray,
  equipmentStatusArray,
  leadStatusArray,
} from "../models/arrays";
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
  Container,
  Avatar,
  FormGroup,
  Alert,
  Chip,
  Snackbar,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  AddCircleOutlineRounded,
  CheckRounded,
  Close,
  DeleteRounded,
  EditRounded,
  SaveRounded,
} from "@mui/icons-material";
import { async } from "@firebase/util";
import { PhoneNumberMask } from "./phone-number-mask";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function EquipmentForm(props) {
  //#region State Properties
  const {
    lead,
    equipment,
    setValidationMessage,
    setOpenSuccess,
    setOpenError,
  } = props;
  // const [openSuccess, setOpenSuccess] = useState(false);
  // const [openError, setOpenError] = useState(false);
  var [model, setModel] = useState("");
  var [stock, setStock] = useState("");
  var [serial, setSerial] = useState("");
  var [status, setStatus] = useState("Equipment added");
  var [availability, setAvailability] = useState("Availability Unknown");
  var [notes, setNotes] = useState("");
  var [changeLog, setChangeLog] = useState([]);
  var [change, setChange] = useState([]);
  var [leadEquipment, setLeadEquipment] = useState([]);
  const [importedData, setImportedData] = useState({});
  const [dataHasChanges, setDataHasChanges] = useState(false);
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [isShowingConfirmDialog, setIsShowingConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // var [validationMessage, setValidationMessage] = useState("");
  //#endregion

  const handleCloseDialog = async () => {
    setIsShowingDialog(false);
    setIsShowingConfirmDialog(false);
    resetLeadForm();
  };

  const handleToggleDialog = () => {
    setDataHasChanges(false);
    setSuccess(false)
    setIsShowingDialog(!isShowingDialog);
  };

  const handleCloseConfirmDialog = () => {
    setIsShowingConfirmDialog(false);
  };

  const handleToggleConfirmDialog = () => {
    setIsShowingConfirmDialog(!isShowingConfirmDialog);
  };

  // load data from equipment
  const loadEquipmentData = useCallback(() => {
    if (equipment) {
      setModel(equipment.model);
      setStock(equipment.stock);
      setSerial(equipment.serial);
      setStatus(equipment.status);
      setAvailability(equipment.availability);
      setNotes(equipment.notes);
      setChangeLog(equipment.changeLog);
      setImportedData({
        model: equipment.model,
        stock: equipment.stock,
        serial: equipment.serial,
        availability: equipment.availability,
        notes: equipment.notes,
        status: equipment.status,
      });
    }
  }, [isShowingDialog]);

  useEffect(() => {
    loadEquipmentData();
  }, [loadEquipmentData]);

  const deleteEquipment = async () => {
    const leadRef = doc(db, "leads", lead.id);

    const equipmentIndex = lead.equipment.indexOf(equipment);

    lead.equipment.splice(equipmentIndex, 1);

    await setDoc(leadRef, { equipment: lead.equipment }, { merge: true });

    setIsShowingDialog(false);
  };

  const logChanges = () => {
    if (model !== importedData.model) {
      console.log(importedData);
      setChange(
        change.push(
          `Model edited from ${
            importedData.model === "" ? "BLANK" : importedData.model
          } to ${model === "" ? "BLANK" : model}`
        )
      );
    }
    console.log(change);

    if (stock !== importedData.stock) {
      setChange(
        change.push(
          `Stock # for ${model} edited from ${
            importedData.stock === "" ? "BLANK" : importedData.stock
          } to ${stock === "" ? "BLANK" : stock}`
        )
      );
    }

    if (serial !== importedData.serial) {
      setChange(
        change.push(
          `Serial # for ${model} edited from ${
            importedData.serial === "" ? "BLANK" : importedData.serial
          } to ${serial === "" ? "BLANK" : serial}`
        )
      );
    }

    if (status !== importedData.status) {
      setChange(
        change.push(
          `Status of ${model} updated from ${importedData.status} to ${status}`
        )
      );
    }

    if (notes !== importedData.notes) {
      setChange(
        change.push(
          `Notes on ${model} edited from ${
            importedData.notes === "" ? "BLANK" : importedData.notes
          } to ${notes === "" ? "BLANK" : notes}`
        )
      );
    }

    if (availability !== importedData.availability) {
      setChange(
        change.push(
          `Availability of ${model} updated from ${importedData.availability} to ${availability}`
        )
      );
    }
  };

  // Add the equipment to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
  const setEquipmentToFirestore = async () => {
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = equipment ? equipment.id : moment().format("yyyyMMDDHHmmss");
    logChanges();
    console.log("you made it here");
    var changeString = change.toString().replace(/,/g, ", ");

    if (changeString[0] === ",") {
      changeString = changeString.substring(1).trim();
    }

    changeLog.push({
      id: id,
      change: equipment ? changeString : `${model} added`,
      timestamp: timestamp,
    });

    lead.changeLog.push({
      id: moment().format("yyyyMMDDHHmmss"),
      change: equipment ? changeString : `${model} added`,
      timestamp: timestamp,
    });

    const editedEquipment = {
      id: id,
      model: model,
      stock: stock,
      serial: serial,
      status: status,
      availability: availability,
      notes: notes,
      changeLog: changeLog,
    };

    if (equipment) {
      const currentEquipmentIndex = lead.equipment.indexOf(equipment);
      lead.equipment[currentEquipmentIndex] = editedEquipment;
    } else {
      lead.equipment.push(editedEquipment);
    }

    const leadRef = doc(db, "leads", lead?.id);

    await setDoc(
      leadRef,
      { equipment: lead.equipment, changeLog: lead.changeLog },
      { merge: true }
    );

    // setIsShowingDialog(false);
    setLoading(false)
    setSuccess(true)
    setValidationMessage("lead successfully edited");
    setOpenSuccess(true);
    handleCloseDialog();

    // sendNewleadEmail(
    //   timestamp,
    //   equipmentList,
    //   fullName,
    //   userProfile,
    //   salesman
    // );
    // resetLeadForm();
  };

  // Reset the Lead form
  const resetLeadForm = () => {
    setModel("");
    setStock("");
    setSerial("");
    setStatus("");
    setNotes("");
    setAvailability("");
    setChangeLog([]);
    setChange([])
    setImportedData({});
    setDataHasChanges(false);
  };

  // Requst submission validation.
  const equipmentSubmitValidation = async (event) => {
    event.preventDefault();
    setLoading(true)

    const lowerCaseLetters = /[a-z]/g;
    const upperCaseLetters = /[A-Z]/g;

    if (model === "") {
      setValidationMessage("Equipment must have a model");
      setOpenError(true);
      return;
    } else {
      await setEquipmentToFirestore();
    }
  };

  // Handle lead model input and capitolize each word
  const handleModelInput = (e) => {
    setModel(e.target.value.toUpperCase());

    if (e.target.value !== importedData.model) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.model) {
      setDataHasChanges(false);
    }
  };

  // Handle lead stock input and capitolize each word
  const handleStockInput = (e) => {
    setStock(e.target.value);

    if (e.target.value !== importedData.stock) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.stock) {
      setDataHasChanges(false);
    }
  };

  // Handle lead serial input and capitolize each word
  const handleSerialInput = (e) => {
    setSerial(e.target.value.toUpperCase());

    if (e.target.value !== importedData.serial) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.serial) {
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

  // Handle lead status change and capitolize each word
  const handleStatusChange = (e) => {
    setStatus(e.target.value);

    if (e.target.value !== importedData.status) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.status) {
      setDataHasChanges(false);
    }
  };

  // Handle lead availability change and capitolize each word
  const handleAvailabilityChange = (e) => {
    setAvailability(e.target.value);

    if (e.target.value !== importedData.availability) {
      setDataHasChanges(true);
    } else if (e.target.value === importedData.availability) {
      setDataHasChanges(false);
    }
  };

  // UI view of the submission form
  return (
    <>
      {!equipment ? (
        <Tooltip title="Add Equipment">
          <IconButton
            size="small"
            aria-label="edit"
            onClick={handleToggleDialog}
          >
            <AddCircleOutlineRounded color="primary" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Edit Lead">
          <ListItemButton role={undefined} onClick={handleToggleDialog} dense>
            <ListItemText
              id={equipment.id}
              primary={equipment.model}
              secondary={
                <>
                  <Typography
                    sx={{ display: "inline" }}
                    component="span"
                    variant="caption"
                    color="text.primary"
                  >
                    {equipment.status}
                  </Typography>
                  <Typography
                    sx={{ display: "inline" }}
                    component="span"
                    variant="caption"
                    color="text.primary"
                  >
                    {` — ${equipment.availability}`}
                  </Typography>
                </>
              }
            />
          </ListItemButton>
        </Tooltip>
      )}

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
            <DialogTitle variant="h4">
              {!equipment ? "Add Equipment" : "Edit Equipment"}
            </DialogTitle>
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
                id="model"
                name="model"
                label="Model"
                variant="outlined"
                onChange={handleModelInput}
                value={model}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="stock"
                name="stock"
                label="Stock"
                variant="outlined"
                onChange={handleStockInput}
                value={stock}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                id="serial"
                name="serial"
                label="Serial"
                variant="outlined"
                onChange={handleSerialInput}
                value={serial}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="equipStatus"
                variant="outlined"
                labelid="equipStatus"
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
                {equipmentStatusArray.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="equipAvailability"
                variant="outlined"
                labelid="equipAvailability"
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
                label="Availabitly"
                value={availability}
                onChange={handleAvailabilityChange}
              >
                {equipmentAvailabilityArray.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                type="text"
                size="small"
                id="eqNotes"
                name="eqNotes"
                label="Equipment Notes"
                variant="outlined"
                value={notes}
                onChange={handleNotesInput}
              />
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

            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                endIcon={success ? <CheckRounded /> : <SaveRounded />}
                disabled={!dataHasChanges || loading}
                onClick={equipmentSubmitValidation}
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
              <Button
                variant="contained"
                color="error"
                onClick={deleteEquipment}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
