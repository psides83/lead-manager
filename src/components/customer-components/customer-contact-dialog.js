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
} from "@mui/material";
import React, { useState } from "react";

function CustomerContactDialog() {
  const [isShowingDialog, setIsShowingDialog] = useState(false);

  const handleCloseDialog = () => {
    setIsShowingDialog(false);
  };

  const handleToggleDialog = () => {
    setIsShowingDialog(!isShowingDialog);
  };

  const logCall = async (e) => {
    e.preventDefault();

    window.location.href = `tel:+13347349544`;
  };

  const logText = async (e) => {
    e.preventDefault();

    window.location.href = `sms:+13347349544`;
  };

  return (
    <>
      <Tooltip title="Contact Salesman">
        <IconButton aria-label="phone" onClick={handleToggleDialog}>
          <PhoneIphoneRounded />
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
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CustomerContactDialog;
