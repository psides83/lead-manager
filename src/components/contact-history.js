// import { DialogContent } from "@material-ui/core";
import { EscalatorWarning, History, PhoneIphoneRounded } from "@mui/icons-material";
import {
  Avatar,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  DialogContent,
  Tooltip,
  Button,
} from "@mui/material";
import React, { useState } from "react";

function ContactHistory(props) {
  const { events } = props;
  const [isShowingDialog, setIsShowingDialog] = useState(false);

  const handleCloseDialog = () => {
    setIsShowingDialog(false);
  };

  const handleToggleDialog = () => {
    console.log(events);
    setIsShowingDialog(!isShowingDialog);
  };

  const compare = (a, b) => {
    let comparison = 0;
    if (a.timestamp < b.timestamp) {
      comparison = 1;
    } else if (a.timestamp > b.timestamp) {
      comparison = -1;
    }
    return comparison;
  };

  return (
    <>
      {/* <Typography color="text.secondary">Contact History</Typography>
      <IconButton onClick={handleToggleDialog}>
        <History />
      </IconButton> */}
      <Tooltip title="View Contact History">
        <Button
          // color="success"
          size="small"
          //   variant="outlined"
          startIcon={<History />}
          onClick={handleToggleDialog}
          //   sx={{ mx: 4, mb: 1, mt: 1 }}
        >
          Contact History
        </Button>
      </Tooltip>
      <Dialog onClose={handleCloseDialog} open={isShowingDialog} scroll="paper">
        <DialogTitle id="history-dialog-title">
          Lead Contact History
        </DialogTitle>
        <DialogContent dividers>
          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
          {events?.map((event) => (
              <ListItem key={event.id}>
                <ListItemAvatar>
                  <Avatar style={{backgroundColor: "#FFDE00"}}>
                    <PhoneIphoneRounded color="primary" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${event.event}`}
                  secondary={event.timestamp}
                />
              </ListItem>
          ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ContactHistory;
