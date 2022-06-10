const functions = require("firebase-functions");
const admin = require("firebase-admin");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Leads!");
});

// exports.calculateSalesData = functions.firestore
//   .document("soldEquipment/{soldEquipmentId}")
//   .onWrite((change, context) => {
//     const data = change.after.data();
//     const previousData = change.before.data();
//     const commission = data.margin * 0.12;

//     if (data.companyName == previousData.companyName) {
//       return null;
//     }

//     return change.after.ref.set({ commission: commission }, { merge: true });
//   });

  