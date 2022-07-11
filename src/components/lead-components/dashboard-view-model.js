import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";

const fetch = async (setFunc, filterParam, timer, setLoading) => {

    if (await filterParam) {

        var leadsQuery;
        if (filterParam === "Closed") {
          leadsQuery = query(
            collection(db, "leads"),
            where("status", "==", "Closed")
          );
        } else {
          leadsQuery = query(
            collection(db, "leads"),
            where("status", "!=", "Closed")
          );
        }
    
        onSnapshot(leadsQuery, (querySnapshot) => {
          setFunc(
            querySnapshot.docs.map((doc) => ({
              id: doc.data().id,
              timestamp: doc.data().timestamp,
              name: doc.data().name,
              email: doc.data().email,
              phone: doc.data().phone,
              status: doc.data().status,
              notes: doc.data().notes,
              quoteLink: doc.data().quoteLink,
              willFinance: doc.data().willFinance,
              hasTrade: doc.data().hasTrade,
              willPurchase: doc.data().willPurchase,
              changeLog: doc.data().changeLog,
              contactLog: doc.data().contactLog,
              equipment: doc.data().equipment,
              messages: doc.data().messages,
            }))
          );
        });
        timer.current = window.setTimeout(() => {
          setLoading(false);
        }, 1200);
    } else {

        const taskQuery = query(
          collection(db, "tasks"),
          // where("isComplete", "!=", true),
          orderBy("isComplete"),
          orderBy("order", "asc")
        );
        
        onSnapshot(taskQuery, (querySnapshot) => {
            setFunc(
            querySnapshot.docs.map((doc) => ({
              id: doc.data().id,
              leadID: doc.data().leadID,
              leadName: doc.data().leadName,
              task: doc.data().task,
              isComplete: doc.data().isComplete,
              timestamp: doc.data().timestamp,
            }))
          );
        });
    }
};

const searchable = (leads, searchParam, searchText) => {
    return leads
      .sort(function (a, b) {
        return a.id - b.id;
      })
      .filter((item) => {
        return searchParam.some((newItem) => {
          return (
            item[newItem]
              .toString()
              .toLowerCase()
              .replace(/[^0-9, a-z]/g, "")
              .replace(/\s/g, "")
              .indexOf(searchText.toLowerCase().replace(/\s/g, "")) > -1
          );
        });
      });
  };

export { fetch, searchable }