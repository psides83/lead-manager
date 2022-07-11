import React, { useState } from "react";
import {
  AccountBalanceRounded,
  AgricultureRounded,
  AttachMoneyRounded,
  LinkRounded,
  MailRounded,
} from "@mui/icons-material";
import ContactHistory from "../lead-card/lead-card-components/contact-history";
import StatusHistory from "../lead-card/lead-card-components/status-history";
import {
  Card,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContactDialog from "../lead-card/lead-card-components/contact-dialog";
import EditLead from "../edit-lead/edit-lead";
import { relativeTime } from "../../../utils/utils";
import DynamicSnackbar from "../../ui-components/snackbar";
import LeadCardViewModel from "./lead-card-view-model";
import TaskSection from "./lead-card-components/task-section";
import EquipmentSection from "./lead-card-components/equipment-section"

export default function LeadCard(props) {
  const { lead, tasks } = props;
  const name = lead.name;
  const dateCreated = lead.timestamp;
  const status = lead.status;
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = useState(false);
  var [message, setMessage] = useState("");

  const viewModel = new LeadCardViewModel(lead, setMessage, setOpenSuccess, setOpenError)

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
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
            <Tooltip title="Copy Customer Link">
              <IconButton onClick={(e) => viewModel.copyLeadLink(e)}>
                <LinkRounded />
              </IconButton>
            </Tooltip>

            <ContactDialog lead={lead} />

            <Tooltip title="Email Lead">
              <IconButton aria-label="edit" onClick={(e) => viewModel.logEmail(e)}>
                <MailRounded />
              </IconButton>
            </Tooltip>
            <EditLead
              lead={lead}
              setMessage={setMessage}
              setOpenError={setOpenError}
              setOpenSuccess={setOpenSuccess}
            />
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
          {lead.willPurchase ? (
            <Tooltip title="Will Purchase">
              <AttachMoneyRounded color="primary" fontSize="10px" />
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
          setMessage={setMessage}
          setOpenError={setOpenError}
          setOpenSuccess={setOpenSuccess}
        />

        <TaskSection
          lead={lead}
          tasks={tasks}
          setMessage={setMessage}
          setOpenError={setOpenError}
          setOpenSuccess={setOpenSuccess}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          // spacing={2}
        >
          <ContactHistory events={lead.contactLog} />
          <Typography variant="caption" color="text.secondary">
            {`Updated ${relativeTime(lead.changeLog[0].timestamp)}`}
          </Typography>
        </Stack>
      </CardContent>
      <DynamicSnackbar
        openSuccess={openSuccess}
        openError={openError}
        message={message}
        handleClose={handleClose}
      />
    </Card>
  );
}
