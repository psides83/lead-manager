import React from 'react'
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
import moment from 'moment';
import { currencyFormatter } from '../../utils/utils';

const SalesCharts = (props) => {
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

export default SalesCharts