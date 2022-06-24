import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  AccountBalanceRounded,
  AgricultureRounded,
  AttachMoneyRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  LinkRounded,
  MailRounded,
} from "@mui/icons-material";
import ContactHistory from "./contact-history";
import StatusHistory from "./status-history";
import {
  Alert,
  Badge,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import ContactDialog from "./contact-dialog";
import EditLead from "./edit-lead";
import AddTaskDialog from "./add-lead-tasks";
import EquipmentForm from "./equipment-form";
import toast from "react-hot-toast";
import { relativeTime } from "../../utils/utils";

function TaskList(props) {
  const { lead, tasks, setValidationMessage, setOpenError, setOpenSuccess } =
    props;
  const [searchText] = useState("");
  const [searchParam] = useState(["leadID", "isComplete"]);
  const [showingTasks, setShowingTasks] = useState(false);
  const onlyCompleted = true;

  const showTasks = (event) => {
    event.preventDefault();
    showingTasks ? setShowingTasks(false) : setShowingTasks(true);
  };
  // const [filterParam, setFilterParam] = useState("leadID", "isComplete");

  const search = (tasks, onlyCompleted) => {
    return tasks.filter((item) => {
      /*
      // in here we check if our region is equal to our c state
      // if it's equal to then only return the items that match
      // if not return All the countries
      */
      if (item.leadID === lead.id && !onlyCompleted) {
        return searchParam.some((newItem) => {
          return (
            item[newItem]
              .toString()
              .toLowerCase()
              .indexOf(searchText.toLowerCase()) > -1
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
            setValidationMessage={setValidationMessage}
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
                  <ListItemText id={task.id} primary={task.task} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </>
  );
}

function EquipmentSection(props) {
  const { lead, setValidationMessage, setOpenError, setOpenSuccess } = props;
  const [showingEquipment, setShowingEquipment] = useState(false);

  const showEquipment = (event) => {
    event.preventDefault();
    showingEquipment ? setShowingEquipment(false) : setShowingEquipment(true);
  };

  const stockNumber = (stock) => {
    if (stock === undefined) return;
    if (stock === null) return;
    if (stock === "") return;
    return <Typography variant="caption">{`Stock: ${stock}`}</Typography>;
  };

  const serialNumber = (serial) => {
    if (serial === undefined) return;
    if (serial === null) return;
    if (serial === "") return;
    return <Typography variant="caption">{`Serial: ${serial}`}</Typography>;
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle1">Equipment</Typography>
          <EquipmentForm
            lead={lead}
            setValidationMessage={setValidationMessage}
            setOpenError={setOpenError}
            setOpenSuccess={setOpenSuccess}
          />
        </Stack>
        {lead.equipment.length !== 0 ? (
          <IconButton size="small" onClick={showEquipment}>
            {!showingEquipment ? <ExpandMoreRounded /> : <ExpandLessRounded />}
          </IconButton>
        ) : null}
      </Stack>
      <Collapse in={showingEquipment}>
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {lead.equipment.map((unit) => {
            return (
              <ListItem key={unit.id} disablePadding sx={{ width: "100%" }}>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                >
                  <EquipmentForm
                    equipment={unit}
                    lead={lead}
                    setValidationMessage={setValidationMessage}
                    setOpenError={setOpenError}
                    setOpenSuccess={setOpenSuccess}
                  />

                  <Stack justifyItems="flex-end" alignContent="flex-end">
                    {stockNumber(unit.stock)}
                    {serialNumber(unit.serial)}
                  </Stack>
                </Stack>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </>
  );
}

export default function LeadCard(props) {
  const { lead, tasks } = props;
  const name = lead.name;
  const dateCreated = lead.timestamp;
  const status = lead.status;
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = useState(false);
  var [validationMessage, setValidationMessage] = useState("");

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  const logEmail = async (e) => {
    e.preventDefault();

    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    const contactLog = {
      id: id,
      event: "Emailed",
      timestamp: timestamp,
    };

    lead.contactLog.push(contactLog);

    const leadRef = doc(db, "leads", lead.id);

    await setDoc(leadRef, { contactLog: lead.contactLog }, { merge: true });

    window.location.href = `mailto:${lead.email}`;
  };

  const copyLeadLink = (e) => {
    e.preventDefault();

    toast.promise(
      navigator.clipboard.writeText(
        `https://leadmanager-44f57.web.app/customer-view/${lead.id}`
      ),
      {
        loading: "Saving...",
        success: <b>Link copied!</b>,
        error: <b>Could not copy link.</b>,
      }
    );
  };

  return (
    <Card
      sx={{
        minWidth: 350,
        // minHeight: 250,
        borderRadius: 2,
        margin: "12px",
      }}
      elevation={4}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          // spacing={2}
        >
          <Typography variant="h4">{name}</Typography>
          <Stack direction="row" justifyContent="flex-end">
            <Tooltip title="Copy Customer Link">
              <IconButton onClick={copyLeadLink}>
                <LinkRounded />
              </IconButton>
            </Tooltip>

            <ContactDialog lead={lead} />

            <Tooltip title="Email Lead">
              <IconButton aria-label="edit" onClick={logEmail}>
                <MailRounded />
              </IconButton>
            </Tooltip>
            <EditLead
              lead={lead}
              setValidationMessage={setValidationMessage}
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
              <AccountBalanceRounded color="primary" fontSize="10px" />
            </Tooltip>
          ) : null}
          {lead.hasTrade ? (
            <Tooltip title="Has Trade">
              <AgricultureRounded color="primary" fontSize="10px" />
            </Tooltip>
          ) : null}
          {lead.willPurchase ? (
            <Tooltip title="Will Purchase">
              <AttachMoneyRounded color="primary" fontSize="10px" />
            </Tooltip>
          ) : null}
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          // spacing={2}
        >
          <Typography color="text.secondary">{`Status: ${status}`}</Typography>
          <StatusHistory events={lead.changeLog} />
        </Stack>
        <EquipmentSection
          lead={lead}
          setValidationMessage={setValidationMessage}
          setOpenError={setOpenError}
          setOpenSuccess={setOpenSuccess}
        />

        <TaskList
          lead={lead}
          tasks={tasks}
          setValidationMessage={setValidationMessage}
          setOpenError={setOpenError}
          setOpenSuccess={setOpenSuccess}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          // spacing={2}
        >
          <ContactHistory events={lead.contactLog} />
          <Typography variant="caption" color="text.secondary">
            {`Updated ${relativeTime(lead.changeLog[0].timestamp)}`}
          </Typography>
        </Stack>
      </CardContent>
      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {validationMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openError}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {validationMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}
