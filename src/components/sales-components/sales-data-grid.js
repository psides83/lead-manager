import React, { useState, useEffect, useCallback } from "react";
// eslint-disable-next-line
import { DataGrid } from "@mui/x-data-grid";
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

// eslint-disable-next-line
const columns = [
  {
    field: "saleDate",
    headerName: "Date",
    type: "date",
    width: 125,
    editable: false,
    valueGetter: (params) => moment(params.row.saleDate.toDate()).format("ll"),
  },
  {
    field: "model",
    headerName: "Model",
    width: 125,
    editable: false,
  },
  {
    field: "salePrice",
    headerName: "Sale Price",
    type: "",
    width: 125,
    editable: false,
    valueGetter: (params) => currencyFormatter.format(params.row.salePrice),
    align: "center",
  },
  {
    field: "margin",
    headerName: "Margin",
    width: 125,
    editable: false,
    valueGetter: (params) => currencyFormatter.format(params.row.margin),
    align: "center",
  },
  {
    field: "commission",
    headerName: "Commission",
    type: "number",
    width: 125,
    valueGetter: (params) => currencyFormatter.format(params.row.margin * 0.12),
    editable: false,
    align: "center",
  },
  {
    field: "tradeAttached",
    headerName: "Trade Attached",
    width: 100,
    editable: false,
    type: "select",
    valueGetter: (params) =>
      params.row.tradeAttached ? params.row.tradeAttached : null,
  },
  {
    field: "dateTradeSold",
    headerName: "Date Trade Sold",
    width: 125,
    editable: false,
    valueGetter: (params) =>
      params.row.dateTradeSold !== ""
        ? moment(params.row.dateTradeSold.toDate()).format("ll")
        : null,
  },
];

export default function SalesDataGrid() {
  const [sales, setSales] = useState([]);
  // eslint-disable-next-line
  const [filterParam, setFilterParam] = useState("All");
  // eslint-disable-next-line
  const [salesData, setSalesData] = useState({});
  const dataTypes = ["Gross Revenue", "Margin", "Commission", "Bonus"];
  const years = [
    moment().subtract(3, "years").format("yyyy"),
    moment().subtract(2, "years").format("yyyy"),
    moment().subtract(1, "years").format("yyyy"),
    moment().format("yyyy"),
  ];

  // eslint-disable-next-line
  const months = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

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
          commission: Number(doc.data().commission),
          bonus: Number(doc.data().bonus),
        }))
      );
    });
    // eslint-disable-next-line
  }, [filterParam]);

  const calculateSales = (type, year) => {
    var salesDollars = 0;
    var marginDollars = 0;
    var commission = 0;
    var bonus = 0;
    // console.log(year);
    // console.log(type);

    sales
      ?.filter((sale) => {
        if (sale.year === year) {
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

    if (type === "Gross Revenue") return salesDollars;

    if (type === "Margin") return marginDollars;

    if (type === "Commission") return commission;

    if (type === "Bonus") return bonus;
  };

  const barHeight = (type, year) => {
    if (type === "Gross Revenue") return calculateSales(type, year) / 20000;
    if (type === "Margin") return calculateSales(type, year) / 1500;
    if (type === "Commission") return calculateSales(type, year) / 200;
    if (type === "Bonus") return calculateSales(type, year) / 100;
  };

  const currentVsPreviousYearToDate = (type) => {
    const currentYear = moment().format("yyyy");
    const previousYear = moment().subtract(1, "years").format("yyyy");
    const currentMonth = moment().format("MM");

    var currentYearTotal = 0;
    var previousYearToDate = 0;

    sales
      ?.filter((sale) => {
        if (sale.year === currentYear) return sale;
        return null;
      })
      .forEach((value) => {
        if (type === "Gross Revenue") currentYearTotal += value.sales;
        if (type === "Margin") currentYearTotal += value.margin;
        if (type === "Commission") currentYearTotal += value.commission;
        if (type === "Bonus") currentYearTotal += value.bonus;
      });

    sales
      ?.filter((sale) => {
        if (
          sale.year === previousYear &&
          sale.month >= "01" &&
          sale.month <= currentMonth
        )
          return sale;
        return null;
      })
      .forEach((value) => {
        if (type === "Gross Revenue") previousYearToDate += value.sales;
        if (type === "Margin") previousYearToDate += value.margin;
        if (type === "Commission") previousYearToDate += value.commission;
        if (type === "Bonus") previousYearToDate += value.bonus;
      });

    const difference = currentYearTotal / previousYearToDate - 1;

    return difference;
  };

  const trend = (type) => {
    if (currentVsPreviousYearToDate(type) === 0) {
      return (
        <Typography>
          <strong>the same</strong> as last year
        </Typography>
      );
    }
    if (currentVsPreviousYearToDate(type) < 0) {
      return (
        <Stack direction="row">
          <ArrowDownwardRounded color="error" />
          <Typography>
            <strong>
              {Math.abs(Math.round(currentVsPreviousYearToDate(type) * 100))}%
            </strong>{" "}
            from last year
          </Typography>
        </Stack>
      );
    }
    if (currentVsPreviousYearToDate(type) > 0) {
      return (
        <Stack direction="row">
          <ArrowUpwardRounded color="success" />
          <Typography>
            <strong>
              {Math.abs(Math.round(currentVsPreviousYearToDate(type) * 100))}%
            </strong>{" "}
            from last year
          </Typography>
        </Stack>
      );
    }
  };

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
      {dataTypes.map((type) => (
        <Box
          key={type}
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
            {type}
          </Typography>
          <Typography>
            Your <strong>{type}</strong> is
          </Typography>
          {trend(type)}
          <Stack
            component={Paper}
            elevation={5}
            direction="row"
            alignItems="flex-end"
            justifyContent="space-around"
            sx={{ borderRadius: "10px", minWidth: "350px" }}
          >
            {years.map((year) => (
              <Stack
                key={year}
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{ margin: "8px" }}
              >
                <Typography variant="caption">
                  {currencyFormatter.format(calculateSales(type, year))}
                </Typography>

                <Box
                  sx={{
                    width: "25px",
                    height: barHeight(type, year),
                    backgroundColor: "#367C2B",
                    borderRadius: "4px 4px 0 0",
                  }}
                />
                <Typography variant="subtitle1">{year}</Typography>
              </Stack>
            ))}
            {/* <Typography>Sales: {currencyFormatter.format(calculateSales(salesTotal, year))}</Typography>
            <Typography>Margin: {currencyFormatter.format(calculateSales(marginTotal, year))}</Typography>
            <Typography>
              Commission: {currencyFormatter.format(calculateSales(commissionTotal, year))}
            </Typography> */}
          </Stack>
        </Box>
      ))}

      {/* <div
        style={{
          height: 680,
          width: "98vw",
          background: "white",
          border: "solid black 2px",
          borderRadius: "10px",
        }}
      >
        <DataGrid
          rows={sales}
          //   getRowHeight={() => "auto"}
          columns={columns}
          pageSize={50}
          rowsPerPageOptions={[12]}
          //   hideFooter
          //   //   checkboxSelection
          //   disableSelectionOnClick
        />
      </div> */}
    </Box>
  );
}
