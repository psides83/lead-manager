import React, { useState, useEffect, useCallback, useContext } from "react";
import { currencyFormatter } from "../../utils/utils";
import moment from "moment";
// eslint-disable-next-line
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { ArrowDownwardRounded, ArrowUpwardRounded } from "@mui/icons-material";
import { SALES_CATEGORIES, years } from "../../models/static-data";
import SalesCharts from "./sales-charts";
import ToggleButtons from "../ui-components/toggle-buttons";
import SalesDataGrid from "./sales-data-grid";
import SalesDashboardViewModel from "./sales-dashboard-view-model";
import { AuthContext } from "../../state-management/auth-context-provider";
import SalesDashboardSkeleton from "../loading-views/sales-dashboard-skeleton";

export default function SalesDashboard() {
  const { userProfile } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [salesMeta, setSalesMeta] = useState({ source: "", syncedAt: "" });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("sales");
  const [selectedYear, setSelectedYear] = useState(moment().format("yyyy"));
  const categories = Object.values(SALES_CATEGORIES)

  const viewModel = new SalesDashboardViewModel(
    sales,
    setSales,
    selectedYear,
    selectedCategory,
    setSalesMeta
  )


  //    Fetch leads from firestore
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      await viewModel.fetch();
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <SalesDashboardSkeleton />;
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
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
      {salesMeta.source && salesMeta.syncedAt ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 1, textAlign: "center" }}
        >
          Source: {salesMeta.source} | Synced{" "}
          {moment(salesMeta.syncedAt).format("MMM D, YYYY h:mm A")}
        </Typography>
      ) : null}
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
        sx={{
          borderRadius: 2,
          width: "min(100%, 920px)",
          mt: 1,
        }}
      >
        <SalesCharts
          data={sales}
          year={selectedYear}
          category={selectedCategory}
        />
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ margin: "0 0 2px 2px", padding: "0 0 8px 8px" }}>
            <strong>Total</strong>{" "}
            {currencyFormatter.format(viewModel.calculateSales())}
          </Typography>
          <Typography sx={{ margin: "0 2px 2px 0", padding: "0 8px 8px 0" }}>
            <strong>Margin</strong> {viewModel.marginPercentage()}
          </Typography>
        </Stack>
      </Paper>
      <SalesDataGrid sales={sales} selectedYear={selectedYear} />
    </Container>
  );
}
