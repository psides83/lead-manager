//Imports
import React, { useContext, useState } from "react";
import {
  addEquipmentInputs,
  addLeadInputs,
  leadStatusArray,
} from "../../../models/arrays";
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
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Agriculture,
  AddCircleOutlined,
  PersonAddAltRounded,
  CheckRounded,
  SaveRounded,
  CheckCircleOutlineRounded,
} from "@mui/icons-material";
import { AuthContext } from "../../../state-management/auth-context-provider";
import AddLeadViewModel from "./add-lead-view-model";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function AddLead(props) {
  //#region State Properties
  const { setMessage, setOpenSuccess, setOpenError } = props;
  const { userProfile } = useContext(AuthContext);
  var [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Lead Created",
    notes: "",
    willFinance: false,
    hasTrade: false,
    willPurchase: false,
  });

  var [equipment, setEquipment] = useState({
    model: "",
    stock: "",
    serial: "",
    availability: "Availability Unknown",
    status: "Equipment added",
    notes: "",
  });
  var [equipmentList, setEquipmentList] = useState([]);
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
    setEquipmentSuccess
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
        >
          <Typography sx={{ display: { xs: "none", sm: "block" } }}>
            Add Lead
          </Typography>
        </Button>
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
            <DialogTitle variant="h4">Add Lead</DialogTitle>
            <IconButton sx={{ height: 44 }} onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Stack>
          <Grid container spacing={2}>
            {addLeadInputs
              .filter((input) => {
                if (input.id !== "quoteLink") {
                  return input;
                }
                return null;
              })
              .map((input) => (
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
                    value={viewModel.handleLeadValues(input.id)}
                    onChange={(e) => viewModel.handleInput(e, input.id)}
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
                    label={
                      <Typography style={{ fontSize: 14 }}>
                        {option.title}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              style={{ marginBottom: "-20px" }}
            >
              <Stack mb={1}>
                <Typography component="h1" variant="h6">
                  {viewModel.heading()}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  listStyle: "none",
                  p: 0.5,
                  m: 0,
                }}
                component="ul"
              >
                {equipmentList.map((data) => {
                  let icon = <Agriculture />;

                  return (
                    <ListItem key={data.id}>
                      <Chip
                        icon={icon}
                        label={data.model}
                        variant="outlined"
                        color="primary"
                        // size="small"
                        onDelete={viewModel.handleDelete(data)}
                      />
                    </ListItem>
                  );
                })}
              </Box>
            </Grid>

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

            <Grid item xs={12} sm={8}>
              <Box sx={{ position: "relative" }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={equipment.model === "" || loadingEquipment}
                  color="primary"
                  startIcon={
                    equipmentSuccess ? (
                      <CheckCircleOutlineRounded />
                    ) : (
                      <AddCircleOutlined />
                    )
                  }
                  onClick={(e) => viewModel.equipmentSubmitValidation(e)}
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
                    : "Add More Equipment"}
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
                    (equipment.model === "" && equipmentList.length === 0) ||
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
        </Box>
      </Dialog>
    </>
  );
}
