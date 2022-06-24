import moment from "moment";
import {
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Sends email when equipment is updated:
const sendQuoteLinkOpenedEmail = async (lead) => {
  // Creates the paramaters for the email template
  const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
  const emailID = moment().format("yyyyMMDDHHmmss");
  const recipient = "psides@sunsouth.com";
  const subject = `Quote link opened by ${lead.name}`;
  const body = `<body>
                    <section>
                        <p>${timestamp}</p>
                        <p><strong>${lead.name} opened and viewed their quote from the Lead Manager qpp</p>
                    </section>
                    <body>`;

  // Sets paramaters for the email template
  const emailData = {
    to: recipient,
    replyTo: recipient,
    from: "Lead Manager App<psides.solutions@outlook.com>",
    message: {
      subject: subject,
      html: body,
    },
  };

  // Sends the email
  await setDoc(doc(db, "sentEmails", emailID), emailData);
  // console.log(recipients)
};

export { sendQuoteLinkOpenedEmail };
