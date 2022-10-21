import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import moment from "moment";

export default class LeadCardViewModel {
  constructor(lead, setMessage, setOpenSuccess, setOpenError) {
    this.lead = lead;
    this.setMessage = setMessage;
    this.setOpenSuccess = setOpenSuccess;
    this.setOpenError = setOpenError;
  }

  // logs when email has been sent to the lead
  logEmail = async (event) => {
    event.preventDefault();

    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    const contactLog = {
      id: id,
      event: "Emailed",
      timestamp: timestamp,
    };

    this.lead.contactLog.push(contactLog);

    this.lead.mergeWithCoreData = true;

    const leadRef = doc(db, "leads", this.lead.id);

    await setDoc(
      leadRef,
      {
        contactLog: this.lead.contactLog,
        mergeWithCoreData: this.lead.mergeWithCoreData,
      },
      { merge: true }
    );

    window.location.href = `mailto:${this.lead.email}`;
  };

  //   copies the link to the lead view page
  copyLeadLink = (event) => {
    event.preventDefault();

    navigator.clipboard
      .writeText(
        `https://leadmanager-44f57.web.app/customer-view/${this.lead.id}`
      )
      .then(() => {
        this.setMessage("Link copied!");
        this.setOpenSuccess(true);
      })
      .catch(() => {
        this.setMessage("Could not copy link.");
        this.setOpenError(true);
      });
  };
}
