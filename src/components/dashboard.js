import React, { useCallback, useState, useEffect } from "react";
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
} from "@mui/material";
import AddLead from "./add-lead.js";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useStateValue } from "../state-management/state-provider";
import Tasks from "./task-list";

const filters = ["Active", "Closed"];

function LeadDashboard() {
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [{ searchText }, dispatch] = useStateValue("");
  const [searchParam] = useState(["name"]);
  const [filterParam, setFilterParam] = useState("Active");
  const [open, setOpen] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  var [validationMessage, setValidationMessage] = useState("");
  const [value, setValue] = useState("leads");

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  //    Fetch leads from firestore
  const fetchLeads = useCallback(async () => {
    const leadsQuery = query(collection(db, "leads"), orderBy("id", "asc"));

    onSnapshot(leadsQuery, (querySnapshot) => {
      setLeads(
        querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          timestamp: doc.data().timestamp,
          name: doc.data().name,
          email: doc.data().email,
          phone: doc.data().phone,
          status: doc.data().status,
          notes: doc.data().notes,
          willFinance: doc.data().willFinance,
          hasTrade: doc.data().hasTrade,
          willPurchase: doc.data().willPurchase,
          changeLog: doc.data().changeLog,
          contactLog: doc.data().contactLog,
          equipment: doc.data().equipment,
        }))
      );
    });
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
    fetchLeads();
    fetchTasks();
  }, [fetchLeads]);

  const search = (leads) => {
    return leads.filter((item) => {
      /*
      // in here we check if our region is equal to our c state
      // if it's equal to then only return the items that match
      // if not return All the countries
      */
      if (filterParam === "Closed" && item.status === filterParam) {
        return searchParam.some((newItem) => {
          return (
            item[newItem]
              .toString()
              .toLowerCase()
              .indexOf(searchText.toLowerCase()) > -1
          );
        });
      } else if (filterParam !== "Closed" && item.status !== "Closed") {
        return searchParam.some((newItem) => {
          return (
            item[newItem]
              .toString()
              .toLowerCase()
              .indexOf(searchText.toLowerCase()) > -1
          );
        });
      }
      return null;
    });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          style={{ margin: "10px 20px 0 20px" }}
        >
          <Box></Box>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Leads" value="leads" />
            <Tab label="Tasks" value="tasks" />
          </Tabs>
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
        <Grid container justifyContent={value === "leads" ? "flex-start" : "center"}>
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
      </Box>
    </>
  );
}

export default LeadDashboard;
