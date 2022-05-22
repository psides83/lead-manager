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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
} from "@mui/material";
import { doc, setDoc } from "firebase/firestore";
import moment from "moment";
import React, { useState } from "react";
import { db } from "../services/firebase";

function ContactDialog({ lead }) {
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

  return (
    <>
      <Tooltip title="Call Lead">
        <IconButton aria-label="phone" onClick={handleToggleDialog}>
          <PhoneIphoneRounded />
        </IconButton>
      </Tooltip>

      <Dialog onClose={handleCloseDialog} open={isShowingDialog} scroll="paper">
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
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ContactDialog;
