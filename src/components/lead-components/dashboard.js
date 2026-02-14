import React, { useCallback, useState, useEffect, useRef, useContext } from "react";
import LeadCard from "./lead-card/lead-card";
import {
  Box,
  Container,
  Divider,
  Tabs,
  Tab,
  TextField,
  MenuItem,
} from "@mui/material";
import Tasks from "./task-list";
import { Toaster } from "react-hot-toast";
import { SearchContext } from "../../state-management/search-provider";
import { fetch, fetchClosedLeadsForIntelligence, searchable } from "./dashboard-view-model";
import LeadDashboardSkeleton from "../loading-views/lead-dashboard-skeleton";
import WinLossIntelligence from "./win-loss-intelligence";

const filters = ["Active", "Closed"];

function LeadDashboard() {
  const timer = useRef();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [closedLeads, setClosedLeads] = useState([]);
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
    setLoading(true);
    fetch(setLeads, filterParam, timer, setLoading)
  }, [filterParam]);

  const fetchTasks = useCallback(async () => {
    fetch(setTasks)
  }, []);

  const fetchIntelligence = useCallback(() => {
    return fetchClosedLeadsForIntelligence(setClosedLeads);
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchTasks();
    const unsubscribe = fetchIntelligence();
    return () => unsubscribe?.();
  }, [fetchLeads, fetchTasks, fetchIntelligence]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const visibleLeads = searchable(leads, searchParam, searchText);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "nowrap",
            gap: 1,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            sx={{
              minHeight: 38,
              flexShrink: 1,
              "& .MuiTab-root": { minHeight: 38 },
            }}
          >
            <Tab label="Leads" value="leads" />
            <Tab label="Tasks" value="tasks" />
          </Tabs>
          <TextField
            select
            size="small"
            color="secondary"
            variant="outlined"
            id="filter"
            value={filterParam}
            label="Filter"
            onChange={(e) => setFilterParam(e.target.value)}
            sx={{ width: 130, flexShrink: 0 }}
          >
            {filters?.map((filter) => (
              <MenuItem key={filter} value={filter}>
                {filter}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Divider sx={{ my: 2 }} />

        {value === "leads" ? (
          <WinLossIntelligence closedLeads={closedLeads} />
        ) : null}

        {loading ? (
          <LeadDashboardSkeleton />
        ) : (
          <>
            {value === "leads" ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 380px)",
                    md: "repeat(2, 380px)",
                  },
                  alignItems: "start",
                  gap: 2,
                  maxWidth: 800,
                  mx: "auto",
                  justifyContent: "center",
                }}
              >
                {visibleLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} tasks={tasks} />
                ))}
              </Box>
            ) : (
              <Box sx={{ mt: "10px", display: "flex", justifyContent: "center" }}>
                <Tasks />
              </Box>
            )}
          </>
        )}
      </Container>
      <Toaster position="top-center" reverseOrder={true} />
    </>
  );
}

export default LeadDashboard;
