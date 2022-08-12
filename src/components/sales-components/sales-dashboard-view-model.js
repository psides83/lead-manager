import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import moment from "moment";
import { SALES_CATEGORIES } from "../../models/static-data";
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
      selectedCategory === undefined || selectedCategory === null
        ? this.category
        : selectedCategory;

    if (this.sales.length !== 0) {
      const filteredSales = this.sales
        ?.filter((data) => {
          return data.year === this.year;
        })
        .reduce((sum, data) => {
          if (category === SALES_CATEGORIES.SALES) return sum + data.sales;
          if (category === SALES_CATEGORIES.MARGIN) return sum + data.margin;
          if (category === SALES_CATEGORIES.COMMISSION)
            return sum + data.commission;
          if (category === SALES_CATEGORIES.BONUS) return sum + data.bonus;
          return null;
        }, 0);
        console.log(filteredSales)
      return filteredSales;
    } else {
      return 0;
    }
  }

  //   Compares the sales trend of the selected year from the previous year
  currentVsPreviousYearToDate() {
    const category = this.category;
    const currentYear = moment().format("yyyy");
    const previousYear = moment(this.year, "yyyy")
      .subtract(1, "years")
      .format("yyyy");
    const currentMonth = moment().format("MM");

    const yearTotal = this.sales
      ?.filter((data) => {
        return data.year === this.year;
      })
      .reduce((sum, data) => {
        if (category === SALES_CATEGORIES.SALES) return sum + data.sales;
        if (category === SALES_CATEGORIES.MARGIN) return (sum += data.margin);
        if (category === SALES_CATEGORIES.COMMISSION)
          return (sum += data.commission);
        if (category === SALES_CATEGORIES.BONUS) return (sum += data.bonus);
        return null;
      }, 0);

    const previousYearToDate = this.sales
      ?.filter((data) => {
        if (this.year === currentYear) {
          return (
            data.year === previousYear &&
            data.month >= "01" &&
            data.month <= currentMonth
          );
        } else {
          return data.year === previousYear;
        }
      })
      .reduce((sum, data) => {
        if (category === SALES_CATEGORIES.SALES) return sum + data.sales;
        if (category === SALES_CATEGORIES.MARGIN) return (sum += data.margin);
        if (category === SALES_CATEGORIES.COMMISSION)
          return (sum += data.commission);
        if (category === SALES_CATEGORIES.BONUS) return (sum += data.bonus);
        return null;
      }, 0);

    const difference = yearTotal / previousYearToDate - 1;

    return difference;
  }

  //   turns the above trend calculation into a perecnt value string
  percentChange() {
    return `${Math.abs(Math.round(this.currentVsPreviousYearToDate() * 100))}%`;
  }

  // calculates the margin percentage of the selected year, outputs as a string
  marginPercentage() {
    const marginCategory = SALES_CATEGORIES.MARGIN;
    const salesCategory = SALES_CATEGORIES.SALES;
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
