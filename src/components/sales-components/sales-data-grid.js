import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { currencyFormatter } from "../../utils/utils";
import moment from "moment";
import { Box, Button, Stack, Typography } from "@mui/material";

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
    editable: true,
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
  const [filterParam, setFilterParam] = useState("All");
  const [salesData, setSalesData] = useState({});
  const dataTypes = ["Sales", "Margin", "Commission"]
  const years = [
    moment().subtract(3, "years").format("yyyy"),
    moment().subtract(2, "years").format("yyyy"),
    moment().subtract(1, "years").format("yyyy"),
    moment().format("yyyy"),
  ];
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
      collection(db, "soldEquipment"),
      orderBy("id", "asc")
    );

    onSnapshot(salesQuery, (querySnapshot) => {
      setSales(
        querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          saleID: doc.data().saleID,
          saleDate: doc.data().saleDate,
          saleMonth: doc.data().saleMonth,
          saleYear: doc.data().saleYear,
          salePrice: Number(doc.data().salePrice),
          margin: Number(doc.data().margin),
          //   commission: commission,
          tradeAttached: doc.data().tradeAttached,
          tradeSold: doc.data().tradeSold,
          dateTradeSold: doc.data().dateTradeSold,
          tradeSoldMonth: doc.data().tradeSoldMonth,
          tradeSoldYear: doc.data().tradeSoldYear,
          model: doc.data().model,
        }))
      );
    });
  }, [filterParam]);

  const calculateSales = (type, year) => {
    var salesDollars = 0;
    var marginDollars = 0;
    // console.log(year);
    // console.log(type);

    sales
      ?.filter((sale) => {

        if (
          (!sale.tradeAttached || sale.dateTradeSold !== "") &&
          (sale.saleYear === year || sale.tradeSoldYear === year)
        ) {
          return sale;
        }
      })
      .forEach((value) => {
        salesDollars += value.salePrice;
        marginDollars += value.margin;
      });

    if (type === "Sales") return salesDollars;
    console.log(salesDollars)

    if (type === "Margin") return marginDollars;

    if (type === "Commission")
      return marginDollars * 0.12;
  };

  const barHeight = (type, year) => {
    if (type === "Sales") return calculateSales(type, year) / 20000
    if (type === "Margin") return calculateSales(type, year) / 1500
    if (type === "Commission") return calculateSales(type, year) / 200
  }

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return (
    <Box
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        // alignItems: "center",
        // border: "solid black 2px",
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          height: 680,
          width: "98vw",
          background: "white",
          // border: "solid black 2px",
          borderRadius: "10px",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >

        {dataTypes.map((type) => (
          <Box sx={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", maxWidth: '500px'}} >
            <Typography variant="h5" color="primary" sx={{fontWeight: "medium"}} alignSelf="center">{type}</Typography>
          <Stack direction="row" alignItems="flex-end" justifyContent="space-around" sx={{border: "solid #FFDE00 2px"}}>
            {years.map((year) => (
              <Stack direction="column" justifyContent="center" alignItems="center" sx={{margin: "10px"}}>

                <Typography>{year}</Typography>
                <Box sx={{width: "20px", height: barHeight(type, year), backgroundColor: "#367C2B", borderRadius: "3px 3px 0 0"}}/>
                <Typography>{currencyFormatter.format(calculateSales(type, year))}</Typography>
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
      </Box>

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
