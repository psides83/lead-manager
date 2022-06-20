import moment from "moment";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// const serviceID = 'service_3fgcwz9';
// const templateID = 'template_5dg1ys6';
// const userID = 'user_3ub5f4KJJHBND1Wzl1FQi';

const roles = {
  request: ["admin", "service", "parts"],
  loaner: ["admin", "service", "sales"],
  transport: ["admin", "service"],
};

// Sets recipients based on type of send email called
// const setRecipients = async (recipientRoles, userProfile, salesman) => {
//   if (userProfile) {
//     var recipients = [];

//     const usersQuery = query(
//       collection(db, "users"),
//       where("branch", "==", userProfile?.branch)
//     );
//     const docSnapshot = await getDocs(usersQuery);

//     docSnapshot.docs.map((doc) =>
//       recipients.push({
//         salesman: `${doc.data().firstName} ${doc.data().lastName}`,
//         email: doc.data().email,
//         role: doc.data().role,
//       })
//     );

//     var recipientEmails = [];

//     if (recipientRoles === roles.request) {
//       recipients
//         .filter((recipient) => recipient.salesman === salesman)
//         .map((recipient) => recipientEmails.push(recipient.email));
//     }

//     recipients
//       .filter((recipient) => recipientRoles.includes(recipient.role))
//       .map((recipient) => recipientEmails.push(recipient.email));

//     return recipientEmails.toString().replace(/,/g, "; ");
//   } else {
//     console.log("no user profile");
//   }
// };

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
