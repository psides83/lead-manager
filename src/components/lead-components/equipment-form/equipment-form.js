//Imports
import React, { useCallback, useContext, useEffect, useState } from "react";
import { addEquipmentInputs } from "../../../models/static-data";
import {
  Box,
  Grid,
  Stack,
  Button,
  Divider,
  DialogContent,
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
  BuildRounded,
  CheckRounded,
  Close,
  DeleteRounded,
  ScheduleRounded,
  SaveRounded,
} from "@mui/icons-material";
import EquipmentFormViewModel from "./equipment-form-view-model";
import PDIRequestCheckboxes from "./pdi-request-checkboxes";
import { AuthContext } from "../../../state-management/auth-context-provider";

export default function EquipmentForm(props) {
  //#region State Properties
  const { lead, equipment, setMessage, setOpenSuccess, setOpenError } = props;
  const { pdiUser, userProfile } = useContext(AuthContext);
  var [equipmentData, setEquipmentData] = useState({
    model: "",
    stock: "",
    serial: "",
    availability: "Availability Unknown",
    status: "Equipment added",
    notes: "",
    willSubmitPDI: false,
    hasSubmittedPDI: false,
    work: [],
    pdiNotes: "",
    changeLog: [],
  });
  var [change, setChange] = useState([]);
  const [importedData, setImportedData] = useState({});
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [isShowingConfirmDialog, setIsShowingConfirmDialog] = useState(false);
  const [isShowingEmptyRequestDialog, setIsShowingEmptyRequestDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // var [work, setWork] = useState([]);
  var [other, setOther] = useState("");
  //#endregion

  const handleCloseDialog = async () => {
    setIsShowingDialog(false);
    setIsShowingConfirmDialog(false);
    setIsShowingEmptyRequestDialog(false);
    viewModel.resetLeadForm();
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

  const handleCloseEmptyRequestDialog = () => {
    setIsShowingEmptyRequestDialog(false);
    setIsShowingDialog(false);
  };

  const willDeleteLeaveEmptyRequest = () => {
    if (!lead?.pdiID) {
      return false;
    }

    const submittedEquipment = (lead?.equipment || []).filter(
      (unit) => unit?.hasSubmittedPDI,
    );

    if (submittedEquipment.length > 0) {
      return Boolean(equipment?.hasSubmittedPDI) && submittedEquipment.length === 1;
    }

    // Fallback for legacy data where hasSubmittedPDI was not consistently set.
    return (lead?.equipment || []).length === 1;
  };

  const handleDeleteEquipment = async (event) => {
    if (willDeleteLeaveEmptyRequest()) {
      setIsShowingConfirmDialog(false);
      setIsShowingEmptyRequestDialog(true);
      return;
    }

    const result = await viewModel.deleteEquipment(event);
    setIsShowingConfirmDialog(false);
    if (result?.deletedEquipment) {
      props?.onEquipmentDeleted?.({
        equipment: result.deletedEquipment,
        equipmentIndex: result.equipmentIndex,
      });
      setMessage("Equipment deleted");
      setOpenSuccess(true);
    }
    if (result?.requestBecameEmpty) {
      setIsShowingEmptyRequestDialog(true);
    }
  };

  const handleDeleteEmptyRequest = async () => {
    await viewModel.deleteEquipment(undefined, { deleteEmptyRequestToo: true });
    setIsShowingEmptyRequestDialog(false);
  };

  const handleKeepEmptyRequest = async () => {
    const result = await viewModel.deleteEquipment();
    if (result?.deletedEquipment) {
      props?.onEquipmentDeleted?.({
        equipment: result.deletedEquipment,
        equipmentIndex: result.equipmentIndex,
      });
      setMessage("Equipment deleted");
      setOpenSuccess(true);
    }
    setIsShowingEmptyRequestDialog(false);
  };

  const viewModel = new EquipmentFormViewModel(
    lead,
    equipment,
    equipmentData,
    setEquipmentData,
    importedData,
    setImportedData,
    change,
    setChange,
    setMessage,
    setOpenSuccess,
    setOpenError,
    loading,
    setLoading,
    setSuccess,
    setIsShowingDialog,
    handleCloseDialog,
    pdiUser,
    userProfile
  );

  // load data from equipment
  const loadEquipmentData = useCallback(() => {
    if (isShowingDialog && equipment) {
      function removeNulls(array) {
        var temp = [];
        if (array !== undefined) {
          for (let i of array) i && temp.push(i);
          return temp.toString().replace(/(^,)|(,$)/g, "");
        }
      }

      setEquipmentData({
        model: equipment.model,
        stock: equipment.stock,
        serial: equipment.serial,
        availability: equipment.availability,
        notes: equipment.notes,
        status: equipment.status,
        willSubmitPDI: equipment.willSubmitPDI ? equipment.willSubmitPDI : false,
        hasSubmittedPDI: equipment.hasSubmittedPDI ? equipment.hasSubmittedPDI : false,
        work: equipment.work && !equipment.work.every((item) => item === null) ? equipment.work : [],
        pdiNotes: equipment.pdiNotes ? equipment.pdiNotes : "",
        changeLog: equipment.changeLog,
      });
      
      setImportedData({
        model: equipment.model,
        stock: equipment.stock,
        serial: equipment.serial,
        availability: equipment.availability,
        notes: equipment.notes,
        status: equipment.status,
        willSubmitPDI: equipment.willSubmitPDI ? equipment.willSubmitPDI : false,
        hasSubmittedPDI: equipment.hasSubmittedPDI ? equipment.hasSubmittedPDI : false,
        work: removeNulls(equipment.work),
        pdiNotes: equipment.pdiNotes ? equipment.pdiNotes : "",
      });
      if (equipment.work?.length === 8) {
        setOther(equipment.work[7])
      }
    }
    // eslint-disable-next-line
  }, [isShowingDialog, equipment]);

  useEffect(() => {
    loadEquipmentData();
  }, [loadEquipmentData]);

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
              primary={
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography component="span">{equipment.model}</Typography>
                  {equipment.willSubmitPDI && !equipment.hasSubmittedPDI ? (
                    <Tooltip title="Pending PDI/Setup submit">
                      <ScheduleRounded
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                    </Tooltip>
                  ) : null}
                  {equipment.hasSubmittedPDI ? (
                    <Tooltip title="On PDI/Setup request">
                      <BuildRounded color="action" sx={{ fontSize: 16 }} />
                    </Tooltip>
                  ) : null}
                </Stack>
              }
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
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            style: { borderRadius: 14 },
            elevation: 24,
          }
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, pt: 2 }}>
          <DialogTitle sx={{ p: 0 }} variant="h5">
            {!equipment ? "Add Equipment" : "Edit Equipment"}
          </DialogTitle>
          <IconButton sx={{ height: 40, width: 40 }} onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </Stack>
        <DialogContent sx={{ p: 2.5, pt: 1.5 }}>
          <Box component="form" autoComplete="off" noValidate>
            <input
              type="text"
              name="fake_username"
              autoComplete="username"
              style={{ display: "none" }}
            />
            <input
              type="password"
              name="fake_password"
              autoComplete="current-password"
              style={{ display: "none" }}
            />

            <Stack spacing={2}>
              <Box sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Equipment Details
                </Typography>
                <Grid container spacing={1.5}>
                  {addEquipmentInputs.map((input) => (
                    <Grid item key={input.id} xs={input.gridXS} sm={input.gridSM}>
                      <TextField
                        required={input.required}
                        fullWidth
                        select={input.select}
                        type={input.type}
                        size="small"
                        id={input.id}
                        name={`lm-equipment-edit-${input.id}`}
                        label={input.label}
                        variant="outlined"
                        autoComplete="off"
                        onChange={(e) => viewModel.handleEquipmentInput(e, input.id)}
                        value={viewModel.handleEquipmentValues(input.id)}
                        slotProps={{
                          htmlInput: {
                            ...(input.inputProps || {}),
                            autoComplete: "new-password",
                            name: `lm-equipment-edit-${input.id}`,
                            "data-form-type": "other",
                            "data-lpignore": "true",
                          },
                        }}
                      >
                        {input.select === true
                          ? viewModel
                              .equipmentSelectArray(input.id)
                              ?.map((status, index) => (
                                <MenuItem key={index} value={status}>
                                  {status}
                                </MenuItem>
                              ))
                          : null}
                      </TextField>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  PDI / Setup
                </Typography>
                <PDIRequestCheckboxes
                  equipmentData={equipmentData}
                  setEquipmentData={setEquipmentData}
                  other={other}
                  setOther={setOther}
                />
              </Box>

              <Divider />

              <Grid container spacing={1.5}>
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
                      variant="contained"
                      color="primary"
                      endIcon={success ? <CheckRounded /> : <SaveRounded />}
                      disabled={viewModel.buttonIsDisabled()}
                      onClick={(e) => viewModel.equipmentSubmitValidation(e)}
                    >
                      {loading && (
                        <CircularProgress
                          size={24}
                          color="primary"
                          sx={{
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
            </Stack>
          </Box>
        </DialogContent>
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
                onClick={handleDeleteEquipment}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
      <Dialog
        onClose={handleCloseEmptyRequestDialog}
        open={isShowingEmptyRequestDialog}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "5px 25px 25px 25px",
          }}
        >
          <DialogTitle>Delete Empty Setup Request?</DialogTitle>

          <div>
            <Typography>This setup request now has no equipment.</Typography>
            <Typography>Do you also want to delete the setup request?</Typography>
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
                onClick={handleKeepEmptyRequest}
              >
                Keep Request
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteEmptyRequest}
              >
                Delete Request
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
