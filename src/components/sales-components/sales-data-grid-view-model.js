import moment from "moment";
import { currencyFormatter } from "../../utils/utils";

const columns = [
    {
      field: "month",
      headerName: "Month",
      // type: "date",
      width: 60,
      editable: false,
      valueGetter: (params) => moment(params.row.month, "MM").format("MMM"),
    },
    {
      field: "sales",
      headerName: "Sales",
      type: "number",
      width: 100,
      editable: false,
      valueGetter: (params) => currencyFormatter.format(params.row.sales),
      // align: "center",
    },
    {
      field: "margin",
      headerName: "Margin",
      type: "number",
      width: 100,
      editable: false,
      valueGetter: (params) => currencyFormatter.format(params.row.margin),
      // align: "center",
    },
    {
      field: "commission",
      headerName: "Commission",
      type: "number",
      width: 100,
      valueGetter: (params) => currencyFormatter.format(params.row.commission),
      editable: false,
      // align: "center",
    },
    {
      field: "bonus",
      headerName: "Bonus Points",
      type: "number",
      width: 100,
      editable: false,
      // type: "select",
      valueGetter: (params) => currencyFormatter.format(params.row.bonus),
    },
    {
      field: "totalIncome",
      headerName: "Income",
      type: "number",
      width: 80,
      editable: false,
      // type: "select",
      valueGetter: (params) => currencyFormatter.format(income(params)),
    },
  ];
  
  const income = (params) => {
    if (params.row.month === "07" || params.row.month === "12")
      return params.row.bonus + params.row.commission + 3000.0;
    return params.row.bonus + params.row.commission + 2000.0;
  };

  export { columns }