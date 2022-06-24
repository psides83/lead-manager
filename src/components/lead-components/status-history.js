import { Agriculture, History } from "@mui/icons-material";
import {
  Avatar,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  DialogContent,
  Tooltip,
} from "@mui/material";
import React, { useState } from "react";

function StatusHistory(props) {
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
    if (a.id < b.id) {
      comparison = 1;
    } else if (a.id > b.id) {
      comparison = -1;
    }
    return comparison;
  };

  return (
    <>
      <Tooltip title="Lead Status History">
        {/* <Typography color="text.secondary">Status History</Typography> */}
        <IconButton onClick={handleToggleDialog}>
          <History />
        </IconButton>
      </Tooltip>
      {/* <Button
          // color="success"
          size="small"
        //   variant="outlined"
          startIcon={<History />}
          onClick={handleToggleDialog}
        //   sx={{ mx: 4, mb: 1, mt: 1 }}
        >
          Contact History
        </Button> */}
      <Dialog
        onClose={handleCloseDialog}
        open={isShowingDialog}
        style={{ backdropFilter: "blur(4px)" }}
        scroll="paper"
        PaperProps={{ style: { borderRadius: 8 }, elevation: 24 }}
      >
        <DialogTitle id="history-dialog-title">Lead Status History</DialogTitle>
        <DialogContent dividers>
          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {events.sort(compare)?.map((event, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar style={{ backgroundColor: "#FFDE00" }}>
                    <Agriculture color="primary" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${event.change}`}
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

export default StatusHistory;
