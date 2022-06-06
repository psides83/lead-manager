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
          salePrice: doc.data().salePrice,
          margin: doc.data().margin,
          //   commission: commission,
          tradeAttached: doc.data().tradeAttached,
          dateTradeSold: doc.data().dateTradeSold,
          model: doc.data().model,
        }))
      );
    });
  }, [filterParam]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        // alignItems: "center",
        border: "solid black 2px",
      }}
    >
      <div
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
      </div>
    </div>
  );
}
