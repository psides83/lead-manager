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
    const salesQuery = query(
      collection(db, "salesDataByMonth"),
      orderBy("id", "asc")
    );

    onSnapshot(salesQuery, (querySnapshot) => {
      setSales(
        querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          date: doc.data().date,
          month: doc.data().month,
          year: doc.data().year,
          sales: Number(doc.data().sales),
          margin: Number(doc.data().margin),
          cost: Number(doc.data().sales - doc.data().margin),
          commission: Number(doc.data().commission),
          bonus: Number(doc.data().bonus),
        }))
      );
    });
    // eslint-disable-next-line
  }, [filterParam]);

  const calculateSales = (category) => {
    var salesDollars = 0;
    var marginDollars = 0;
    var commission = 0;
    var bonus = 0;
    // console.log(year);
    // console.log(type);

    sales
      ?.filter((sale) => {
        if (sale.year === selectedYear) {
          return sale;
        }
        return null;
      })
      .forEach((value) => {
        salesDollars += value.sales;
        marginDollars += value.margin;
        commission += value.commission;
        bonus += value.bonus;
      });

    if (category === "sales") return salesDollars;

    if (category === "margin") return marginDollars;

    if (category === "commission") return commission;

    if (category === "bonus") return bonus;
  };

//   Compares the sales trend of the selected year from the previous year
  const currentVsPreviousYearToDate = () => {
    const currentYear = moment().format("yyyy");
    const previousYear = moment(selectedYear, "yyyy")
      .subtract(1, "years")
      .format("yyyy");
    const currentMonth = moment().format("MM");

    var selectedYearTotal = 0;
    var previousYearToDate = 0;

    sales
      ?.filter((sale) => {
        if (sale.year === selectedYear) return sale;
        return null;
      })
      .forEach((value) => {
        if (selectedCategory === "sales") selectedYearTotal += value.sales;
        if (selectedCategory === "margin") selectedYearTotal += value.margin;
        if (selectedCategory === "commission")
          selectedYearTotal += value.commission;
        if (selectedCategory === "bonus") selectedYearTotal += value.bonus;
      });

    sales
      ?.filter((sale) => {
        if (selectedYear === currentYear) {
          if (
            sale.year === previousYear &&
            sale.month >= "01" &&
            sale.month <= currentMonth
          )
            return sale;
        } else {
          if (sale.year === previousYear) return sale;
        }

        return null;
      })
      .forEach((value) => {
        if (selectedCategory === "sales") previousYearToDate += value.sales;
        if (selectedCategory === "margin") previousYearToDate += value.margin;
        if (selectedCategory === "commission")
          previousYearToDate += value.commission;
        if (selectedCategory === "bonus") previousYearToDate += value.bonus;
      });

    console.log(`${selectedYear} Total: ${selectedYearTotal}`);
    console.log(`${previousYear} Total: ${previousYearToDate}`);

    const difference = selectedYearTotal / previousYearToDate - 1;

    return difference;
  };

//   turns the above trend calculation into a perecnt value string
  const percentChange = `${Math.abs(
    Math.round(currentVsPreviousYearToDate() * 100))}%`;

// calculates the margin percentage of the selected year, outputs as a string
  const marginPercentage = () => {
    const rawMargin = calculateSales("margin") / calculateSales("sales");
    return `${Math.round(rawMargin * 10000) / 100}%`;
  };

// sets the UI for to show the trend is up or down with an appropriately colored arrow
  const trend = () => {
    if (currentVsPreviousYearToDate() === 0) {
      return (
        <Typography>
          <strong>the same</strong> as last year
        </Typography>
      );
    }
    if (currentVsPreviousYearToDate() < 0) {
      return (
        <Stack direction="row">
          <ArrowDownwardRounded color="error" />
          <Typography>
            <strong>{percentChange}</strong> from last year
          </Typography>
        </Stack>
      );
    }
    if (currentVsPreviousYearToDate() > 0) {
      return (
        <Stack direction="row">
          <ArrowUpwardRounded color="success" />
          <Typography>
            <strong>{percentChange}</strong> from last year
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
            {currencyFormatter.format(calculateSales(selectedCategory))}
          </Typography>
          <Typography sx={{ margin: "0 2px 2px 0", padding: "0 8px 8px 0" }}>
            <strong>Margin</strong> {marginPercentage()}
          </Typography>
        </Stack>
      </Paper>

      <SalesDataGrid sales={sales} selectedYear={selectedYear} />
    </Box>
  );
}
