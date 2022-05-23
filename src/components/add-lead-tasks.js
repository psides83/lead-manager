import React, { useState } from "react";
import {
  AddTask,
  ArrowUpward,
  Check,
  Close,
  Message,
  Send,
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
import { db } from "../services/firebase";
// import { UpArrow } from "../../icons";
import { borderRadius, color, style } from "@mui/system";
import moment from "moment";

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
function AddTaskDialog(props) {
  const {
    lead,
    tasksCount,
    setValidationMessage,
    setOpenError,
    setOpenSuccess,
  } = props;
  const [task, setTask] = useState("");
  const [isShowingDialog, setIsShowingDialog] = useState(false);

  const handleCloseDialog = () => {
    setIsShowingDialog(false);
    setTask("");
  };

  const handleToggleDialog = () => {
    setIsShowingDialog(!isShowingDialog);
  };

  const addTask = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");

    if (task !== "") {
      const taskRef = doc(db, "tasks", id);
      await setDoc(
        taskRef,
        {
          id: id,
          timestamp: timestamp,
          leadID: lead.id,
          leadName: lead.name,
          task: task,
          isComplete: false,
          order: tasksCount + 1,
        },
        { merge: true }
      );
      setValidationMessage("Task successfully added");
      setOpenSuccess(true);
      handleCloseDialog();
      setTask("");
    } else {
      setValidationMessage("Please enter a task.");
      setOpenError(true);
    }
  };

  return (
    <>
      {/* <Button
        variant="contained"
        size="small"
        onClick={handleToggleDialog}
        startIcon={<AddTask />}
      >
        Add Task
      </Button> */}
      <Tooltip title="Add task">
        <IconButton
          size="large"
          edge="start"
          color="primary"
          onClick={handleToggleDialog}
          sx={{ ml: 2 }}
        >
          <AddTask />
        </IconButton>
      </Tooltip>

      <Dialog
        onClose={handleCloseDialog}
        open={isShowingDialog}
        style={{ backdropFilter: "blur(5px)" }}
        PaperProps={{ style: { borderRadius: 8 }, elevation: 24 }}
      >
        <Box
          sx={{
            maxWidth: "380px",
            padding: (theme) => theme.spacing(1),
            paddingLeft: (theme) => theme.spacing(4),
            paddingRight: (theme) => theme.spacing(4),
            paddingBottom: (theme) => theme.spacing(3),
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6" style={{ marginTop: "5px" }}>
              {`Add task for ${lead?.name}`}
            </Typography>

            <IconButton sx={{ height: 44 }} onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  width: "100%",
                  borderRadius: "20px",
                  border: "none",
                  backgroundColor: "#e9e9e9",
                }}
              >
                <TextareaAutosize
                  placeholder="task..."
                  style={{
                    // width: "93%",
                    borderRadius: "20px",
                    border: "none",
                    backgroundColor: "#e9e9e9",
                    padding: "10px 10px 12px 10px",
                    resize: "none",
                    outline: "none",
                    fontSize: "16px",
                  }}
                  // minRows={8}
                  onChange={(e) => setTask(e.target.value)}
                />

                <IconButton onClick={addTask} disabled={!task}>
                  {/* <UpArrow color="white" padding="1px" backgroundColor={!message ? color.flatGray : color.primary} borderRadius="20px" /> */}
                  <Check
                    style={{
                      padding: "1px",
                      color: "white",
                      backgroundColor: !task ? "gray" : "#367C2B",
                      borderRadius: "20px",
                    }}
                  />
                </IconButton>
              </Box>
            </Grid>
            {/* <Grid item xs={12} sm={12}></Grid> */}
          </Grid>
        </Box>
      </Dialog>
    </>
  );
}

export default AddTaskDialog;
