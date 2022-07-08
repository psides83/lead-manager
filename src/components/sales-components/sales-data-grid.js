import React, { useState, useEffect, useCallback } from "react";
// eslint-disable-next-line
// import { DataGrid } from "@mui/x-data-grid";
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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { DataGrid } from "@mui/x-data-grid";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { categories, dataTypes, years, months } from "../../models/arrays";
import { margin } from "@mui/system";

// eslint-disable-next-line
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

export default function SalesDataGrid() {
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

  const percentChange = Math.abs(
    Math.round(currentVsPreviousYearToDate() * 100)
  );

  const marginPercentage = () => {
    const rawMargin = calculateSales("margin") / calculateSales("sales");
    return Math.round(rawMargin * 10000) / 100;
  };

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
            <strong>{percentChange}%</strong> from last year
          </Typography>
        </Stack>
      );
    }
    if (currentVsPreviousYearToDate() > 0) {
      return (
        <Stack direction="row">
          <ArrowUpwardRounded color="success" />
          <Typography>
            <strong>{percentChange}%</strong> from last year
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
        <Chart data={sales} year={selectedYear} category={selectedCategory} />
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ margin: "0 0 2px 2px", padding: "0 0 8px 8px" }}>
            <strong>Total</strong>{" "}
            {currencyFormatter.format(calculateSales(selectedCategory))}
          </Typography>
          <Typography sx={{ margin: "0 2px 2px 0", padding: "0 8px 8px 0" }}>
            <strong>Margin</strong> {marginPercentage()}%
          </Typography>
        </Stack>
      </Paper>
      <Paper
        elevation={4}
        sx={{
          borderRadius: "10px",
          height: "500px",
          minWidth: "380px",
          maxWidth: "550px",
          marginTop: "8px",
        }}
      >
        {sales.length > 0 && (
          <DataGrid
            rows={sales?.filter((sale) => {
              if (sale?.year === selectedYear) return sale;
            })}
            columns={columns}
            pageSize={12}
            rowsPerPageOptions={[12]}
            density="compact"
            hideFooterPagination
            hideFooter
          />
        )}
      </Paper>
    </Box>
  );
}

const Chart = (props) => {
  const { data, year, category } = props;

  const filteredData = data.filter((sale) => {
    if (sale.year === year) return sale;
    return null;
  });

  const DataFormater = (number) => {
    if (number > 1000000000) {
      return "$" + (number / 1000000000).toString() + "B";
    } else if (number > 1000000) {
      return "$" + (number / 1000000).toString() + "M";
    } else if (number > 1000) {
      return "$" + (number / 1000).toString() + "K";
    } else {
      return "$" + number.toString();
    }
  };

  return (
    <ResponsiveContainer aspect={1.4} width={380}>
      <BarChart
        width={380}
        height={300}
        data={filteredData}
        barGap={category === "sales" ? 0 : 4}
        margin={{
          top: 20,
          right: 20,
          left: 10,
          bottom: 10,
        }}
      >
        {/* <CartesianGrid strokeDasharray="1 3" /> */}
        <XAxis
          dataKey="month"
          tickFormatter={(value) => moment(value, "MM").format("MMM")}
        />
        <YAxis tickFormatter={DataFormater} />
        <Tooltip
          labelFormatter={(label) => moment(label, "MM").format("MMM")}
          formatter={(value, name) => [
            currencyFormatter.format(value),

            // if (name === "cost") return "Sales"
            name.replace(/\b\w/g, (c) => c.toUpperCase()),
          ]}
        />
        {category === "sales" ? (
          <>
            <Bar
              dataKey={"cost"}
              stackId="1"
              stroke="#666666"
              fill="#666666"
              barSize={12}
              // radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey={"margin"}
              stackId="1"
              stroke="#FFDE00"
              fill="#FFDE00"
              barSize={12}
              radius={[3, 0, 0, 0]}
            />
            <Bar
              dataKey={"sales"}
              stackId="2"
              stroke="#367C2B"
              fill="#367C2B"
              barSize={12}
              radius={[0, 3, 0, 0]}
            />
          </>
        ) : (
          <Bar
            dataKey={category}
            stackId="1"
            stroke="#FFFFFF"
            fill="#367C2B"
            barSize={24}
            radius={[3, 3, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

function ToggleButtons(props) {
  const { toggleValue, setToggleValue, selections } = props;

  const handleValue = (event, newValue) => {
    setToggleValue(newValue);
  };

  return (
    <ToggleButtonGroup
      value={toggleValue}
      exclusive
      onChange={handleValue}
      aria-label="text alignment"
    >
      {selections?.map((selection) => (
        <ToggleButton key={selection} value={selection}>
          {selection}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
