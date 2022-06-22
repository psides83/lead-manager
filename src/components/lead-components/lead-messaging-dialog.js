import React, { useState } from "react";
import {
  AddTask,
  ArrowUpward,
  Check,
  Close,
  Message,
  Send,
  TextsmsRounded,
} from "@mui/icons-material";
import {
  Box,
  Grid,
  Button,
  TextareaAutosize,
  Dialog,
  DialogTitle,
  IconButton,
  Stack,
  ListItem,
  Chip,
  Typography,
  Tooltip,
} from "@mui/material";
import { setDoc, collection, doc } from "@firebase/firestore";
import { db } from "../../services/firebase";
// import { UpArrow } from "../../icons";
import { borderRadius, color, style } from "@mui/system";
import moment from "moment";
import CustomerMessenger from "../customer-components/customer-messenger";
import { useStateValue } from "../../state-management/state-provider";

/**
 * This component recieves props for the SnackBar to be dislayed once actions are completed or if an erronious input is received.
 *
 * It can receive a guardian prop, a child prop, or neither. whichever it receives determines the button that represents the form.
 *
 * It also determines the use of the form. Whether it is for adding a guardian at the initial registration of a child, adding a guardian from the admin children table, or to edit an existing guardian.
 *
 * @param  {} props
 * setValidationMessage, setOpenError, setOpenSuccess
 */
function LeadMessagingDialog(props) {
  const {
    lead,
    tasksCount,
    setValidationMessage,
    setOpenError,
    setOpenSuccess,
  } = props;
  const [{ loading, userProfile }, dispatch] = useStateValue("");
  const [isShowingDialog, setIsShowingDialog] = useState(false);

  const handleCloseDialog = () => {
    setIsShowingDialog(false);
  };

  const handleToggleDialog = () => {
    setIsShowingDialog(!isShowingDialog);
    markAsRead();
  };

  const markAsRead = async () => {
    unreadMessages(lead.messages)?.map((message) => (message.unread = false));
    const leadDoc = doc(db, "leads", lead.id);
    await setDoc(leadDoc, { messages: lead.messages }, { merge: true })
  }

  const unreadMessages = () => {
    return lead.messages.filter((item) => {
      if (item.unread === true) {
        return item;
      }
      return null;
    });
  };

  return (
    <>
      <Tooltip title="Internal Messaging">
        <Button
          variant="contained"
          size="small"
          onClick={handleToggleDialog}
          startIcon={<TextsmsRounded />}
        >
          Message
        </Button>
      </Tooltip>

      <Dialog
        onClose={handleCloseDialog}
        open={isShowingDialog}
        style={{ backdropFilter: "blur(5px)" }}
        PaperProps={{ style: { borderRadius: 8 }, elevation: 24 }}
      >
        <CustomerMessenger user={userProfile} lead={lead} />
      </Dialog>
    </>
  );
}

export default LeadMessagingDialog;