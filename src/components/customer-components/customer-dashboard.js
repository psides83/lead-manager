import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  Paper,
  TextareaAutosize,
  IconButton,
} from "@mui/material";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, storage } from "../../services/firebase";
import { useStateValue } from "../../state-management/state-provider";
import CustomerCard from "./customer-card";
import { Check } from "@mui/icons-material";
import CustomerMessenger from "./customer-messenger";
import { formatPhoneNumber } from "../../utils/utils";
import Loading from "../loading";

const filters = ["Active", "Closed"];

function CustomerDashboard() {
  const timer = useRef();
  // const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [{ loading, userProfile }, dispatch] = useStateValue("");
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

  const endLoading = () => {
    if (userProfile) {
      timer.current = window.setTimeout(() => {
        dispatch({
          type: "SET_LOADING",
          loading: false,
        });
      }, 1500);
    }
  };

  //    Fetch leads from firestore
  const fetchLeads = useCallback(async () => {
    if (userProfile != undefined) {

      const leadsQuery = query(
        collection(db, "leads"),
        where("uid", "==", userProfile?.id),
        where("status", "!=", "Closed")
      );

    onSnapshot(leadsQuery, (querySnapshot) => {
      setLeads(
        querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          uid: doc.data().uid,
          salesmanID: doc.data().salesmanID,
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
          quoteLink: doc.data().quoteLink
        }))
      );
    });
  };
    endLoading();
  }, [userProfile]);

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
        <Grid container justifyContent="center">
          {leads.map((lead) => (
            <Grid key={lead.id} item xs={12} sm={6} md={6} lg={4}>
              <CustomerCard lead={lead} />
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={6} lg={4}>
            {leads.length !== 0 && (
              <CustomerMessenger user={userProfile} leads={leads} />
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default CustomerDashboard;
