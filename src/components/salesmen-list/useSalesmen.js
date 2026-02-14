import { useCallback, useEffect, useState, useContext } from "react";
import { AuthContext } from "../../state-management/auth-context-provider";

export default function useSalesmen() {
  const { userProfile } = useContext(AuthContext);
  const [salesmen, setSalesmen] = useState([]);

  // Fetch salesmen from firestore:
  const fetchSalesmen = useCallback(async () => {
    if (userProfile) {
      // const docRef = doc(db, "salesmen", "salesmen");
      // const docSnap = await getDoc(docRef);

      // setSalesmen(docSnap.data().list);
      // console.log(docSnap.data().list);

      const API_URL = "https://psides83.github.io/listJSON/salesmanList.json";
      const response = await fetch(API_URL);
      const json = await response.json();
      console.log(json);
      setSalesmen(json);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchSalesmen();
  }, []);

  return salesmen;
}
