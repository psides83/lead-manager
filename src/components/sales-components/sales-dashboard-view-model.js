import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import moment from "moment";
import { db } from "../../services/firebase";

const fetch = async (setSales) => {
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
};

// calculates sales for the sales dashboard based on the selected year and category
const calculateSales = (sales, selectedYear, category) => {
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
const currentVsPreviousYearToDate = (sales, selectedYear, selectedCategory) => {
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
const percentChange = (sales, selectedYear, selectedCategory) => {
  return `${Math.abs(
    Math.round(
      currentVsPreviousYearToDate(sales, selectedYear, selectedCategory) * 100
    )
  )}%`;
};

// calculates the margin percentage of the selected year, outputs as a string
const marginPercentage = (sales, selectedYear) => {
  const marginCategory = "margin";
  const salesCategory = "sales";
  if (sales !== undefined) {

    const rawMargin =
      calculateSales(sales, selectedYear, marginCategory) /
      calculateSales(sales, selectedYear, salesCategory);
      return `${Math.round(rawMargin * 10000) / 100}%`;
  }
  return null
};

export {
  fetch,
  calculateSales,
  currentVsPreviousYearToDate,
  percentChange,
  marginPercentage,
};
