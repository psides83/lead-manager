import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  // eslint-disable-next-line
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { currencyFormatter } from "../../utils/utils";
import moment from "moment";
// eslint-disable-next-line
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { ArrowDownwardRounded, ArrowUpwardRounded } from "@mui/icons-material";
import { categories, years } from "../../models/arrays";
import SalesCharts from "./sales-charts";
import ToggleButtons from "../ui-components/toggle-buttons";
import SalesDataGrid from "./sales-data-grid";
import { calculateSales, currentVsPreviousYearToDate, fetch, marginPercentage, percentChange } from "./sales-dashboard-view-model";

export default function SalesDashboard() {
  const [sales, setSales] = useState([]);
  // eslint-disable-next-line
  const [filterParam, setFilterParam] = useState("All");
  // eslint-disable-next-line
  const [salesData, setSalesData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("sales");
  const [selectedYear, setSelectedYear] = useState(moment().format("yyyy"));

  //    Fetch leads from firestore
  const fetchSales = useCallback(async () => {
    await fetch(setSales);
    // eslint-disable-next-line
  }, [filterParam]);

  // sets the UI for to show the trend is up or down with an appropriately colored arrow
  const trend = () => {
    if (currentVsPreviousYearToDate(sales, selectedYear, selectedCategory) === 0) {
      return (
        <Typography>
          <strong>the same</strong> as last year
        </Typography>
      );
    }
    if (currentVsPreviousYearToDate(sales, selectedYear, selectedCategory) < 0) {
      return (
        <Stack direction="row">
          <ArrowDownwardRounded color="error" />
          <Typography>
            <strong>{percentChange(sales, selectedYear, selectedCategory)}</strong> from last year
          </Typography>
        </Stack>
      );
    }
    if (currentVsPreviousYearToDate(sales, selectedYear, selectedCategory) > 0) {
      return (
        <Stack direction="row">
          <ArrowUpwardRounded color="success" />
          <Typography>
            <strong>{percentChange(sales, selectedYear, selectedCategory)}</strong> from last year
          </Typography>
        </Stack>
      );
    }
  };

  // fetches sales data from Firestore
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

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
        selections={years}
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
            {currencyFormatter.format(calculateSales(sales, selectedYear, selectedCategory))}
          </Typography>
          <Typography sx={{ margin: "0 2px 2px 0", padding: "0 8px 8px 0" }}>
            <strong>Margin</strong> {marginPercentage(sales, selectedYear)}
          </Typography>
        </Stack>
      </Paper>

      <SalesDataGrid sales={sales} selectedYear={selectedYear} />
    </Box>
  );
}
