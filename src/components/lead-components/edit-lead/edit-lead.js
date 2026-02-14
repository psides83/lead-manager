//Imports
import React, { useCallback, useEffect, useState } from "react";
import {
  addLeadInputs,
  closeOutcomeArray,
  closeReasonArray,
  leadStatusArray,
} from "../../../models/static-data";
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
import EditLeadViewModel from "./edit-lead-view-model";

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
    closeOutcome: "",
    closeReason: "",
    closeCompetitor: "",
    closeNotes: "",
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
    viewModel.resetLeadForm();
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

  const viewModel = new EditLeadViewModel(
    lead,
    leadData,
    setLeadData,
    importedData,
    setImportedData,
    change,
    setChange,
    loading,
    setLoading,
    setMessage,
    setSuccess,
    setOpenSuccess,
    setOpenError,
    isShowingDialog,
    handleCloseDialog,
    handleCloseConfirmDialog
  );

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
        closeOutcome: lead.closeOutcome || "",
        closeReason: lead.closeReason || "",
        closeCompetitor: lead.closeCompetitor || "",
        closeNotes: lead.closeNotes || "",
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
        closeOutcome: lead.closeOutcome || "",
        closeReason: lead.closeReason || "",
        closeCompetitor: lead.closeCompetitor || "",
        closeNotes: lead.closeNotes || "",
        changeLog: lead.changeLog,
      });
      setLoading(false);
    }
    // eslint-disable-next-line
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
            Edit Lead
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
                  Lead Details
                </Typography>
                <Grid container spacing={1.5}>
                  {addLeadInputs.map((input) => (
                    <Grid item key={input.id} xs={input.gridXS} sm={input.gridSM}>
                      <TextField
                        required={input.required}
                        fullWidth
                        autoFocus={input.autoFocus}
                        size="small"
                        id={input.id}
                        name={`lm-edit-${input.id}`}
                        label={input.label}
                        type={input.type}
                        variant="outlined"
                        select={input.select}
                        autoComplete="off"
                        value={viewModel.handleLeadValues(input.id)}
                        onChange={(e) => viewModel.handleInput(e, input.id)}
                        slotProps={{
                          input: {
                            ...(input.inputProps || {}),
                          },
                          htmlInput: {
                            autoComplete: "new-password",
                            name: `lm-edit-${input.id}`,
                            "data-form-type": "other",
                            "data-lpignore": "true",
                          },
                        }}
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
                </Grid>
              </Box>

              {leadData.status === "Closed" ? (
                <Box sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Close Details
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        select
                        size="small"
                        id="closeOutcome"
                        label="Outcome"
                        value={viewModel.handleLeadValues("closeOutcome")}
                        onChange={(e) => viewModel.handleInput(e, "closeOutcome")}
                      >
                        {closeOutcomeArray.map((outcome) => (
                          <MenuItem key={outcome} value={outcome}>
                            {outcome}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        select
                        size="small"
                        id="closeReason"
                        label="Close Reason"
                        value={viewModel.handleLeadValues("closeReason")}
                        onChange={(e) => viewModel.handleInput(e, "closeReason")}
                      >
                        {closeReasonArray.map((reason) => (
                          <MenuItem key={reason} value={reason}>
                            {reason}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        id="closeCompetitor"
                        label="Competitor (optional)"
                        value={viewModel.handleLeadValues("closeCompetitor")}
                        onChange={(e) => viewModel.handleInput(e, "closeCompetitor")}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        id="closeNotes"
                        label="Close Notes (optional)"
                        multiline
                        minRows={2}
                        value={viewModel.handleLeadValues("closeNotes")}
                        onChange={(e) => viewModel.handleInput(e, "closeNotes")}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ) : null}

              <Box sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Buying Signals
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }}>
                  {viewModel.checkBoxes().map((option) => (
                    <FormControlLabel
                      key={option.id}
                      control={
                        <Checkbox
                          id={option.id}
                          checked={option.checkedState}
                          onChange={(e) => viewModel.handleChange(e)}
                          color="primary"
                          value={option.checkedState}
                        />
                      }
                      label={<Typography sx={{ fontSize: 14 }}>{option.title}</Typography>}
                    />
                  ))}
                </Stack>
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
                      disabled={viewModel.buttonIsDisabled()}
                      variant="contained"
                      endIcon={success ? <CheckRounded /> : <SaveRounded />}
                      onClick={(e) => viewModel.leadSubmitValidation(e)}
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
                      {loading ? "Saving" : success ? "Success" : "Save"}
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
                onClick={(e) => viewModel.deleteLead(e)}
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
