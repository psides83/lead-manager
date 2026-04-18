import React, { useContext, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../../services/firebase";
import {
    ExpandLessRounded,
    ExpandMoreRounded,
  } from "@mui/icons-material";
  import {
    Badge,
    Checkbox,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
  } from "@mui/material";
  import moment from "moment";
import AddTaskDialog from "./add-lead-tasks";
import { sortTasksByFollowUpPriority } from "../../../../utils/task-sort";
import { writeAuditLog } from "../../../../services/audit-log-service";
import { AuthContext } from "../../../../state-management/auth-context-provider";
import { markTaskNotificationsRead } from "../../../../services/notification-service";

export default function TaskSection(props) {
    const { userProfile, currentUser } = useContext(AuthContext);
    const { lead, tasks, setMessage, setOpenError, setOpenSuccess } =
      props;
    const [searchParam] = useState(["leadID", "isComplete"]);
    const [showingTasks, setShowingTasks] = useState(false);
    const onlyCompleted = true;
  
    const showTasks = (event) => {
      event.preventDefault();
      showingTasks ? setShowingTasks(false) : setShowingTasks(true);
    };
    // const [filterParam, setFilterParam] = useState("leadID", "isComplete");
  
    const search = (tasks, onlyCompleted) => {
      return sortTasksByFollowUpPriority(tasks).filter((item) => {
        /*
        // in here we check if our region is equal to our c state
        // if it's equal to then only return the items that match
        // if not return All the countries
        */
        if (item.leadID === lead.id && !onlyCompleted) {
          return searchParam.some((newItem) => {
            return (
              // .indexOf(searchText.toLowerCase()) > -1
              (item[newItem]
                .toString()
                .toLowerCase())
            );
          });
        } else if (item.leadID === lead.id && item.isComplete !== onlyCompleted) {
          return searchParam.some((newItem) => {
            return item[newItem];
          });
        }
        return null;
      });
    };

    const taskSecondaryText = (task) => {
      if (!task?.dueUnix || task?.isComplete) {
        return null;
      }
      if (Number(task.dueUnix) < Date.now()) {
        return "Overdue follow-up";
      }
      return null;
    };
  
    const handleClick = (task) => (e) => {
      e.stopPropagation();
      e.preventDefault();
      const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
      // const id = moment().format("yyyyMMDDHHmmss");
  
      if (task.task !== "") {
        const status = task.isComplete === false ? true : false;
        const taskRef = doc(db, "tasks", task.id);
        setDoc(
          taskRef,
          {
            isComplete: status,
            completedTimestamp: timestamp,
          },
          { merge: true }
        );
        writeAuditLog({
          actionType: "task_completion_toggled",
          entityType: "task",
          entityId: task.id,
          leadId: task.leadID,
          before: { isComplete: task.isComplete },
          after: { isComplete: status },
          metadata: { source: "lead-card-task-section" },
        });
        if (status) {
          markTaskNotificationsRead({
            userId: currentUser?.uid || userProfile?.id,
            taskId: task.id,
          });
        }
      }
    };
  
    return (
      <>
        <Stack direction="row" justifyContent="space-between">
          <Stack
            direction="row"
            // justifyContent={search(tasks).legnth === 0 ? "flex-end" : "space-between"}
            alignItems="center"
          >
            <Badge
              badgeContent={
                search(tasks).length !== 0
                  ? search(tasks, onlyCompleted).length
                  : null
              }
              color="primary"
            >
              <Typography variant="subtitle1">
                {search(tasks).length === 0 ? "Add Task" : "Tasks"}
              </Typography>
            </Badge>
  
            <AddTaskDialog
              lead={lead}
              tasksCount={tasks.length}
              setMessage={setMessage}
              setOpenError={setOpenError}
              setOpenSuccess={setOpenSuccess}
            />
          </Stack>
          {search(tasks).length !== 0 ? (
            <IconButton size="small" onClick={showTasks}>
              {!showingTasks ? <ExpandMoreRounded /> : <ExpandLessRounded />}
            </IconButton>
          ) : null}
        </Stack>
        <Collapse in={showingTasks}>
          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {search(tasks).map((task) => {
              return (
                <ListItem key={task.id} disablePadding>
                  <ListItemButton
                    role={undefined}
                    onClick={handleClick(task)}
                    dense
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={task.isComplete}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ "aria-labelledby": task.id }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      id={task.id}
                      primary={task.task}
                      secondary={taskSecondaryText(task)}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  }
