import moment from "moment";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { pdiDB } from "./pdi-firebase";
import { formatPhoneNumber } from "../utils/utils";

// const serviceID = 'service_3fgcwz9';
// const templateID = 'template_5dg1ys6';
// const userID = 'user_3ub5f4KJJHBND1Wzl1FQi';

const ROLE = {
  ADMIN: "admin",
  SERVICE: "service",
  PARTS: "parts",
  SALES: "sales",
};

const roles = {
  request: [ROLE.ADMIN, ROLE.SERVICE, ROLE.PARTS],
  loaner: [ROLE.ADMIN, ROLE.SERVICE, ROLE.SALES],
  transport: [ROLE.ADMIN, ROLE.SERVICE],
};

// Sets recipients based on type of send email called
const setRecipients = async (recipientRoles, userProfile, salesman) => {
  if (userProfile) {
    var recipients = [];

    const usersQuery = query(
      collection(pdiDB, "users"),
      where("branch", "==", userProfile?.branch)
    );
    const docSnapshot = await getDocs(usersQuery);

    docSnapshot.docs.map((doc) =>
      recipients.push({
        salesman: `${doc.data().firstName} ${doc.data().lastName}`,
        email: doc.data().email,
        role: doc.data().role,
      })
    );

    var recipientEmails = [];

    if (recipientRoles === roles.request) {
      recipients
        .filter((recipient) => recipient.salesman === salesman)
        .map((recipient) => recipientEmails.push(recipient.email));
    }

    recipients
      .filter((recipient) => recipientRoles.includes(recipient.role))
      .map((recipient) => recipientEmails.push(recipient.email));

    return recipientEmails.toString().replace(/,/g, "; ");
  } else {
    console.log("no user profile");
  }
};

// Sends email when new request is submitted
const sendNewRequestEmail = async (
  timestamp,
  equipmentList,
  fullName,
  userProfile,
  salesman
) => {
  // creates the paramaters for the email template
  const emailID = moment().format("yyyyMMDDHHmmss");
  const recipients = await setRecipients(roles.request, userProfile, salesman);
  const subject = `${fullName}, ${equipmentList[0].model}, ${equipmentList[0].stock}, ${equipmentList[0].serial}`;
  var body = `<body>
                    <section>
                        <p>${timestamp}</p>
                        <p>${fullName} is requesting work to be done on the following equipment.</p>
                    </section>`;

  for (var i = 0; i < equipmentList.length; i++) {
    body += `<hr style="height:3px;border-width:0;color:gray;background-color:gray"/>
                <section>
                    <h3>Equipment ${i + 1}</h3>
                    <p>Model: ${equipmentList[i].model}</p>
                    <p>Stock Number: ${equipmentList[i].stock}</p>
                    <p>Serial Number: ${equipmentList[i].serial}</p>
                    <p>Work Required: ${equipmentList[i].work}</p>
                    <p>Additional Notes: ${equipmentList[i].notes}</p>
                </section>`;
  }

  body += "</body>";

  // Sets paramaters for the email template
  const emailData = {
    to: recipients,
    // to: "psides83@hotmail.com",
    replyTo: userProfile.email,
    from: "PDI/Setup Requests<psides.solutions@outlook.com>",
    // cc: userProfile.email,
    message: {
      subject: subject,
      html: body,
    },
  };

  // sends the email
  await setDoc(doc(pdiDB, "sentEmails", emailID), emailData);
};

export { sendNewRequestEmail };
