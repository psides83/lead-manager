import { deleteDoc, doc, setDoc } from "firebase/firestore";
import moment from "moment";
import { db } from "../../../services/firebase";

// load data from lead
const loadData = (
  lead,
  isShowingDialog,
  setLeadData,
  setImportedData,
  setLoading
) => {
  if (lead && isShowingDialog) {
    setLeadData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      notes: lead.notes,
      quoteLink: lead.quoteLink === undefined ? "" : lead.quoteLink,
      willFinance: lead.willFinance,
      hasTrade: lead.hasTrade,
      willPurchase: lead.willPurchase,
      changeLog: lead.changeLog,
    });
    setImportedData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      notes: lead.notes,
      quoteLink: lead.quoteLink === undefined ? "" : lead.quoteLink,
      willFinance: lead.willFinance,
      hasTrade: lead.hasTrade,
      willPurchase: lead.willPurchase,
      changeLog: lead.changeLog,
    });
    setLoading(false);
  }
};

// Handle deleting of child record.
const deleteLead = async (
  e,
  lead,
  handleCloseConfirmDialog,
  handleCloseDialog
) => {
  e.stopPropagation();

  await deleteDoc(doc(db, "leads", lead?.id));

  handleCloseConfirmDialog();
  handleCloseDialog();
};

// Requst submission validation.
const leadSubmitValidation = async (
  event,
  lead,
  leadData,
  setLoading,
  setMessage,
  setOpenError,
  setOpenSuccess,
  handleCloseDialog,
  resetLeadForm,
  loadLeadData,
  setSuccess,
  setChange,
  change,
  importedData
) => {
  event.preventDefault();
  event.stopPropagation();
  setLoading(true);

  if (leadData.name === "") {
    setMessage("Lead must have a name to be created");
    setOpenError(true);
    return;
  } else {
    await setLeadToFirestore(lead, leadData, setChange, change, importedData)
      .then(() => {
        setLoading(false);
        setSuccess(true);
        setMessage("lead successfully edited");
        setOpenSuccess(true);
        handleCloseDialog();
        resetLeadForm();
      })
      .catch((error) => {
        loadLeadData();
        setLoading(false);
        setMessage(`${error}`);
        setOpenError(true);
      });
  }
};

// Add the lead to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
const setLeadToFirestore = async (
  lead,
  leadData,
  setChange,
  change,
  importedData
) => {
  const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
  const id = moment().format("yyyyMMDDHHmmss");
  logChanges(leadData, setChange, change, importedData);
  var changeString = change.toString().replace(/,/g, ", ");

  if (changeString[0] === ",") {
    changeString = changeString.substring(1).trim();
  }

  leadData.changeLog.push({
    id: id,
    change: changeString,
    timestamp: timestamp,
  });

  const leadRef = doc(db, "leads", lead.id);

  await setDoc(leadRef, leadData, { merge: true });
};

// Reset the Lead form
const resetLeadForm = async (setLeadData, setChange, setImportedData) => {
    setLeadData({
      name: "",
      email: "",
      phone: "",
      status: "Lead Created",
      notes: "",
      quoteLink: "",
      willFinance: false,
      hasTrade: false,
      willPurchase: false,
    });
    setChange([]);
    setImportedData({});
  };

// builds chang log data for values that have changed
const logChanges = (leadData, setChange, change, importedData) => {
  if (leadData.name !== importedData.name) {
    setChange(
      change.push(
        `Name edited from ${
          importedData.name === "" ? "BLANK" : importedData.name
        } to ${leadData.name === "" ? "BLANK" : leadData.name}`
      )
    );
  }

  if (leadData.email !== importedData.email) {
    setChange(
      change.push(
        `Email edited from ${
          importedData.email === "" ? "BLANK" : importedData.email
        } to ${leadData.email === "" ? "BLANK" : leadData.email}`
      )
    );
  }

  if (leadData.phone !== importedData.phone) {
    setChange(
      change.push(
        `Phone # edited from ${
          importedData.phone === "" ? "BLANK" : importedData.phone
        } to ${leadData.phone === "" ? "BLANK" : leadData.phone}`
      )
    );
  }

  if (leadData.status !== importedData.status) {
    setChange(
      change.push(
        `status updated from ${importedData.status} to ${leadData.status}`
      )
    );
  }

  if (leadData.notes !== importedData.notes) {
    setChange(
      change.push(
        `Notes edited from ${
          importedData.notes === "" ? "BLANK" : importedData.notes
        } to ${leadData.notes === "" ? "BLANK" : leadData.notes}`
      )
    );
  }

  if (leadData.quoteLink !== importedData.quoteLink) {
    setChange(
      change.push(
        `Quote Link edited from ${
          importedData.quoteLink === "" ? "BLANK" : importedData.quoteLink
        } to ${leadData.quoteLink === "" ? "BLANK" : leadData.quoteLink}`
      )
    );
  }

  if (leadData.willFinance !== importedData.willFinance) {
    setChange(
      change.push(
        `Fill Finance edited from ${importedData.willFinance} to ${leadData.willFinance}`
      )
    );
  }

  if (leadData.hasTrade !== importedData.hasTrade) {
    setChange(
      change.push(
        `Has Trade edited from ${importedData.hasTrade} to ${leadData.hasTrade}`
      )
    );
  }

  if (leadData.willPurchase !== importedData.willPurchase) {
    setChange(
      change.push(
        `Will Purchase edited from ${importedData.willPurchase} to ${leadData.willPurchase}`
      )
    );
  }
};

// Array of work options that populate the checkbox setion of the form.
const checkBoxes = (leadData) => {
  return [
    {
      id: "willFinance",
      title: "Financed",
      checkedState: leadData.willFinance,
    },
    {
      id: "hasTrade",
      title: "Has trade",
      checkedState: leadData.hasTrade,
    },
    {
      id: "willPurchase",
      title: "Will Purchase",
      checkedState: leadData.willPurchase,
    },
  ];
};

// Handle changes in the checkboxes.
const handleChange = (event, leadData, setLeadData) => {
  const id = event.target.id;

  switch (id) {
    case "willFinance":
      if (!leadData.willFinance) {
        setLeadData({ ...leadData, [id]: true });
      } else {
        setLeadData({ ...leadData, [id]: false });
      }
      break;
    case "hasTrade":
      if (!leadData.hasTrade) {
        setLeadData({ ...leadData, [id]: true });
      } else {
        setLeadData({ ...leadData, [id]: false });
      }
      break;
    case "willPurchase":
      if (!leadData.willPurchase) {
        setLeadData({ ...leadData, [id]: true });
      } else {
        setLeadData({ ...leadData, [id]: false });
      }
      break;
    default:
      break;
  }
};

// handle the onChange for the lead inputs
const handleInput = (e, id, leadData, setLeadData) => {
  var value = e.target.value;

  if (id === "name") {
    const names = e.target.value;

    value = names.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
      letter.toUpperCase()
    );
  }

  setLeadData({ ...leadData, [id]: value });
};

//  handles the leadData object values for the lead inputs
const handleLeadValues = (id, leadData) => {
  switch (id) {
    case "name":
      return leadData.name;
    case "phone":
      return leadData.phone;
    case "email":
      return leadData.email;
    case "status":
      return leadData.status;
    case "notes":
      return leadData.notes;
    case "quoteLink":
      return leadData.quoteLink;
    default:
      return "";
  }
};

// sets the state of the save button based on whether data in the form has changed or is being saved
const buttonIsDisabled = (
  isShowingDialog,
  lead,
  loading,
  leadData,
  importedData
) => {
  if (isShowingDialog && lead) {
    if (loading) return true;

    if (leadData.name !== importedData.name) return false;
    if (leadData.email !== importedData.email) return false;
    if (leadData.phone !== importedData.phone) return false;
    if (leadData.status !== importedData.status) return false;
    if (leadData.quoteLink !== importedData.quoteLink) return false;
    if (leadData.notes !== importedData.notes) return false;
    if (leadData.willFinance !== importedData.willFinance) return false;
    if (leadData.hasTrade !== importedData.hasTrade) return false;
    if (leadData.willPurchase !== importedData.willPurchase) return false;
    return true;
  }
};

export {
  loadData,
  deleteLead,
  leadSubmitValidation,
  resetLeadForm,
  checkBoxes,
  handleChange,
  handleInput,
  handleLeadValues,
  buttonIsDisabled,
};
