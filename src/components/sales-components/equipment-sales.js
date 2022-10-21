import { Collapse } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

function EquipmentSales() {
  const [sales, setSales] = useState([]);

  const fetchSales = useCallback(async () => {
    const API_URL = "https://psides83.github.io/listJSON/sales.json";
    const response = await fetch(API_URL);
    const json = await response.json();

    json.map((month) => {
      if (month.bonus === "") {
        month.bonus = "0";
      }
      month.bonus = parseInt(month.bonus);
      month.cost = Number(month.sales - month.margin);
    });

    setSales(json);
  }, []);

  // fetches sales data from Firestore
  useEffect(() => {
    fetchSales();
    console.log(sales);
  }, []);

  return (
    <div>
      {sales[0]?.customerName}
      {/* <Collapse> */}
        <div>
          {sales?.map((sale) => {
            if (sale.saleID === sales[0]?.saleID) {
              <div>{sale.model}</div>;
            }
          })}
        </div>
      {/* </Collapse> */}
    </div>
  );
}

export default EquipmentSales;
