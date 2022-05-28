//Imports
import React, { useRef, useState } from "react";
import { db } from "../services/firebase";
import { setDoc, doc } from "@firebase/firestore";
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
  CircularProgress,
} from "@mui/material";
import {
  Close,
  DeleteRounded,
  EditRounded,
  Groups,
  Save,
  SendRounded,
  Agriculture,
  AddCircleOutlined,
  Add,
  PersonAddAltRounded,
  CheckRounded,
  SaveRounded,
  CheckCircleOutlineRounded,
} from "@mui/icons-material";
import { PhoneNumberMask } from "./phone-number-mask";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function AddLead(props) {
  //#region State Properties
  const { setValidationMessage, setOpenSuccess, setOpenError } = props;
  // const [openSuccess, setOpenSuccess] = useState(false);
  // const [openError, setOpenError] = useState(false);
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [phone, setPhone] = useState("");
  var [willFinance, setWillFinance] = useState(false);
  var [hasTrade, setHasTrade] = useState(false);
  var [willPurchase, setWillPurchase] = useState(false);
  var [leadStatus, setLeadStatus] = useState("Lead Created");
  var [leadNotes, setLeadNotes] = useState("");
  var [model, setModel] = useState("");
  var [stock, setStock] = useState("");
  var [serial, setSerial] = useState("");
  var [availability, setAvailability] = useState("Availability Unknown");
  var [equipmentStatus, setEquipmentStatus] = useState("Equipment added");
  var [equipmentNotes, setEquipmentNotes] = useState("");
  var [equipmentList, setEquepmentList] = useState([]);
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [loadingLead, setLoadingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [equipmentSuccess, setEquipmentSuccess] = useState(false);
  const timer = useRef();
  // const [isShowingConfirmDialog, setIsShowingConfirmDialog] = useState(false);
  // var [validationMessage, setValidationMessage] = useState("");
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

  // const handleCloseConfirmDialog = () => {
  //   setIsShowingConfirmDialog(false);
  // };

  // const handleToggleConfirmDialog = () => {
  //   setIsShowingConfirmDialog(!isShowingConfirmDialog);
  // };

  // Handle lead name input and capitolize each word
  const handleNameInput = (e) => {
    const names = e.target.value;

    const finalName = names.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
      letter.toUpperCase()
    );

    setName(finalName);
  };

  // Dynamic heading for the form.
  const heading =
    equipmentList.length === 0 ? "Add Equipment" : "Equipment on Lead";

  // Array of work options that populate the checkbox setion of the form.
  var checkBoxes = [
    {
      id: "1",
      title: "Financed",
      checkedState: willFinance,
    },
    {
      id: "2",
      title: "Has trade",
      checkedState: hasTrade,
    },
    {
      id: "3",
      title: "Will Purchase",
      checkedState: willPurchase,
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
    switch (event.target.id) {
      case "1":
        if (!willFinance) {
          setWillFinance(true);
        } else {
          setWillFinance(false);
        }
        break;
      case "2":
        if (!hasTrade) {
          setHasTrade(true);
        } else {
          setHasTrade(false);
        }
        break;
      case "3":
        if (!willPurchase) {
          setWillPurchase(true);
        } else {
          setWillPurchase(false);
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
    const changeLog = [
      {
        id: id,
        change: `Lead created`,
        timestamp: timestamp,
      },
    ];
    const contactLog = [
      {
        id: id,
        event: "not contacted since added",
        timestamp: timestamp,
      },
    ];

    console.log(equipmentList);

    const firestoreLead = {
      id: id,
      timestamp: timestamp,
      name: name,
      email: email,
      phone: phone,
      status: leadStatus,
      notes: leadNotes,
      willFinance: willFinance,
      hasTrade: hasTrade,
      willPurchase: willPurchase,
      changeLog: changeLog,
      contactLog: contactLog,
      equipment: equipmentList,
    };

    const leadRef = doc(db, "leads", firestoreLead.id);

    await setDoc(leadRef, firestoreLead, { merge: true });
    setLoadingLead(false);
    setLeadSuccess(true);
    setValidationMessage("lead successfully submitted");
    setOpenSuccess(true);
    handleCloseDialog();
  };

  // Reset complete form
  const resetCompleteForm = async () => {
    await resetEquipmentForm();
    await resetLeadForm();
    setEquepmentList([]);
  };

  // Reset the Lead form
  const resetLeadForm = async () => {
    setName("");
    setEmail("");
    setPhone("");
    setLeadStatus("Lead Created");
    setLeadNotes("");
    setWillFinance(false);
    setHasTrade(false);
    setWillPurchase(false);
  };

  // Reset the Equipment form
  const resetEquipmentForm = async () => {
    setLoadingEquipment(false);
    setEquipmentSuccess(true);
    timer.current = window.setTimeout(() => {
      setEquipmentSuccess(false);
      setModel("");
      setStock("");
      setSerial("");
      setEquipmentNotes("");
      setAvailability("Availability Unknown");
      setEquipmentStatus("Equipment added");
    }, 1000);
  };

  // Push equipment to a state array to later be set to firestore "equipment" collection with the "leads" collection.
  const pushEquipmentToLead = async () => {
    const id = moment().format("yyyyMMDDHHmmss");
    const changeLog = [
      {
        change: `Equipment added to lead`,
        timestamp: moment().format("DD-MMM-yyyy hh:mmA"),
      },
    ];

    var equipment = {
      id: id,
      model: model,
      stock: stock,
      serial: serial,
      availability: availability,
      status: equipmentStatus,
      notes: equipmentNotes,
      changeLog: changeLog,
    };

    equipmentList.push(equipment);
    setEquepmentList(equipmentList);
    console.log("Temp EQ");
    console.log(equipmentList);

    await resetEquipmentForm();
  };

  // Squipment submission validation.
  const equipmentSubmitValidation = async (event) => {
    event.preventDefault();
    setLoadingEquipment(true);

    const lowerCaseLetters = /[a-z]/g;
    const upperCaseLetters = /[A-Z]/g;

    if (model === "") {
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

    const lowerCaseLetters = /[a-z]/g;
    const upperCaseLetters = /[A-Z]/g;

    if (model === "" && equipmentList.length === 0) {
      setValidationMessage("Equipment must have a model to be added to a lead");
      setOpenError(true);
      return false;
    } else if (name === "") {
      setValidationMessage("Lead must have a name to be created");
      setOpenError(true);
      return false;
    } else {
      console.log("eq added directly from submit");
      if (model !== "") {
        console.log("another eq added first");
        await pushEquipmentToLead();
      }
      await setLeadToFirestore();
    }
  };

  // UI view of the submission form
  return (
    <>
      <Tooltip title="Add New Lead">
        <Button
          // size="small"
          // edge="start"
          color="inherit"
          onClick={handleToggleDialog}
          endIcon={<PersonAddAltRounded color="inherit" />}
          // sx={{ ml: 2 }}
        >
          <Typography sx={{ display: { xs: "none", sm: "block" } }}>Add Lead</Typography>
        </Button>
        {/* <Button
          color="secondary"
          size="small"
          variant="outlined"
          startIcon={<Add />}
          onClick={handleToggleDialog}
          sx={{ mx: 4, mb: 1, mt: 1 }}
        >
          Submit Lead
        </Button> */}
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
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                autoFocus
                size="small"
                id="name"
                name="name"
                label="Name"
                variant="outlined"
                value={name}
                onChange={handleNameInput}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                size="small"
                id="email"
                name="email"
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="tel"
                size="small"
                id="phone"
                name="phone"
                label="Phone"
                variant="outlined"
                value={phone}
                InputProps={{
                  inputComponent: PhoneNumberMask,
                }}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/[^0-9\-()" "]/g, ""))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="leadStatus"
                variant="outlined"
                labelid="leadStatus"
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
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value)}
              >
                {leadStatusArray.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                multiline
                size="small"
                id="leadNotes"
                name="leadNotes"
                label="Lead Notes"
                variant="outlined"
                value={leadNotes}
                onChange={(e) => setLeadNotes(e.target.value)}
              />
            </Grid>

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

            {/* <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                color="error"
                onClick={handleToggleConfirmDialog}
                startIcon={<DeleteRounded />}
              >
                Delete
              </Button>
            </Grid> */}

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

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                size="small"
                id="model"
                name="model"
                label="Model"
                variant="outlined"
                onChange={(e) => setModel(e.target.value.toUpperCase())}
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
                onChange={(e) => setStock(e.target.value)}
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
                onChange={(e) => setSerial(e.target.value.toUpperCase())}
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
                value={equipmentStatus}
                onChange={(e) => setEquipmentStatus(e.target.value)}
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
                onChange={(e) => setAvailability(e.target.value)}
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
                value={equipmentNotes}
                onChange={(e) => setEquipmentNotes(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <Box sx={{ position: "relative" }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={model === "" || loadingEquipment}
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
                        // color: green[500],
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
                    name === "" ||
                    (model === "" && equipmentList.length === 0) ||
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
                        // color: green[500],
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

    // <Container component="main" maxWidth="xs" sx={{ margin: 20 }}>
    //   <Box>
    //
    //     <form noValidate>
    //
    //       <Grid container spacing={2}>
    //
    //           <div className="checkBoxes">

    //           </div>

    //         <Grid item xs={12}>
    //         </Grid>
    //
    //       </Grid>

    //
    //     </form>
    //   </Box>
    // </Container>
  );
}
