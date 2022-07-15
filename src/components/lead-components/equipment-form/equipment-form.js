//Imports
import React, { useCallback, useEffect, useState } from "react";
import { addEquipmentInputs } from "../../../models/static-data";
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
import EquipmentFormViewModel from "./equipment-form-view-model";
import PDIRequestCheckboxes from "./pdi-request-checkboxes";

export default function EquipmentForm(props) {
  //#region State Properties
  const { lead, equipment, setMessage, setOpenSuccess, setOpenError } = props;
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // var [work, setWork] = useState([]);
  var [other, setOther] = useState("");
  //#endregion

  const handleCloseDialog = async () => {
    setIsShowingDialog(false);
    setIsShowingConfirmDialog(false);
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
    handleCloseDialog
  );

  // load data from equipment
  const loadEquipmentData = useCallback(() => {
    if (isShowingDialog && equipment) {
      var importedWork = []
      if (equipment.work && !equipment.work.every((item) => item === null)) {
        importedWork.push(equipment.work)
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
        work: importedWork.toString(),
        pdiNotes: equipment.pdiNotes ? equipment.pdiNotes : "",
      });
      if (equipment.work?.length === 8) {
        setOther(equipment.work[7])
      }
      console.log(equipment.work)
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
                  onChange={(e) => viewModel.handleEquipmentInput(e, input.id)}
                  value={viewModel.handleEquipmentValues(input.id)}
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

            <PDIRequestCheckboxes
              equipmentData={equipmentData}
              setEquipmentData={setEquipmentData}
              other={other}
              setOther={setOther}
            />

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
                disabled={viewModel.buttonIsDisabled()}
                onClick={(e) => viewModel.equipmentSubmitValidation(e)}
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
                onClick={(e) => viewModel.deleteEquipment(e)}
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
