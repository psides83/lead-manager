//Imports
import React, { useContext, useState } from "react";
import {
  addEquipmentInputs,
  addLeadInputs,
  closeOutcomeArray,
  closeReasonArray,
  leadStatusArray,
} from "../../../models/static-data";
import { styled } from "@mui/material/styles";
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
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  AddCircleOutlined,
  AddTaskRounded,
  PersonAddAltRounded,
  CheckRounded,
  SaveRounded,
  CheckCircleOutlineRounded,
  NotesRounded,
} from "@mui/icons-material";
import { AuthContext } from "../../../state-management/auth-context-provider";
import AddLeadViewModel from "./add-lead-view-model";
import EquipmentIcon from "../../ui-components/equipment-icon";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function AddLead(props) {
  //#region State Properties
  const { setMessage, setOpenSuccess, setOpenError } = props;
  const { currentUser, userProfile } = useContext(AuthContext);
  var [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Lead Created",
    notes: "",
    willFinance: false,
    hasTrade: false,
    willPurchase: false,
    closeOutcome: "",
    closeReason: "",
    closeCompetitor: "",
    closeNotes: "",
  });

  var [equipment, setEquipment] = useState({
    model: "",
    stock: "",
    serial: "",
    quotePrice: "",
    availability: "Availability Unknown",
    status: "Equipment added",
    notes: "",
    willSubmitPDI: false,
    hasSubmittedPDI: false,
  });
  var [equipmentList, setEquipmentList] = useState([]);
  var [taskNote, setTaskNote] = useState("");
  var [taskNoteList, setTaskNoteList] = useState([]);
  const [leadEntryMode, setLeadEntryMode] = useState("equipment");
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [loadingLead, setLoadingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [equipmentSuccess, setEquipmentSuccess] = useState(false);
  // handles closing of add lead dialog
  const handleCloseDialog = () => {
    setIsShowingDialog(false);
    viewModel.resetCompleteForm();
  };

  const viewModel = new AddLeadViewModel(
    setMessage,
    setOpenSuccess,
    setOpenError,
    currentUser,
    userProfile,
    leadData,
    setLeadData,
    equipment,
    setEquipment,
    equipmentList,
    setEquipmentList,
    handleCloseDialog,
    setLoadingLead,
    setLeadSuccess,
    setLoadingEquipment,
    setEquipmentSuccess,
    taskNote,
    setTaskNote,
    taskNoteList,
    setTaskNoteList
  );
  //#endregion

  // handles opening of the add lead dialog
  const handleToggleDialog = () => {
    setLeadSuccess(false);
    setIsShowingDialog(!isShowingDialog);
    console.log(equipmentList);
  };

  // UI view of the submission form
  return (
    <>
      <Tooltip title="Add New Lead">
        <Button
          color="inherit"
          onClick={handleToggleDialog}
          endIcon={<PersonAddAltRounded color="inherit" />}
          sx={{ whiteSpace: "nowrap" }}
        >
          <Typography sx={{ display: { xs: "none", md: "block" }, whiteSpace: "nowrap" }}>
            Add Lead
          </Typography>
        </Button>
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
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, pt: 2 }}>
          <DialogTitle sx={{ p: 0 }} variant="h5">
            Add Lead
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
                  {addLeadInputs
                    .filter((input) => input.id !== "quoteLink")
                    .map((input) => (
                      <Grid item key={input.id} xs={input.gridXS} sm={input.gridSM}>
                        <TextField
                          required={input.required}
                          fullWidth
                          autoFocus={input.autoFocus}
                          size="small"
                          id={input.id}
                          name={`lm-${input.id}`}
                          label={input.label}
                          type={input.type}
                          variant="outlined"
                          select={input.select}
                          multiline={input.id === "notes"}
                          minRows={input.id === "notes" ? 3 : undefined}
                          autoComplete="off"
                          value={viewModel.handleLeadValues(input.id)}
                          onChange={(e) => viewModel.handleInput(e, input.id)}
                          slotProps={{
                            input: {
                              ...(input.inputProps || {}),
                            },
                            htmlInput: {
                              autoComplete: "new-password",
                              name: `lm-${input.id}`,
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
                          value={option.title}
                        />
                      }
                      label={<Typography sx={{ fontSize: 14 }}>{option.title}</Typography>}
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Grid container spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {leadEntryMode === "equipment" ? viewModel.heading() : "Tasks / Notes on Lead"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      id="leadEntryMode"
                      label="Add to lead"
                      value={leadEntryMode}
                      onChange={(e) => setLeadEntryMode(e.target.value)}
                    >
                      <MenuItem value="equipment">Equipment</MenuItem>
                      <MenuItem value="taskNote">Task / Note</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1.25 }} />

                {leadEntryMode === "equipment" ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        listStyle: "none",
                        p: 0,
                        m: 0,
                        mb: 1,
                      }}
                      component="ul"
                    >
                      {equipmentList.map((data) => {
                        const icon = <EquipmentIcon model={data.model} />;
                        return (
                          <ListItem key={data.id}>
                            <Chip
                              icon={icon}
                              label={
                                <Typography sx={{ fontWeight: 500, fontSize: 16 }}>
                                  {data.model}
                                </Typography>
                              }
                              variant="outlined"
                              color="primary"
                              onDelete={viewModel.handleDelete(data)}
                              sx={{
                                minHeight: 44,
                                height: "auto",
                                py: 0.5,
                                alignItems: "center",
                                "& .MuiChip-icon": {
                                  width: 34,
                                  height: 34,
                                  ml: 0.75,
                                  mr: 0.5,
                                },
                                "& .MuiChip-label": {
                                  py: 0.5,
                                  display: "flex",
                                  alignItems: "center",
                                },
                              }}
                            />
                          </ListItem>
                        );
                      })}
                    </Box>

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
                            name={`lm-equipment-${input.id}`}
                            label={input.label}
                            variant="outlined"
                            autoComplete="off"
                            onChange={(e) => viewModel.handleEquipmentInput(e, input.id)}
                            value={viewModel.handleEquipmentValues(input.id)}
                            slotProps={{
                              htmlInput: {
                                ...(input.inputProps || {}),
                                autoComplete: "new-password",
                                name: `lm-equipment-${input.id}`,
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
                  </>
                ) : (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        listStyle: "none",
                        p: 0,
                        m: 0,
                        mb: 1,
                      }}
                      component="ul"
                    >
                      {taskNoteList.map((data) => (
                        <ListItem key={data.id}>
                          <Chip
                            icon={<NotesRounded />}
                            label={
                              <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                                {data.task}
                              </Typography>
                            }
                            variant="outlined"
                            color="primary"
                            onDelete={viewModel.handleDeleteTaskNote(data)}
                            sx={{
                              minHeight: 40,
                              height: "auto",
                              py: 0.5,
                              maxWidth: "100%",
                              "& .MuiChip-label": {
                                py: 0.5,
                                whiteSpace: "normal",
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      size="small"
                      id="taskNote"
                      label="Task / Note"
                      value={taskNote}
                      onChange={(e) => viewModel.handleTaskNoteInput(e)}
                    />
                  </>
                )}
              </Box>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ position: "relative" }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled={
                        leadEntryMode === "equipment"
                          ? equipment.model === "" || loadingEquipment
                          : taskNote.trim() === "" || loadingEquipment
                      }
                      color="primary"
                      startIcon={
                        equipmentSuccess ? (
                          <CheckCircleOutlineRounded />
                        ) : leadEntryMode === "equipment" ? (
                          <AddCircleOutlined />
                        ) : (
                          <AddTaskRounded />
                        )
                      }
                      onClick={(e) =>
                        leadEntryMode === "equipment"
                          ? viewModel.equipmentSubmitValidation(e)
                          : viewModel.taskNoteSubmitValidation(e)
                      }
                    >
                      {loadingEquipment && (
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
                      {equipmentSuccess
                        ? "Successfully Added"
                        : leadEntryMode === "equipment"
                        ? "Add More Equipment"
                        : "Add Task / Note"}
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ position: "relative" }}>
                    <Button
                      fullWidth
                      size="small"
                      disabled={
                        leadData.name === "" ||
                        !viewModel.hasRequiredLeadContext() ||
                        loadingLead
                      }
                      variant="contained"
                      endIcon={leadSuccess ? <CheckRounded /> : <SaveRounded />}
                      onClick={(e) => viewModel.leadSubmitValidation(e)}
                    >
                      {loadingLead && (
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
                      {leadSuccess ? "Success" : "Save"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
