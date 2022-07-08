//Imports
import React, { useContext, useState } from "react";
import { db } from "../../services/firebase";
import { setDoc, doc } from "@firebase/firestore";
import moment from "moment";
import {
  addEquipmentInputs,
  addLeadInputs,
  equipmentAvailabilityArray,
  equipmentStatusArray,
  leadStatusArray,
} from "../../models/arrays";
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
import { AuthContext } from "../../state-management/auth-context-provider";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function AddLead(props) {
  //#region State Properties
  const { setValidationMessage, setOpenSuccess, setOpenError } = props;
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
  var [equipmentList, setEquepmentList] = useState([]);
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [loadingLead, setLoadingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [equipmentSuccess, setEquipmentSuccess] = useState(false);
  //#endregion

  const handleCloseDialog = () => {
    setIsShowingDialog(false);
    resetCompleteForm();
  };

  const handleToggleDialog = () => {
    setLeadSuccess(false);
    setIsShowingDialog(!isShowingDialog);
    console.log(equipmentList);
  };

  // Dynamic heading for the form.
  const heading =
    equipmentList.length === 0 ? "Add Equipment" : "Equipment on Lead";

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

  // Handle deleting of equipment from the lead.
  const handleDelete = (equipmentToDelete) => () => {
    setEquepmentList((equipmentList) =>
      equipmentList.filter((equiment) => equiment.id !== equipmentToDelete.id)
    );
  };

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

  // Add the lead to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
  const setLeadToFirestore = async () => {
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");

    leadData.changeLog = [
      {
        id: id,
        change: `Lead created`,
        timestamp: timestamp,
      },
    ];

    leadData.contactLog = [
      {
        id: id,
        event: "not contacted since added",
        timestamp: timestamp,
      },
    ];

    console.log(equipmentList);

    leadData.id = id;
    leadData.timestamp = timestamp;
    leadData.salesmanID = userProfile.id;
    leadData.quoteLink = "";
    leadData.equipment = equipmentList;

    console.table(leadData);

    const leadRef = doc(db, "leads", leadData.id);

    await setDoc(leadRef, leadData, { merge: true });
  };

  // Reset complete form
  const resetCompleteForm = async () => {
    await resetEquipmentForm();
    await resetLeadForm();
    setEquepmentList([]);
  };

  // Reset the Lead form
  const resetLeadForm = async () => {
    setLeadData({
      name: "",
      email: "",
      phone: "",
      status: "Lead Created",
      notes: "",
      willFinance: false,
      hasTrade: false,
      willPurchase: false,
    });
  };

  // Reset the Equipment form
  const resetEquipmentForm = async () => {
    setEquipmentSuccess(false);
    setEquipment({
      model: "",
      stock: "",
      serial: "",
      availability: "Availability Unknown",
      status: "Equipment added",
      notes: "",
    });
  };

  // Push equipment to a state array to later be set to firestore "equipment" collection with the "leads" collection.
  const pushEquipmentToLead = async () => {
    const id = moment().format("yyyyMMDDHHmmss");
    const changeLog = [
      {
        id: id,
        change: `Equipment added to lead`,
        timestamp: moment().format("DD-MMM-yyyy hh:mmA"),
      },
    ];

    equipment.id = id;
    equipment.changeLog = changeLog;

    equipmentList.push(equipment);
    setEquepmentList(equipmentList);
    console.log("Temp EQ");
    console.log(equipmentList);

    await resetEquipmentForm();
    setLoadingEquipment(false);
    setEquipmentSuccess(true);
  };

  // Squipment submission validation.
  const equipmentSubmitValidation = async (event) => {
    event.preventDefault();
    setLoadingEquipment(true);

    if (equipment.model === "") {
      setValidationMessage("Equipment must have a model to be added to a lead");
      setOpenError(true);
      return;
    } else {
      pushEquipmentToLead();
      const lastIndex = equipmentList[equipmentList.length - 1]?.model;
      setValidationMessage(lastIndex + " successfully added to the lead");
      setOpenSuccess(true);
    }
  };

  // Requst submission validation.
  const leadSubmitValidation = async (event) => {
    event.preventDefault();
    setLoadingLead(true);

    if (equipment.model === "" && equipmentList.length === 0) {
      setValidationMessage("Equipment must have a model to be added to a lead");
      setOpenError(true);
      return false;
    } else if (leadData.name === "") {
      setValidationMessage("Lead must have a name to be created");
      setOpenError(true);
      return false;
    } else {
      console.log("eq added directly from submit");
      if (equipment.model !== "") {
        console.log("another eq added first");
        await pushEquipmentToLead();
      }
      await setLeadToFirestore();
      setLoadingLead(false);
      setLeadSuccess(true);
      setValidationMessage("lead successfully submitted");
      setOpenSuccess(true);
      handleCloseDialog();
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
    console.table(leadData);
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
      default:
        return "";
    }
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

    setEquipment({ ...equipment, [id]: value });
  };

  // handles equipment object values for the inputs
  const handleEquipmentValues = (id) => {
    switch (id) {
      case "model":
        return equipment.model;
      case "stock":
        return equipment.stock;
      case "serial":
        return equipment.serial;
      case "status":
        return equipment.status;
      case "availability":
        return equipment.availability;
      case "notes":
        return equipment.notes;
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
                  {heading}
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
                        onDelete={handleDelete(data)}
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
                  onClick={equipmentSubmitValidation}
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
                  onClick={leadSubmitValidation}
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
