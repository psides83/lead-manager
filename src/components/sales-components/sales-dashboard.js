import React, { useState, useEffect, useCallback, useContext } from "react";
import { currencyFormatter } from "../../utils/utils";
import moment from "moment";
// eslint-disable-next-line
import { Box, Paper, Stack, Typography } from "@mui/material";
import { ArrowDownwardRounded, ArrowUpwardRounded } from "@mui/icons-material";
import { categories, years } from "../../models/arrays";
import SalesCharts from "./sales-charts";
import ToggleButtons from "../ui-components/toggle-buttons";
import SalesDataGrid from "./sales-data-grid";
import SalesDashboardViewModel from "./sales-dashboard-view-model";
import { AuthContext } from "../../state-management/auth-context-provider";

export default function SalesDashboard() {
  const { userProfile } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("sales");
  const [selectedYear, setSelectedYear] = useState(moment().format("yyyy"));

  const viewModel = new SalesDashboardViewModel(sales, setSales, selectedYear, selectedCategory)

  //    Fetch leads from firestore
  const fetchSales = useCallback(async () => {
    await viewModel.fetch();
    // eslint-disable-next-line
  }, []);

   // fetches sales data from Firestore
   useEffect(() => {
    fetchSales();

  }, [fetchSales]);

  // sets the UI for to show the trend is up or down with an appropriately colored arrow
  const trend = () => {
    if (viewModel.currentVsPreviousYearToDate() === 0) {
      return (
        <Typography>
          <strong>the same</strong> as last year
        </Typography>
      );
    }
    if (viewModel.currentVsPreviousYearToDate() < 0) {
      return (
        <Stack direction="row">
          <ArrowDownwardRounded color="error" />
          <Typography>
            <strong>{viewModel.percentChange()}</strong> from last year
          </Typography>
        </Stack>
      );
    }
    if (viewModel.currentVsPreviousYearToDate() > 0) {
      return (
        <Stack direction="row">
          <ArrowUpwardRounded color="success" />
          <Typography>
            <strong>{viewModel.percentChange()}</strong> from last year
          </Typography>
        </Stack>
      );
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        // height: 680,
        width: "98vw",
        // background: "white",
        // border: "solid black 2px",
        // borderRadius: "10px",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
      }}
    >
      <ToggleButtons
        toggleValue={selectedCategory}
        setToggleValue={setSelectedCategory}
        selections={categories}
      />
      <ToggleButtons
        toggleValue={selectedYear}
        setToggleValue={setSelectedYear}
        selections={years(userProfile.yearStarted)}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          maxWidth: "500px",
          margin: "20px",
        }}
      >
        <Typography
          variant="h5"
          color="primary"
          sx={{ fontWeight: "medium" }}
          alignSelf="center"
        >
          {selectedCategory.replace(/\b\w/g, (c) => c.toUpperCase())}
        </Typography>
        {selectedYear !== "2019" ? (
          <>
            <Typography>
              Your <strong>{selectedCategory}</strong> is
            </Typography>
            {trend()}
          </>
        ) : null}
      </Box>
      <Paper
        elevation={4}
        sx={{ borderRadius: "10px", minWidth: "350px", marginTop: "8px" }}
      >
        <SalesCharts
          data={sales}
          year={selectedYear}
          category={selectedCategory}
        />
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ margin: "0 0 2px 2px", padding: "0 0 8px 8px" }}>
            <strong>Total</strong>{" "}
            {currencyFormatter.format(viewModel.calculateSales(selectedCategory))}
          </Typography>
          <Typography sx={{ margin: "0 2px 2px 0", padding: "0 8px 8px 0" }}>
            <strong>Margin</strong> {viewModel.marginPercentage()}
          </Typography>
        </Stack>
      </Paper>

      <SalesDataGrid sales={sales} selectedYear={selectedYear} />
    </Box>
  );
}
