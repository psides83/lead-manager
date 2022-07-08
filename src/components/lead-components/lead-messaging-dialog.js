import React, { useContext, useState } from "react";
import { TextsmsRounded } from "@mui/icons-material";
import { Button, Dialog, Tooltip } from "@mui/material";
import { setDoc, doc } from "@firebase/firestore";
import { db } from "../../services/firebase";
import CustomerMessenger from "../customer-components/customer-messenger";
import { AuthContext } from "../../state-management/auth-context-provider";

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
  const { lead } = props;
  // eslint-disable-next-line
  const { userProfile } = useContext(AuthContext);
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
    await setDoc(leadDoc, { messages: lead.messages }, { merge: true });
  };

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
