import React, { useCallback, useState, useEffect, useRef, useContext } from "react";
import LeadCard from "./lead-card/lead-card";
import {
  Box,
  Grid,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Tasks from "./task-list";
import { Toaster } from "react-hot-toast";
import { SearchContext } from "../../state-management/search-provider";
import { fetch, searchable } from "./dashboard-view-model";

const filters = ["Active", "Closed"];

function LeadDashboard() {
  const timer = useRef();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  // eslint-disable-next-line
  const {searchText} = useContext(SearchContext)
  const [searchParam] = useState(["name", "phone"]);
  const [filterParam, setFilterParam] = useState("Active");
  // eslint-disable-next-line
  const [openSuccess, setOpenSuccess] = useState(false);
  // eslint-disable-next-line
  const [openError, setOpenError] = useState(false);
  const [value, setValue] = useState("leads");

  // Handle closing of the alerts.
  // eslint-disable-next-line
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  //    Fetch leads from firestore
  const fetchLeads = useCallback(async () => {
    fetch(setLeads, filterParam, timer, setLoading)
  }, [filterParam]);

  const fetchTasks = useCallback(async () => {
    fetch(setTasks)
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchTasks();
  }, [fetchLeads, fetchTasks]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
        {!loading && (
          <Grid
            container
            justifyContent={value === "leads" ? "flex-start" : "center"}
          >
            {value === "leads" ? (
              searchable(leads, searchParam, searchText).map((lead) => (
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
        )}
      </Box>
      <Toaster position="top-center" reverseOrder={true} />
    </>
  );
}

export default LeadDashboard;
