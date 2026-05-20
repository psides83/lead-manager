import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
// import {
//   getDoc,
//   doc,
// } from "firebase/firestore";
// import { db } from "../../services/firebase";
import { branches } from "../../models/static-data";
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
import { AuthContext } from "../../state-management/auth-context-provider";
import { SearchContext } from "../../state-management/search-provider";

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
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
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
  const { userProfile } = useContext(AuthContext);
  const { searchText } = useContext(SearchContext);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParam] = useState(["branch", "firstName", "lastName"]);
  const [filterParam, setFilterParam] = useState("All");
  const [emails, setEmails] = useState("");
  const [isShowingTransferRequest, setisShowingTransferRequest] =
    useState(false);
  // #endregion

  const normalizeValue = useCallback((value) => {
    return String(value || "")
      .trim()
      .toLowerCase();
  }, []);

  const normalizeBranchToken = useCallback((value) => {
    return normalizeValue(value).replace(/[^a-z0-9]/g, "");
  }, [normalizeValue]);

  const handleCloseTransferRequest = () => {
    setisShowingTransferRequest(false);
  };

  const handleToggleTransferRequest = () => {
    setEmails(() => {
      const branchEmails = visibleSalesmen
        .map((salesman) => salesman.email)
        .filter(Boolean);
      return branchEmails.join("; ");
    });
    setisShowingTransferRequest(!isShowingTransferRequest);
  };

  // Fetch loanerss from firestore:
  const fetchSalesmen = useCallback(async () => {
    if (userProfile) {
      // const docRef = doc(db, "salesmen", "salesmen");
      // const docSnap = await getDoc(docRef);

      // setSalesmen(docSnap.data().list);
      // console.log(docSnap.data().list);

      const API_URL = "https://psides83.github.io/listJSON/salesmanList.json";
      const response = await fetch(API_URL);
      const json = await response.json();
      console.log(json);
      setSalesmen(json);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchSalesmen();
    setTimeout(function () {
      setLoading(false);
    }, 1000);
  }, [fetchSalesmen]);

  const visibleSalesmen = useMemo(() => {
    const normalizedSearch = (searchText || "").trim().toLowerCase();
    const normalizedFilter = normalizeBranchToken(filterParam || "All");

    return [...salesmen]
      .sort((a, b) =>
        String(a?.branch || "").localeCompare(String(b?.branch || ""))
      )
      .filter((item) => {
        const branchValue = normalizeValue(item?.branch);
        const normalizedBranchValue = normalizeBranchToken(branchValue);
        const branchMatches =
          normalizedFilter === "all" ||
          normalizedBranchValue === normalizedFilter;

        if (!branchMatches) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return searchParam.some((newItem) =>
          String(item?.[newItem] || "")
            .toLowerCase()
            .includes(normalizedSearch)
        );
      });
  }, [
    filterParam,
    normalizeBranchToken,
    normalizeValue,
    salesmen,
    searchParam,
    searchText,
  ]);

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
                    {visibleSalesmen.map((salesman, index) => (
                      <Row
                        key={salesman?.id ?? `${salesman?.email || "salesman"}-${index}`}
                        salesman={salesman}
                      />
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
