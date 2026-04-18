import moment from "moment";
import { currencyFormatter } from "../../utils/utils";

const resolveRow = (value, row, params) => {
  if (row) return row;
  if (params?.row) return params.row;
  if (value && typeof value === "object" && value.row) return value.row;
  return {};
};

const columns = [
    {
      field: "month",
      headerName: "Month",
      // type: "date",
      width: 60,
      editable: false,
      valueGetter: (value, row, params) => {
        const safeRow = resolveRow(value, row, params);
        const month = safeRow.month || "01";
        return moment(month, "MM").format("MMM");
      },
    },
    {
      field: "sales",
      headerName: "Sales",
      type: "number",
      width: 100,
      editable: false,
      valueGetter: (value, row, params) => {
        const safeRow = resolveRow(value, row, params);
        return currencyFormatter.format(Number(safeRow.sales || 0));
      },
      // align: "center",
    },
    {
      field: "margin",
      headerName: "Margin",
      type: "number",
      width: 100,
      editable: false,
      valueGetter: (value, row, params) => {
        const safeRow = resolveRow(value, row, params);
        return currencyFormatter.format(Number(safeRow.margin || 0));
      },
      // align: "center",
    },
    {
      field: "commission",
      headerName: "Commission",
      type: "number",
      width: 100,
      valueGetter: (value, row, params) => {
        const safeRow = resolveRow(value, row, params);
        return currencyFormatter.format(Number(safeRow.commission || 0));
      },
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
      valueGetter: (value, row, params) => {
        const safeRow = resolveRow(value, row, params);
        return currencyFormatter.format(Number(safeRow.bonus || 0));
      },
    },
    {
      field: "totalIncome",
      headerName: "Income",
      type: "number",
      width: 80,
      editable: false,
      // type: "select",
      valueGetter: (value, row, params) => {
        const safeRow = resolveRow(value, row, params);
        return currencyFormatter.format(income(safeRow));
      },
    },
  ];
  
  const income = (row) => {
    const month = String(row?.month || "");
    const bonus = Number(row?.bonus || 0);
    const commission = Number(row?.commission || 0);
    if (month === "07" || month === "12") {
      return bonus + commission + 3000.0;
    }
    return bonus + commission + 2000.0;
  };

  export { columns }
