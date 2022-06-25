//Imports
import React, { useCallback, useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { setDoc, doc } from "@firebase/firestore";
import moment from "moment";
import {
  addEquipmentInputs,
  equipmentAvailabilityArray,
  equipmentStatusArray,
} from "../../models/arrays";
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
  ListItemButton,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  AddCircleOutlineRounded,
  CheckRounded,
  Close,
  DeleteRounded,
  SaveRounded,
} from "@mui/icons-material";

export default function EquipmentForm(props) {
  //#region State Properties
  const {
    lead,
    equipment,
    setValidationMessage,
    setOpenSuccess,
    setOpenError,
  } = props;
  var [equipmentData, setEquipmentData] = useState({
    model: "",
    stock: "",
    serial: "",
    availability: "Availability Unknown",
    status: "Equipment added",
    notes: "",
    changeLog: [],
  });
  var [change, setChange] = useState([]);
  const [importedData, setImportedData] = useState({});
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [isShowingConfirmDialog, setIsShowingConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  //#endregion

  const handleCloseDialog = async () => {
    setIsShowingDialog(false);
    setIsShowingConfirmDialog(false);
    resetLeadForm();
  };

  const handleToggleDialog = () => {
    setSuccess(false);
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
    if (isShowingDialog && equipment) {
      setEquipmentData({
        model: equipment.model,
        stock: equipment.stock,
        serial: equipment.serial,
        availability: equipment.availability,
        notes: equipment.notes,
        status: equipment.status,
        changeLog: equipment.changeLog,
      });
      setImportedData({
        model: equipment.model,
        stock: equipment.stock,
        serial: equipment.serial,
        availability: equipment.availability,
        notes: equipment.notes,
        status: equipment.status,
      });
    }
  }, [isShowingDialog, equipment]);

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
    if (equipmentData.model !== importedData.model) {
      setChange(
        change.push(
          `Model edited from ${
            importedData.model === "" ? "BLANK" : importedData.model
          } to ${equipmentData.model === "" ? "BLANK" : equipmentData.model}`
        )
      );
    }

    if (equipmentData.stock !== importedData.stock) {
      setChange(
        change.push(
          `Stock # for ${equipmentData.model} edited from ${
            importedData.stock === "" ? "BLANK" : importedData.stock
          } to ${equipmentData.stock === "" ? "BLANK" : equipmentData.stock}`
        )
      );
    }

    if (equipmentData.serial !== importedData.serial) {
      setChange(
        change.push(
          `Serial # for ${equipmentData.model} edited from ${
            importedData.serial === "" ? "BLANK" : importedData.serial
          } to ${equipmentData.serial === "" ? "BLANK" : equipmentData.serial}`
        )
      );
    }

    if (equipmentData.status !== importedData.status) {
      setChange(
        change.push(
          `Status of ${equipmentData.model} updated from ${importedData.status} to ${equipmentData.status}`
        )
      );
    }

    if (equipmentData.notes !== importedData.notes) {
      setChange(
        change.push(
          `Notes on ${equipmentData.model} edited from ${
            importedData.notes === "" ? "BLANK" : importedData.notes
          } to ${equipmentData.notes === "" ? "BLANK" : equipmentData.notes}`
        )
      );
    }

    if (equipmentData.availability !== importedData.availability) {
      setChange(
        change.push(
          `Availability of ${equipmentData.model} updated from ${importedData.availability} to ${equipmentData.availability}`
        )
      );
    }
  };

  // Add the equipment to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
  const setEquipmentToFirestore = async () => {
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = equipment ? equipment.id : moment().format("yyyyMMDDHHmmss");
    logChanges();
    var changeString = change.toString().replace(/,/g, ", ");

    if (changeString[0] === ",") {
      changeString = changeString.substring(1).trim();
    }

    equipmentData.changeLog.push({
      id: id,
      change: equipment ? changeString : `${equipmentData.model} added`,
      timestamp: timestamp,
    });

    var leadChangeLog = lead.changeLog;

    leadChangeLog.push({
      id: moment().format("yyyyMMDDHHmmss"),
      change: equipment ? changeString : `${equipmentData.model} added`,
      timestamp: timestamp,
    });

    equipmentData.id = id;
    equipmentData.timestamp = timestamp;

    if (equipment) {
      const currentEquipmentIndex = lead.equipment.indexOf(equipment);
      lead.equipment[currentEquipmentIndex] = equipmentData;
    } else {
      lead.equipment.push(equipmentData);
    }

    const leadRef = doc(db, "leads", lead?.id);

    await setDoc(
      leadRef,
      { equipment: lead.equipment, changeLog: leadChangeLog },
      { merge: true }
    );
  };

  // Reset the Lead form
  const resetLeadForm = () => {
    setEquipmentData({
      model: "",
      stock: "",
      serial: "",
      availability: "Availability Unknown",
      status: "Equipment added",
      notes: "",
      changeLog: [],
    });
    setChange([]);
    setImportedData({});
  };

  

  // Requst submission validation.
  const equipmentSubmitValidation = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (equipmentData.model === "") {
      setValidationMessage("Equipment must have a model");
      setOpenError(true);
      return;
    } else {
      await setEquipmentToFirestore();
      setSuccess(true);
      setValidationMessage("lead successfully edited");
      setOpenSuccess(true);
      setLoading(false);
      handleCloseDialog();
    }
  };

  const buttonIsDisabled = () => {
    if (loading) return true;

    if (equipmentData.model !== importedData.model) return false;
    if (equipmentData.stock !== importedData.stock) return false;
    if (equipmentData.serial !== importedData.serial) return false;
    if (equipmentData.status !== importedData.status) return false;
    if (equipmentData.availability !== importedData.availability) return false;
    if (equipmentData.notes !== importedData.notes) return false;
    return true;
  };

  // handles the onChange of the equipment inputs
  const handleEquipmentInput = (e, id) => {
    var value = e.target.value;

    if (id === "model" || id === "serial") {
      const newValue = e.target.value;
      value = newValue.toUpperCase();
    }

    if (id === "stock") {
      const newValue = e.target.value;
      value = newValue.replace(/[^0-9]/g, "");
    }

    setEquipmentData({ ...equipmentData, [id]: value });
  };

  // handles equipment object values for the inputs
  const handleEquipmentValues = (id) => {
    switch (id) {
      case "model":
        return equipmentData.model;
      case "stock":
        return equipmentData.stock;
      case "serial":
        return equipmentData.serial;
      case "status":
        return equipmentData.status;
      case "availability":
        return equipmentData.availability;
      case "notes":
        return equipmentData.notes;
      default:
        return "";
    }
  };

  // sets the array for the equipment select inputs
  const equipmentSelectArray = (id) => {
    switch (id) {
      case "status":
        return equipmentStatusArray;
      case "availability":
        return equipmentAvailabilityArray;
      default:
        return null;
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
            {addEquipmentInputs.map((input) => (
              <Grid item key={input.id} xs={input.gridXS} sm={input.gridSM}>
                <TextField
                  required={input.required}
                  fullWidth
                  select={input.select}
                  type={input.type}
                  size="small"
                  id={input.id}
                  name={input.id}
                  label={input.label}
                  labelid={input.id}
                  inputProps={input.inputProps}
                  variant="outlined"
                  onChange={(e) => handleEquipmentInput(e, input.id)}
                  value={handleEquipmentValues(input.id)}
                >
                  {input.select === true
                    ? equipmentSelectArray(input.id)?.map((status, index) => (
                        <MenuItem key={index} value={status}>
                          {status}
                        </MenuItem>
                      ))
                    : null}
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

            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                endIcon={success ? <CheckRounded /> : <SaveRounded />}
                disabled={buttonIsDisabled()}
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
