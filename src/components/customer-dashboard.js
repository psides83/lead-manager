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
  Paper,
  TextareaAutosize,
  IconButton,
} from "@mui/material";
import AddLead from "./add-lead.js";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, storage } from "../services/firebase";
import { useStateValue } from "../state-management/state-provider";
import Tasks from "./task-list";
import CustomerCard from "./customer-card";
import CustomerAppBar from "./customer-app-bar";
import { ref } from "firebase/storage";
import { Check, MessageSharp } from "@mui/icons-material";

const filters = ["Active", "Closed"];

function CustomerDashboard(props) {
  const { customer } = props;
  const timer = useRef();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [{ searchText, user }, dispatch] = useStateValue("");
  const [searchParam] = useState(["name"]);
  const [message, setMessage] = useState("");
  const [filterParam, setFilterParam] = useState("Active");
  const [open, setOpen] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  var [validationMessage, setValidationMessage] = useState("");
  const [value, setValue] = useState("leads");

  const messages = [{id: "1", sender: customer, message: "hello"}, {id: "2", sender: user, message: "hey, how are you?"}]

  // Handle closing of the alerts.
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  function formatPhoneNumber(phoneNumberString) {
    var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return null;
  }

  //    Fetch leads from firestore
  const fetchLeads = useCallback(async () => {
    const leadsQuery = query(
      collection(db, "leads"),
      where("phone", "==", formatPhoneNumber(customer.phone))
    );

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
    timer.current = window.setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [filterParam]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: "75px",
        }}
      >
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
          <Grid container justifyContent="center">
            {leads.map((lead) => (
              <Grid key={lead.id} item xs={12} sm={6} md={6} lg={4}>
                <CustomerCard lead={lead} />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <Paper
                sx={{
                  padding: "10px 10px 10px 10px",
                  backgroundColor: "whitesmoke",
                  borderRadius: 2,
                  marginTop: "12px",
                }}
              >

                <Box>
                  {messages.map((message) => (
                    <Box sx={{display: "flex", justifyContent: message.sender === customer ? "flex-end" : "flex-start"}}>{message.message}</Box>
                  ))}
                </Box>
                
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    width: "100%",
                    borderRadius: "20px",
                    border: "none",
                    backgroundColor: "#e9e9e9",
                    marginTop: "5px"
                  }}
                >
                  <TextareaAutosize
                    placeholder="message..."
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
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <IconButton disabled={!message}>
                    {/* <UpArrow color="white" padding="1px" backgroundColor={!message ? color.flatGray : color.primary} borderRadius="20px" /> */}
                    <Check
                      style={{
                        padding: "1px",
                        color: "white",
                        backgroundColor: !message ? "gray" : "#367C2B",
                        borderRadius: "20px",
                      }}
                    />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </>
  );
}

export default CustomerDashboard;
