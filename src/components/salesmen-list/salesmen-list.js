import React, { useCallback, useEffect, useState } from "react";
import { useStateValue } from "../../state-management/state-provider";
import {
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { branches } from "../../models/arrays";
import {
  Box,
  Button,
  Dialog,
  Link,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { CancelOutlined, LocalShippingRounded } from "@mui/icons-material";
import TransferRequestView from "./transfer-request";
import HomeSkeleton from "../loading-views/home-skeleton";
import "../salesmen-list/salesmen-list.css";

// Header for the sub-table of equipment
function SalesmenTableHeaderView() {
  const headers = ["Branch", "Name", "Email"];

  return (
    <React.Fragment>
      <TableHead>
        <TableRow key="subHeader">
          {headers.map((header) => (
            <TableCell key={header}>
              <strong>{header}</strong>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    </React.Fragment>
  );
}

// Loaner row view:
function Row({ salesman }) {
  const fullName = `${salesman.firstName} ${salesman.lastName}`;

  // Request row UI:
  return (
    <React.Fragment>
      <TableRow key={salesman.id} sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell key="branch" component="th" scope="row">
          {salesman.branch}
        </TableCell>

        <TableCell key="name" align="left">
          {fullName}
        </TableCell>

        <TableCell key="email" component="th" scope="row">
          <Link href={`mailto:${salesman.email}`}>{salesman.email}</Link>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Whole table view:
export default function SalesmenList() {
  // #region State Properties
  const [{ userProfile, searchText }] = useStateValue();
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParam] = useState(["branch", "firstName", "lastName"]);
  const [filterParam, setFilterParam] = useState("All");
  const [emails, setEmails] = useState("");
  const [isShowingTransferRequest, setisShowingTransferRequest] =
    useState(false);
  // #endregion

  const handleCloseTransferRequest = () => {
    setisShowingTransferRequest(false);
  };

  const handleToggleTransferRequest = () => {
    setEmails(() => {
      var branchEmails = [];
      search(salesmen).map((salesman) => branchEmails.push(salesman.email));
      return branchEmails.toString().replace(/,/g, "; ");
    });
    setisShowingTransferRequest(!isShowingTransferRequest);
  };

  // Fetch loanerss from firestore:
  const fetch = useCallback(async () => {
    if (userProfile) {
      const docRef = doc(db, "salesmen", "salesmen");
      const docSnap = await getDoc(docRef);

      setSalesmen(docSnap.data().list);
      console.log(docSnap.data().list);
    }
  }, [userProfile]);

  useEffect(() => {
    fetch();
    setTimeout(function () {
      setLoading(false);
    }, 1000);
  }, [fetch]);

  const search = (salesmen) => {
    return salesmen
      .sort(function (a, b) {
        return a.branch - b.branch;
      })
      .filter((item) => {
        /*
      // in here we check if our region is equal to our c state
      // if it's equal to then only return the items that match
      // if not return All the countries
      */
        if (item.branch === filterParam) {
          return searchParam.some((newItem) => {
            return (
              item[newItem]
                .toString()
                .toLowerCase()
                .indexOf(searchText.toLowerCase()) > -1
            );
          });
        } else if (filterParam === "All") {
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

  // Table UI:
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        my: "5",
      }}
    >
      <Box sx={{ width: "95%", mt: 5, mx: 5 }}>
        <Box sx={{ flexGrow: 1, my: 5 }}>
          {loading ? (
            <HomeSkeleton />
          ) : (
            <>
              <div className="tableHead">
                <Typography
                  variant="h4"
                  color="primary"
                  style={{ marginLeft: 25, marginBottom: 10 }}
                >
                  {"Active Salesmen"}
                </Typography>

                <div className="searchAndFilter">
                  {filterParam !== "All" ? (
                    <div className="transferButton">
                      <Button
                        key="tansferButton"
                        color="primary"
                        variant="outlined"
                        endIcon={<LocalShippingRounded />}
                        onClick={handleToggleTransferRequest}
                      >
                        Requst Transfer
                      </Button>

                      <Dialog
                        key="transferDialog"
                        onClose={handleCloseTransferRequest}
                        open={isShowingTransferRequest}
                      >
                        <div className="closeButtonContainer">
                          <Button
                            onClick={handleCloseTransferRequest}
                            color="primary"
                          >
                            <CancelOutlined />
                          </Button>
                        </div>

                        <div className="transferRequestView">
                          <TransferRequestView emails={emails} />
                        </div>
                      </Dialog>
                    </div>
                  ) : null}

                  <div className="filter">
                    <TextField
                      size="small"
                      fullWidth
                      variant="outlined"
                      labelid="demo-simple-select-label"
                      id="filter"
                      // className={classes.select}
                      value={filterParam}
                      label="Filter"
                      onChange={(e) => setFilterParam(e.target.value)}
                      select
                    >
                      <MenuItem value="All">All</MenuItem>
                      {branches.map((branch) => (
                        <MenuItem key={branch} value={branch}>
                          {branch}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                </div>
              </div>
              <TableContainer component={Paper} style={{ borderRadius: 10 }}>
                <Table
                  size="small"
                  aria-label="collapsible table"
                  style={{ margin: 15 }}
                  sx={{ paddingTop: 2 }}
                >
                  <SalesmenTableHeaderView />
                  <TableBody>
                    {search(salesmen).map((salesman) => (
                      <Row key={salesman.email} salesman={salesman} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
