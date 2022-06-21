import React, { useCallback, useState, useEffect, useRef } from "react";
import LeadCard from "./lead-card";
import {
  Box,
  Grid,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  CircularProgress,
  Typography,
  Drawer,
  IconButton,
} from "@mui/material";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useStateValue } from "../../state-management/state-provider";
import Tasks from "./task-list";
import { useViewport } from "../../utils/viewport-provider";
import { ListAltRounded } from "@mui/icons-material";

const filters = ["Active", "Closed"];

function LeadDashboard() {
  const timer = useRef();
  const { width } = useViewport();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [{ searchText }, dispatch] = useStateValue("");
  const [searchParam] = useState(["name", "phone"]);
  const [filterParam, setFilterParam] = useState("Active");
  const [open, setOpen] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  var [validationMessage, setValidationMessage] = useState("");
  const [isShowingTasksDrawer, setIsShowingTasksDrawer] = useState(false);
  const [value, setValue] = useState("leads");
  const breakpoint = 900;

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  const toggleTasksDrawer = (e) => {
    e.preventDefault();
    if (isShowingTasksDrawer) {
      setIsShowingTasksDrawer(false);
    } else {
      setIsShowingTasksDrawer(true);
    }
  };

  //    Fetch leads from firestore
  const fetchLeads = useCallback(async () => {
    var leadsQuery;
    if (filterParam === "Closed") {
      leadsQuery = query(
        collection(db, "leads"),
        where("status", "==", "Closed"),
      );
    } else {
      leadsQuery = query(
        collection(db, "leads"),
        where("status", "!=", "Closed"),
      );
    }

    onSnapshot(leadsQuery, (querySnapshot) => {
      setLeads(
        querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          uid: doc.data().uid,
          timestamp: doc.data().timestamp,
          name: doc.data().name,
          email: doc.data().email,
          phone: doc.data().phone,
          status: doc.data().status,
          notes: doc.data().notes,
          quoteLink: doc.data().quoteLink,
          willFinance: doc.data().willFinance,
          hasTrade: doc.data().hasTrade,
          willPurchase: doc.data().willPurchase,
          changeLog: doc.data().changeLog,
          contactLog: doc.data().contactLog,
          equipment: doc.data().equipment,
          messages: doc.data().messages
        }))
      );
    });
    // timer.current = window.setTimeout(() => {
    //   setLoading(false)
    // }, 1000);
  }, [filterParam]);

  const fetchTasks = useCallback(async () => {
    const taskQuery = query(
      collection(db, "tasks"),
      // where("isComplete", "!=", true),
      orderBy("isComplete"),
      orderBy("order", "asc")
    );

    onSnapshot(taskQuery, (querySnapshot) => {
      setTasks(
        querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          leadID: doc.data().leadID,
          leadName: doc.data().leadName,
          task: doc.data().task,
          isComplete: doc.data().isComplete,
          timestamp: doc.data().timestamp,
        }))
      );
    });
  }, []);

  useEffect(() => {
    fetchLeads().then(() => {
      console.log("no  longer loading");
      setLoading(false);
    });
    fetchTasks();
  }, [fetchLeads, fetchTasks]);

  const search = (leads) => {
    return leads.sort(function (a, b) {
      return a.id - b.id;
    }).filter((item) => {
      /*
      // in here we check if our region is equal to our c state
      // if it's equal to then only return the items that match
      // if not return All the countries
      */

      return searchParam.some((newItem) => {
        return (
          item[newItem]
            .toString()
            .toLowerCase()
            .replace(/[^0-9, a-z]/g, "")
            .replace(/\s/g, "")
            .indexOf(searchText.toLowerCase().replace(/\s/g, "")) > -1
        );
      });
    });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const MobileView = () => {
    return (
      <Grid
        container
        justifyContent={value === "leads" ? "flex-start" : "center"}
      >
        {value === "leads" ? (
          search(leads).map((lead) => (
            <Grid key={lead.id} item xs={12} sm={6} md={6} lg={4}>
              <LeadCard lead={lead} tasks={tasks} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12} sm={6} md={6} lg={4} sx={{ mt: "10px" }}>
            <Box display="flex" justifyContent="center">
              <Tasks />
            </Box>
          </Grid>
        )}
      </Grid>
    );
  };

  const DesktopView = () => {
    return (
      <>
        <Grid container justifyContent={"flex-start"}>
          {search(leads).map((lead) => (
            <Grid key={lead.id} item xs={12} sm={6} md={6} lg={4}>
              <LeadCard lead={lead} tasks={tasks} />
            </Grid>
          ))}
        </Grid>
        <Drawer
          anchor="left"
          open={isShowingTasksDrawer}
          onClose={toggleTasksDrawer}
        >
          <Box>
            <Tasks />
          </Box>
        </Drawer>
      </>
    );
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          style={{ margin: "10px 20px 0 20px" }}
        >
          {width > breakpoint ? (
            <IconButton onClick={toggleTasksDrawer}>
              <ListAltRounded />
            </IconButton>
          ) : null}
          <Box></Box>
          {width < breakpoint ? (
            <Tabs className="tabs" value={value} onChange={handleChange}>
              <Tab label="Leads" value="leads" />
              <Tab label="Tasks" value="tasks" />
            </Tabs>
          ) : null}
          <div className="cards-filter">
            <TextField
              select
              SelectProps={{ style: { fontSize: 14 } }}
              InputLabelProps={{ style: { fontSize: 14 } }}
              size="small"
              color="secondary"
              fullWidth
              variant="outlined"
              labelid="filter"
              id="filter"
              value={filterParam}
              label="Filter"
              onChange={(e) => setFilterParam(e.target.value)}
            >
              {filters?.map((filter) => (
                <MenuItem key={filter} style={{ fontSize: 14 }} value={filter}>
                  {filter}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </Box>
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {!loading && (width < breakpoint ? <MobileView /> : <DesktopView />)}
      </Box>
    </>
  );
}

export default LeadDashboard;
