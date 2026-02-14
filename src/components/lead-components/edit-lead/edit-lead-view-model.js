import { deleteDoc, doc, setDoc } from "firebase/firestore";
import moment from "moment";
import { db } from "../../../services/firebase";
import { createStatusFollowUpTask } from "../../../services/follow-up-task-service";
import { writeAuditLog } from "../../../services/audit-log-service";

class EditLeadViewModel {
  constructor(
    lead,
    leadData,
    setLeadData,
    importedData,
    setImportedData,
    change,
    setChange,
    loading,
    setLoading,
    setMessage,
    setSuccess,
    setOpenSuccess,
    setOpenError,
    isShowingDialog,
    handleCloseDialog,
    handleCloseConfirmDialog
    // loadLeadData,
  ) {
    this.lead = lead;
    this.leadData = leadData;
    this.setLeadData = setLeadData;
    this.importedData = importedData;
    this.setImportedData = setImportedData;
    this.change = change;
    this.setChange = setChange;
    this.loading = loading;
    this.setLoading = setLoading;
    this.setMessage = setMessage;
    this.setSuccess = setSuccess;
    this.setOpenSuccess = setOpenSuccess;
    this.setOpenError = setOpenError;
    this.isShowingDialog = isShowingDialog;
    this.handleCloseDialog = handleCloseDialog;
    this.handleCloseConfirmDialog = handleCloseConfirmDialog;
    // this.loadLeadData = loadLeadData
  }

  // Handle deleting of child record.
  deleteLead = async (event) => {
    event?.stopPropagation?.();
    const leadBackup = { ...this.lead };

    await deleteDoc(doc(db, "leads", this.lead?.id));
    await writeAuditLog({
      actionType: "lead_deleted",
      entityType: "lead",
      entityId: this.lead?.id,
      leadId: this.lead?.id,
      before: leadBackup,
      metadata: { source: "edit-lead-dialog" },
    });

    this.handleCloseConfirmDialog();
    this.handleCloseDialog();
    return leadBackup;
  };

  restoreLead = async (leadBackup) => {
    if (!leadBackup?.id) {
      return;
    }

    await setDoc(doc(db, "leads", leadBackup.id), leadBackup, { merge: true });
    await writeAuditLog({
      actionType: "lead_restore_undo",
      entityType: "lead",
      entityId: leadBackup.id,
      leadId: leadBackup.id,
      after: leadBackup,
      metadata: { source: "undo-snackbar" },
    });
  };

  // Requst submission validation.
  leadSubmitValidation = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setLoading(true);

    if (this.leadData.name === "") {
      this.setMessage("Lead must have a name to be created");
      this.setOpenError(true);
      this.setLoading(false);
      return;
    }

    if (
      this.leadData.status === "Closed" &&
      (!this.leadData.closeOutcome || !this.leadData.closeReason)
    ) {
      this.setMessage("Close outcome and close reason are required when status is Closed.");
      this.setOpenError(true);
      this.setLoading(false);
      return;
    } else {
      await this.setLeadToFirestore()
        .then(() => {
          this.setLoading(false);
          this.setSuccess(true);
          this.setMessage("lead successfully edited");
          this.setOpenSuccess(true);
          this.handleCloseDialog();
          this.resetLeadForm();
        })
        .catch((error) => {
          // loadLeadData();
          this.setLoading(false);
          this.setMessage(`${error}`);
          this.setOpenError(true);
        });
    }
  };
  // Add the lead to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
  setLeadToFirestore = async () => {
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    this.logChanges();
    var changeString = this.change.toString().replace(/,/g, ", ");

    if (changeString[0] === ",") {
      changeString = changeString.substring(1).trim();
    }

    this.leadData.changeLog.push({
      id: id,
      change: changeString,
      timestamp: timestamp,
    });

    if (this.leadData.status === "Closed" && !this.leadData.closeTimestamp) {
      this.leadData.closeTimestamp = timestamp;
      this.leadData.closeUnix = moment().valueOf();
      if (this.lead?.timestamp) {
        const createdAt = moment(this.lead.timestamp, "DD-MMM-yyyy hh:mmA", true);
        if (createdAt.isValid()) {
          this.leadData.closeCycleDays = Math.max(
            0,
            Math.round(moment().diff(createdAt, "hours", true) / 24 * 10) / 10,
          );
        }
      }
    }

    this.leadData.mergeWithCoreData = true

    const leadRef = doc(db, "leads", this.lead.id);

    await setDoc(leadRef, this.leadData, { merge: true });
    await writeAuditLog({
      actionType: "lead_updated",
      entityType: "lead",
      entityId: this.lead.id,
      leadId: this.lead.id,
      before: this.importedData,
      after: this.leadData,
      metadata: { source: "edit-lead-dialog" },
    });

    try {
      await createStatusFollowUpTask({
        lead: this.lead,
        previousStatus: this.importedData?.status,
        nextStatus: this.leadData?.status,
      });
    } catch (_) {
      // Lead save already succeeded; don't fail edit on automation issue.
    }
  };

  // builds chang log data for values that have changed
  logChanges() {
    const leadData = this.leadData;
    const importedData = this.importedData;
    const change = this.change;
    const setChange = this.setChange;

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

    if (leadData.closeOutcome !== importedData.closeOutcome) {
      setChange(
        change.push(
          `close outcome updated from ${importedData.closeOutcome || "BLANK"} to ${leadData.closeOutcome || "BLANK"}`,
        ),
      );
    }

    if (leadData.closeReason !== importedData.closeReason) {
      setChange(
        change.push(
          `close reason updated from ${importedData.closeReason || "BLANK"} to ${leadData.closeReason || "BLANK"}`,
        ),
      );
    }

    if (leadData.closeCompetitor !== importedData.closeCompetitor) {
      setChange(
        change.push(
          `competitor updated from ${importedData.closeCompetitor || "BLANK"} to ${leadData.closeCompetitor || "BLANK"}`,
        ),
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
  }

  // Reset the Lead form
  resetLeadForm = async () => {
    this.setLeadData({
      name: "",
      email: "",
      phone: "",
      status: "Lead Created",
      notes: "",
      quoteLink: "",
      willFinance: false,
      hasTrade: false,
      willPurchase: false,
      closeOutcome: "",
      closeReason: "",
      closeCompetitor: "",
      closeNotes: "",
    });
    this.setChange([]);
    this.setImportedData({});
  };

  // Array of work options that populate the checkbox setion of the form.
  checkBoxes() {
    return [
      {
        id: "willFinance",
        title: "Financed",
        checkedState: this.leadData.willFinance,
      },
      {
        id: "hasTrade",
        title: "Has trade",
        checkedState: this.leadData.hasTrade,
      },
      {
        id: "willPurchase",
        title: "Will Purchase",
        checkedState: this.leadData.willPurchase,
      },
    ];
  }

  // Handle changes in the checkboxes.
  handleChange(event) {
    const id = event.target.id;
    const leadData = this.leadData;
    const setLeadData = this.setLeadData;

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
  }

  // handle the onChange for the lead inputs
  handleInput(event, id) {
    var value = event.target.value;

    if (id === "name") {
      const names = event.target.value;

      value = names.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
        letter.toUpperCase()
      );
    }

    this.setLeadData({ ...this.leadData, [id]: value });
  }

  //  handles the leadData object values for the lead inputs
  handleLeadValues(id) {
    const leadData = this.leadData;

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
      case "closeOutcome":
        return leadData.closeOutcome || "";
      case "closeReason":
        return leadData.closeReason || "";
      case "closeCompetitor":
        return leadData.closeCompetitor || "";
      case "closeNotes":
        return leadData.closeNotes || "";
      default:
        return "";
    }
  }

  // sets the state of the save button based on whether data in the form has changed or is being saved
  buttonIsDisabled() {
    const leadData = this.leadData
    const importedData = this.importedData

    if (this.isShowingDialog && this.lead) {
      if (this.loading) return true;

      if (leadData.name !== importedData.name) return false;
      if (leadData.email !== importedData.email) return false;
      if (leadData.phone !== importedData.phone) return false;
      if (leadData.status !== importedData.status) return false;
      if (leadData.quoteLink !== importedData.quoteLink) return false;
      if (leadData.notes !== importedData.notes) return false;
      if (leadData.closeOutcome !== importedData.closeOutcome) return false;
      if (leadData.closeReason !== importedData.closeReason) return false;
      if (leadData.closeCompetitor !== importedData.closeCompetitor) return false;
      if (leadData.closeNotes !== importedData.closeNotes) return false;
      if (leadData.willFinance !== importedData.willFinance) return false;
      if (leadData.hasTrade !== importedData.hasTrade) return false;
      if (leadData.willPurchase !== importedData.willPurchase) return false;
      return true;
    }
  }
}

export default EditLeadViewModel;
