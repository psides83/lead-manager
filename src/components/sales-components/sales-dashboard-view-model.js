import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import moment from "moment";
import { db } from "../../services/firebase";

class SalesDashboardViewModel {
  constructor(sales, setSales, year, category) {
    this.sales = sales;
    this.setSales = setSales;
    this.year = year;
    this.category = category;
  }

  fetch = async () => {
    const salesQuery = query(
      collection(db, "salesDataByMonth"),
      orderBy("id", "asc")
    );

    onSnapshot(salesQuery, (querySnapshot) => {
      this.setSales(
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
  calculateSales(selectedCategory) {
    const category =
      selectedCategory !== undefined || selectedCategory !== null
        ? selectedCategory
        : this.category;
    var salesDollars = 0;
    var marginDollars = 0;
    var commission = 0;
    var bonus = 0;

    this.sales
      ?.filter((sale) => {
        if (sale.year === this.year) {
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
  }

  //   Compares the sales trend of the selected year from the previous year
  currentVsPreviousYearToDate() {
    const category = this.category;
    const currentYear = moment().format("yyyy");
    const previousYear = moment(this.year, "yyyy")
      .subtract(1, "years")
      .format("yyyy");
    const currentMonth = moment().format("MM");

    var yearTotal = 0;
    var previousYearToDate = 0;

    this.sales
      ?.filter((sale) => {
        if (sale.year === this.year) return sale;
        return null;
      })
      .forEach((value) => {
        if (category === "sales") yearTotal += value.sales;
        if (category === "margin") yearTotal += value.margin;
        if (category === "commission") yearTotal += value.commission;
        if (category === "bonus") yearTotal += value.bonus;
      });

    this.sales
      ?.filter((sale) => {
        if (this.year === currentYear) {
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
        if (category === "sales") previousYearToDate += value.sales;
        if (category === "margin") previousYearToDate += value.margin;
        if (category === "commission") previousYearToDate += value.commission;
        if (category === "bonus") previousYearToDate += value.bonus;
      });

    const difference = yearTotal / previousYearToDate - 1;

    return difference;
  }

  //   turns the above trend calculation into a perecnt value string
  percentChange() {
    return `${Math.abs(Math.round(this.currentVsPreviousYearToDate() * 100))}%`;
  }

  // calculates the margin percentage of the selected year, outputs as a string
  marginPercentage() {
    const marginCategory = "margin";
    const salesCategory = "sales";
    if (this.sales !== undefined) {
      const rawMargin =
        this.calculateSales(marginCategory) /
        this.calculateSales(salesCategory);
      return `${Math.round(rawMargin * 10000) / 100}%`;
    }
    return null;
  }
}

export default SalesDashboardViewModel;
