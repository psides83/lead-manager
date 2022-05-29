import React, { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  AccountBalanceRounded,
  AgricultureRounded,
  AttachMoneyRounded,
  MailRounded,
} from "@mui/icons-material";
import StatusHistory from "../lead-components/status-history";
import {
  Alert,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Tooltip,
} from "@mui/material";
import moment from "moment";
import CustomerContactDialog from "./customer-contact-dialog";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

function EquipmentSection(props) {
  const { lead, setValidationMessage, setOpenError, setOpenSuccess } = props;
  const [showingEquipment, setShowingEquipment] = useState(false);

  const showEquipment = (event) => {
    event.preventDefault();
    showingEquipment ? setShowingEquipment(false) : setShowingEquipment(true);
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle1" style={{fontWeight: "bold"}}>Equipment</Typography>
        </Stack>
      </Stack>
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        {lead.equipment.map((unit) => {
          return (
            <ListItem key={unit.id} disablePadding>
              <ListItemText
                id={unit.id}
                primary={unit.model}
                secondary={
                  <>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="caption"
                      color="text.primary"
                    >
                      {unit.status}
                    </Typography>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="caption"
                      color="text.primary"
                    >
                      {` — ${unit.availability}`}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </>
  );
}

export default function CustomerCard(props) {
  const { lead } = props;
  const name = lead.name;
  const dateCreated = lead.timestamp;
  const lastChange = lead.changeLog.length - 1;
  const status = lead.status;
  const notes = lead.notes;
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = useState(false);
  var [validationMessage, setValidationMessage] = useState("");

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  const logEmail = async (e) => {
    e.preventDefault();

    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    const contactLog = {
      id: id,
      event: "Emailed",
      timestamp: timestamp,
    };

    lead.contactLog.push(contactLog);

    const leadRef = doc(db, "leads", lead.id);

    await setDoc(leadRef, { contactLog: lead.contactLog }, { merge: true });

    window.location.href = `mailto:${lead.email}`;
  };

  return (
    <Card
      sx={{
        minWidth: 350,
        // minHeight: 250,
        borderRadius: 2,
        margin: "12px",
      }}
      elevation={4}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          // spacing={2}
        >
          <Typography variant="h4">{name}</Typography>
          <Stack direction="row" justifyContent="flex-end">
            <CustomerContactDialog lead={lead} />
            <Tooltip title="Email Salesman">
              <IconButton aria-label="edit" onClick={logEmail}>
                <MailRounded />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Quote">
              <IconButton aria-label="edit" onClick={logEmail}>
                <AttachMoneyRounded />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {`Created ${dateCreated.slice(0, dateCreated.length - 8)}`}
          </Typography>

          {lead.willFinance ? (
            <Tooltip title="Financed">
              <AccountBalanceRounded color="primary" fontSize="10px" />
            </Tooltip>
          ) : null}
          {lead.hasTrade ? (
            <Tooltip title="Has Trade">
              <AgricultureRounded color="primary" fontSize="10px" />
            </Tooltip>
          ) : null}
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          // spacing={2}
        >
          <Typography color="text.secondary">{`Status: ${status}`}</Typography>
          <StatusHistory events={lead.changeLog} />
        </Stack>
        <EquipmentSection
          lead={lead}
          setValidationMessage={setValidationMessage}
          setOpenError={setOpenError}
          setOpenSuccess={setOpenSuccess}
        />

        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          // spacing={2}
        >
          <Typography variant="caption" color="text.secondary">
            {`Updated ${lead.changeLog[0].timestamp}`}
          </Typography>
        </Stack>
      </CardContent>
      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {validationMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openError}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {validationMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}
