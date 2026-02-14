import React, { useCallback, useContext, useEffect, useState } from "react";
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
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
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
import EquipmentSection from "./lead-card-components/equipment-section";
import { AuthContext } from "../../../state-management/auth-context-provider";
import {
  resolveBranch,
  watchRequestStatus,
} from "../../../services/setup-request-service";
import { leadStatusArray } from "../../../models/static-data";
import { doc, setDoc } from "firebase/firestore";
import moment from "moment";
import { db } from "../../../services/firebase";

export default function LeadCard(props) {
  const { lead, tasks } = props;
  const name = lead.name;
  const dateCreated = lead.timestamp;
  const status = lead.status;
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = useState(false);
  const [pdiStatus, setPdiStatus] = useState("");
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  var [message, setMessage] = useState("");
  const { pdiUser, userProfile } = useContext(AuthContext);

  const viewModel = new LeadCardViewModel(lead, setMessage, setOpenSuccess, setOpenError);
  const statusColor = status === "Closed" ? "default" : "success";
  const statusMenuOpen = Boolean(statusAnchorEl);
  const appGreen = "rgb(54, 124, 42, 0.9)";

  const loadPdiStatus = useCallback(() => {
    if (!lead?.pdiID) {
      setPdiStatus("");
      return () => {};
    }

    const branch = resolveBranch(lead, pdiUser, userProfile);
    if (!branch) {
      setPdiStatus("");
      return () => {};
    }

    return watchRequestStatus({
      branch,
      requestId: lead.pdiID,
      onStatus: setPdiStatus,
    });
  }, [lead, pdiUser, userProfile]);

  useEffect(() => {
    const unsubscribe = loadPdiStatus();
    return () => unsubscribe?.();
  }, [loadPdiStatus]);

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  const handleOpenStatusMenu = (event) => {
    event.stopPropagation();
    setStatusAnchorEl(event.currentTarget);
  };

  const handleCloseStatusMenu = () => {
    setStatusAnchorEl(null);
  };

  const handleStatusUpdate = async (nextStatus) => {
    handleCloseStatusMenu();
    if (!nextStatus || nextStatus === lead.status) {
      return;
    }

    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    const updatedChangeLog = [
      ...(lead.changeLog || []),
      {
        id,
        change: `status updated from ${lead.status} to ${nextStatus}`,
        timestamp,
      },
    ];

    try {
      await setDoc(
        doc(db, "leads", lead.id),
        {
          status: nextStatus,
          mergeWithCoreData: true,
          changeLog: updatedChangeLog,
        },
        { merge: true },
      );
      setMessage(`Status updated to ${nextStatus}`);
      setOpenSuccess(true);
    } catch (error) {
      setMessage(error?.message || "Unable to update status");
      setOpenError(true);
    }
  };

  return (
    <Card
      sx={{
        width: 380,
        maxWidth: "100%",
        minHeight: 300,
        height: "auto",
        justifySelf: "center",
        borderRadius: 2,
        margin: 0,
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 16px 34px rgba(17, 24, 39, 0.14)",
        },
      }}
      elevation={4}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          // spacing={2}
        >
          <Typography variant="h5" sx={{ overflowWrap: "anywhere", pr: 1 }}>
            {name}
          </Typography>
          <Stack direction="row" justifyContent="flex-end" sx={{ flexShrink: 0 }}>
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
              <AccountBalanceRounded color="primary" fontSize="small" />
            </Tooltip>
          ) : null}
          {lead.hasTrade ? (
            <Tooltip title="Has Trade">
              <AgricultureRounded color="primary" fontSize="small" />
            </Tooltip>
          ) : null}
          {lead.willPurchase ? (
            <Tooltip title="Will Purchase">
              <AttachMoneyRounded color="primary" fontSize="small" />
            </Tooltip>
          ) : null}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1.25 }}
        >
          <Stack sx={{ flex: 1, minWidth: 0 }} alignItems="flex-start">
            <Chip
              size="small"
              label={status}
              color={statusColor === "default" ? "default" : "success"}
              variant="filled"
              onClick={handleOpenStatusMenu}
              sx={{
                cursor: "pointer",
                "& .MuiChip-label": {
                  color: "white",
                  fontWeight: 500,
                },
                bgcolor: statusColor === "default" ? "grey.600" : appGreen,
              }}
            />
          </Stack>

          <Stack sx={{ flex: 1, minWidth: 0 }} alignItems="center">
            {(pdiStatus === "Requested" ||
              pdiStatus === "In Progress" ||
              pdiStatus === "Completed") ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="caption">PDI/Setup:</Typography>
                <Stack
                  sx={{
                    width: "fit-content",
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 1,
                    background: "rgb(54, 124, 42, 0.9)",
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "white" }}>
                    {pdiStatus}
                  </Typography>
                </Stack>
              </Stack>
            ) : null}
          </Stack>

          <Stack sx={{ flex: 1, minWidth: 0 }} alignItems="flex-end">
            <StatusHistory events={lead.changeLog} />
          </Stack>
        </Stack>
        <Menu
          anchorEl={statusAnchorEl}
          open={statusMenuOpen}
          onClose={handleCloseStatusMenu}
        >
          {leadStatusArray.map((statusOption) => (
            <MenuItem
              key={statusOption}
              selected={statusOption === status}
              onClick={() => handleStatusUpdate(statusOption)}
            >
              {statusOption}
            </MenuItem>
          ))}
        </Menu>

        <Divider sx={{ my: 1.25 }} />

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
          sx={{ mt: 1.5 }}
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
