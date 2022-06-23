import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  Paper,
  TextareaAutosize,
  IconButton,
  Typography,
} from "@mui/material";
import {
  collection,
  doc,
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

function CustomerDashboard(props) {
  const { leadId } = props;
  const timer = useRef();
  // const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState();
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
  const fetchLead = useCallback(async () => {
    if (leadId != undefined || leadId != null || leadId !== "") {
      console.log(`leadId = ${leadId}`);
      // const leadsQuery = query(
      //   collection(db, "leads"),
      //   where("id", "==", leadId)
      //   // where("uid", "==", userProfile?.id),
      //   // where("status", "!=", "Closed")
      // );

      onSnapshot(doc(db, "leads", leadId), (doc) => {
        setLead(doc.data());
      });
      console.table(lead);
    }
    endLoading();
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (lead != undefined && lead.status !== "Closed") {
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
            <Grid item xs={12} sm={6} md={6} lg={4}>
              {lead != undefined && <CustomerCard lead={lead} />}
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={4}>
              {leadId != undefined && (
                <div
                  style={{
                    margin: "12px",
                  }}
                >
                  <CustomerMessenger user={userProfile} lead={lead} />
                </div>
              )}
            </Grid>
          </Grid>
        </Box>
      </>
    );
  } else if (loading) {
    return <Loading />;
  } else {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography
          variant="h2"
          color="GrayText"
          style={{ fontWeight: "bold" }}
        >
          Empty Link
        </Typography>
        <Typography variant="h4" color="GrayText">
          This link is no longer active or does not exist.
          <br /> Please check the link or contact your salesman.
        </Typography>
      </Box>
    );
  }
}

export default CustomerDashboard;
