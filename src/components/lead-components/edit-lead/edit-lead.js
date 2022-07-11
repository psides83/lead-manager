//Imports
import React, { useCallback, useEffect, useState } from "react";
import { db } from "../../../services/firebase";
import { setDoc, doc, deleteDoc } from "@firebase/firestore";
import moment from "moment";
import { addLeadInputs, leadStatusArray } from "../../../models/arrays";
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
import {
  buttonIsDisabled,
  checkBoxes,
  deleteLead,
  handleChange,
  handleInput,
  handleLeadValues,
  leadSubmitValidation,
  loadData,
  resetLeadForm,
} from "./edit-lead-view-model";

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
    resetLeadForm(setLeadData, setChange, setImportedData);
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
    loadData(lead, isShowingDialog, setLeadData, setImportedData, setLoading);
  }, [isShowingDialog, lead]);

  useEffect(() => {
    loadLeadData();
  }, [loadLeadData]);

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
                  value={handleLeadValues(input.id, leadData)}
                  onChange={(e) =>
                    handleInput(e, input.id, leadData, setLeadData)
                  }
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
                {checkBoxes(leadData).map((option) => (
                  <FormControlLabel
                    key={option.id}
                    control={
                      <Checkbox
                        id={option.id}
                        checked={option.checkedState}
                        onChange={(e) => handleChange(e, leadData, setLeadData)}
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
                  disabled={buttonIsDisabled(
                    isShowingDialog,
                    lead,
                    loading,
                    leadData,
                    importedData
                  )}
                  variant="contained"
                  endIcon={success ? <CheckRounded /> : <SaveRounded />}
                  onClick={(e) =>
                    leadSubmitValidation(
                      e,
                      lead,
                      leadData,
                      setLoading,
                      setMessage,
                      setOpenError,
                      setOpenSuccess,
                      handleCloseDialog,
                      resetLeadForm,
                      loadLeadData,
                      setSuccess,
                      setChange, 
                      change,
                      importedData
                    )
                  }
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
              <Button
                variant="contained"
                color="error"
                onClick={(e) =>
                  deleteLead(
                    e,
                    lead,
                    handleCloseConfirmDialog,
                    handleCloseDialog
                  )
                }
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