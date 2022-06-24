import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useStateValue } from "../../state-management/state-provider";
import CustomerCard from "./customer-card";
import CustomerMessenger from "./customer-messenger";
import Loading from "../loading";

function CustomerDashboard(props) {
  const { leadId } = props;
  const timer = useRef();
  const [lead, setLead] = useState();
  const [{ loading, userProfile }, dispatch] = useStateValue("");
  // eslint-disable-next-line
  const [openSuccess, setOpenSuccess] = useState(false);
  // eslint-disable-next-line
  const [openError, setOpenError] = useState(false);
  // eslint-disable-next-line
  var [validationMessage, setValidationMessage] = useState("");
  // eslint-disable-next-line
  const [value, setValue] = useState("leads");

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
    if (leadId !== undefined || leadId !== null || leadId !== "") {
      console.log(`leadId = ${leadId}`);

      onSnapshot(doc(db, "leads", leadId), (doc) => {
        setLead(doc.data());
      });
      console.table(lead);
    }
    endLoading();
    // eslint-disable-next-line
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  if (lead !== undefined && lead.status !== "Closed") {
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
              {lead !== undefined && <CustomerCard lead={lead} />}
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={4}>
              {leadId !== undefined && (
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
