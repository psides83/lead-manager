import {
  PhoneIphoneRounded,
  PhoneRounded,
  TextsmsRounded,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Badge,
} from "@mui/material";
import { doc, setDoc } from "firebase/firestore";
import moment from "moment";
import React, { useState } from "react";
import { db } from "../../services/firebase";
import LeadMessagingDialog from "./lead-messaging-dialog";

function ContactDialog(props) {
  const { lead } = props;
  const [isShowingDialog, setIsShowingDialog] = useState(false);

  const handleCloseDialog = () => {
    setIsShowingDialog(false);
  };

  const handleToggleDialog = () => {
    setIsShowingDialog(!isShowingDialog);
  };

  const logCall = async (e) => {
    e.preventDefault();

    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    const contactLog = {
      id: id,
      event: "Called",
      timestamp: timestamp,
    };

    lead.contactLog.push(contactLog);

    const leadRef = doc(db, "leads", lead.id);

    await setDoc(leadRef, { contactLog: lead.contactLog }, { merge: true });

    window.location.href = `tel:${lead.phone}`;
  };

  const logText = async (e) => {
    e.preventDefault();

    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    const contactLog = {
      id: id,
      event: "Texted",
      timestamp: timestamp,
    };

    lead.contactLog.push(contactLog);

    const leadRef = doc(db, "leads", lead.id);

    await setDoc(leadRef, { contactLog: lead.contactLog }, { merge: true });

    window.location.href = `sms:+1${lead.phone}`;
  };

  const unreadMessageCount = () => {
    const count = lead.messages?.filter((item) => {
      if (item.unread === true) {
        return item;
      }
      return null;
    }).length;

    if (count !== 0) return count;
    return null;
  };

  return (
    <>
      <Tooltip title="Contact Lead">
        <IconButton aria-label="phone" onClick={handleToggleDialog}>
          <Badge badgeContent={unreadMessageCount()} color="primary">
            <PhoneIphoneRounded />
          </Badge>
        </IconButton>
      </Tooltip>

      <Dialog
        onClose={handleCloseDialog}
        open={isShowingDialog}
        style={{ backdropFilter: "blur(5px)" }}
        scroll="paper"
        PaperProps={{ style: { borderRadius: 8 }, elevation: 24 }}
      >
        <DialogTitle id="history-dialog-title">
          Choose Contact Method
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Button
              variant="contained"
              size="small"
              onClick={logCall}
              startIcon={<PhoneRounded />}
            >
              Call
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={logText}
              startIcon={<TextsmsRounded />}
            >
              Text
            </Button>
            <LeadMessagingDialog lead={lead} />
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ContactDialog;
