import { doc, setDoc } from "firebase/firestore";
import moment from "moment";
import { equipmentAvailabilityArray, equipmentStatusArray } from "../../../models/static-data";
import { db } from "../../../services/firebase";
import { writeAuditLog } from "../../../services/audit-log-service";
import { createTaskCreatedNotification } from "../../../services/notification-service";

class AddLeadViewModel {
  constructor(
    setMessage,
    setOpenSuccess,
    setOpenError,
    currentUser,
    userProfile,
    leadData,
    setLeadData,
    equipment,
    setEquipment,
    equipmentList,
    setEquipmentList,
    handleCloseDialog,
    setLoadingLead,
    setLeadSuccess,
    setLoadingEquipment,
    setEquipmentSuccess,
    taskNote,
    setTaskNote,
    taskNoteList,
    setTaskNoteList
  ) {
    this.setMessage = setMessage;
    this.setOpenSuccess = setOpenSuccess;
    this.setOpenError = setOpenError;
    this.currentUser = currentUser;
    this.userProfile = userProfile;
    this.leadData = leadData;
    this.setLeadData = setLeadData;
    this.equipment = equipment;
    this.setEquipment = setEquipment;
    this.equipmentList = equipmentList;
    this.setEquipmentList = setEquipmentList;
    this.handleCloseDialog = handleCloseDialog;
    this.setLoadingLead = setLoadingLead;
    this.setLeadSuccess = setLeadSuccess;
    this.setLoadingEquipment = setLoadingEquipment;
    this.setEquipmentSuccess = setEquipmentSuccess;
    this.taskNote = taskNote;
    this.setTaskNote = setTaskNote;
    this.taskNoteList = taskNoteList;
    this.setTaskNoteList = setTaskNoteList;
  }

  // Add the lead to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
  setLeadToFirestore = async () => {
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    const leadData = this.leadData

    leadData.changeLog = [
      {
        id: id,
        change: `Lead created`,
        timestamp: timestamp,
      },
    ];

    leadData.contactLog = [
      {
        id: id,
        event: "not contacted since added",
        timestamp: timestamp,
      },
    ];

    console.log(this.equipmentList);

    leadData.id = id;
    leadData.timestamp = timestamp;
    leadData.salesmanID = this.userProfile.id;
    leadData.quoteLink = "";
    leadData.equipment = this.equipmentList;
    leadData.mergeWithCoreData = true
    if (leadData.status === "Closed") {
      leadData.closeTimestamp = timestamp;
      leadData.closeUnix = moment().valueOf();
      leadData.closeCycleDays = 0;
    }

    console.table(leadData);

    const leadRef = doc(db, "leads", leadData.id);

    await setDoc(leadRef, leadData, { merge: true });
  };

  setTaskNotesToFirestore = async () => {
    if (this.taskNoteList.length === 0) {
      return;
    }

    const userId = this.currentUser?.uid || this.userProfile?.id;
    const lead = this.leadData;

    await Promise.all(
      this.taskNoteList.map(async (taskNote, index) => {
        const taskPayload = {
          ...taskNote,
          leadID: lead.id,
          leadName: lead.name,
          order: index + 1,
        };
        const taskRef = doc(db, "tasks", taskPayload.id);

        await setDoc(taskRef, taskPayload, { merge: true });

        createTaskCreatedNotification({
          userId,
          userEmail: this.userProfile?.email,
          lead,
          task: taskPayload,
        }).catch(() => {});

        writeAuditLog({
          actionType: "task_added",
          entityType: "task",
          entityId: taskPayload.id,
          leadId: lead.id,
          after: {
            id: taskPayload.id,
            leadID: lead.id,
            task: taskPayload.task,
          },
          metadata: { source: "add-lead-dialog" },
        });
      })
    );
  };

  hasRequiredLeadContext = () => {
    return (
      this.equipment.model !== "" ||
      this.equipmentList.length > 0 ||
      this.taskNote.trim() !== "" ||
      this.taskNoteList.length > 0
    );
  };

  // Requst submission validation.
  leadSubmitValidation = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setLoadingLead(true);

    if (!this.hasRequiredLeadContext()) {
        this.setMessage("Add equipment or at least one task / note before saving the lead");
        this.setOpenError(true);
        this.setLoadingLead(false);
      return false;
    } else if (this.leadData.name === "") {
        this.setMessage("Lead must have a name to be created");
        this.setOpenError(true);
        this.setLoadingLead(false);
      return false;
    } else if (
      this.leadData.status === "Closed" &&
      (!this.leadData.closeOutcome || !this.leadData.closeReason)
    ) {
      this.setMessage("Close outcome and close reason are required when status is Closed.");
      this.setOpenError(true);
      this.setLoadingLead(false);
      return false;
    } else {
      console.log("eq added directly from submit");
      if (this.equipment.model !== "") {
        console.log("another eq added first");
        await this.pushEquipmentToLead();
      }
      if (this.taskNote.trim() !== "") {
        await this.pushTaskNoteToLead();
      }
      await this.setLeadToFirestore().then(async ()=> {
        await this.setTaskNotesToFirestore();
        this.setLoadingLead(false);
        this.setLeadSuccess(true);
        this.setMessage("Lead successfully submitted");
        this.setOpenSuccess(true);
        this.handleCloseDialog();
      }).catch((error) => {
        this.setLoadingLead(false);
        this.setMessage(`${error}. Please try again`);
        this.setOpenError(true);
      });
      
    }
  };

  // Push equipment to a state array to later be set to firestore "equipment" collection with the "leads" collection.
  pushEquipmentToLead = async () => {
    const id = moment().format("yyyyMMDDHHmmss");
    const changeLog = [
      {
        id: id,
        change: `Equipment added to lead`,
        timestamp: moment().format("DD-MMM-yyyy hh:mmA"),
      },
    ];

    this.equipment.id = id;
    this.equipment.changeLog = changeLog;

    this.equipmentList.push(this.equipment);
    this.setEquipmentList(this.equipmentList);
    this.setEquipmentSuccess(true);

    await this.resetEquipmentForm();
    this.setLoadingEquipment(false);
    this.setEquipmentSuccess(false);

  };

  // Squipment submission validation.
  equipmentSubmitValidation = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setLoadingEquipment(true);

    if (this.equipment.model === "") {
        this.setMessage("Equipment must have a model to be added to a lead");
        this.setOpenError(true);
      return;
    } else {
        this.pushEquipmentToLead();
      const lastIndex = this.equipmentList[this.equipmentList.length - 1]?.model;
      this.setMessage(lastIndex + " successfully added to the lead");
      this.setOpenSuccess(true);
    }
  };

  pushTaskNoteToLead = async () => {
    const id = `${moment().format("yyyyMMDDHHmmss")}${this.taskNoteList.length + 1}`;
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const taskNote = {
      id,
      timestamp,
      task: this.taskNote.trim(),
      isComplete: false,
      order: this.taskNoteList.length + 1,
    };

    this.taskNoteList.push(taskNote);
    this.setTaskNoteList(this.taskNoteList);
    this.setEquipmentSuccess(true);
    this.setTaskNote("");
    this.setLoadingEquipment(false);
    this.setEquipmentSuccess(false);
  };

  taskNoteSubmitValidation = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setLoadingEquipment(true);

    if (this.taskNote.trim() === "") {
      this.setMessage("Please enter a task or note to add to the lead");
      this.setOpenError(true);
      this.setLoadingEquipment(false);
      return;
    }

    await this.pushTaskNoteToLead();
    this.setMessage("Task / note successfully added to the lead");
    this.setOpenSuccess(true);
  };

  // Handle deleting of equipment from the lead.
  handleDelete = (equipmentToDelete) => () => {
    this.setEquipmentList((equipmentList) =>
      equipmentList.filter((equiment) => equiment.id !== equipmentToDelete.id)
    );
  };

  handleDeleteTaskNote = (taskNoteToDelete) => () => {
    this.setTaskNoteList((taskNoteList) =>
      taskNoteList.filter((taskNote) => taskNote.id !== taskNoteToDelete.id)
    );
  };

  // Dynamic heading for the form.
  heading() {
    return this.equipmentList.length === 0
      ? "Add Equipment"
      : "Equipment on Lead";
  }

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
    const leadData = this.leadData
    const setLeadData = this.setLeadData

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

  // Reset complete form
  resetCompleteForm = async () => {
    await this.resetEquipmentForm();
    await this.resetLeadForm();
    this.setEquipmentList([]);
    this.setTaskNote("");
    this.setTaskNoteList([]);
  };

  // Reset the Lead form
  resetLeadForm = async () => {
    this.setLeadData({
      name: "",
      email: "",
      phone: "",
      status: "Lead Created",
      notes: "",
      willFinance: false,
      hasTrade: false,
      willPurchase: false,
      closeOutcome: "",
      closeReason: "",
      closeCompetitor: "",
      closeNotes: "",
    });
  };

  // Reset the Equipment form
  resetEquipmentForm = async () => {
    this.setEquipmentSuccess(false);
    this.setEquipment({
      model: "",
      stock: "",
      serial: "",
      quotePrice: "",
      availability: "Availability Unknown",
      status: "Equipment added",
      notes: "",
    });
  };

   // handle the onChange for the lead inputs
   handleInput(e, id) {
    var value = e.target.value;

    if (id === "name") {
      const names = e.target.value;

      value = names.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
        letter.toUpperCase()
      );
    }

    this.setLeadData({ ...this.leadData, [id]: value });
    console.table(this.leadData);
  };

  //  handles the leadData object values for the lead inputs
  handleLeadValues(id) {
    const leadData = this.leadData
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
  };

  // handles the onChange of the equipment inputs
  handleEquipmentInput(e, id) {
    var value = e.target.value;

    if (id === "model" || id === "serial") {
      const newValue = e.target.value;
      value = newValue.toUpperCase();
    }

    if (id === "stock") {
      const newValue = e.target.value;
      value = newValue.replace(/[^0-9]/g, "");
    }

    if (id === "quotePrice") {
      const rawValue = e.target.value.replace(/[^0-9.]/g, "");
      const [whole = "", ...decimalParts] = rawValue.split(".");
      const decimals = decimalParts.join("").slice(0, 2);
      value = decimals.length > 0 ? `${whole}.${decimals}` : whole;
    }

    this.setEquipment({ ...this.equipment, [id]: value });
  };

  handleTaskNoteInput(e) {
    this.setTaskNote(e.target.value);
  };



  // handles equipment object values for the inputs
  handleEquipmentValues(id) {
    const equipment = this.equipment

    switch (id) {
      case "model":
        return equipment.model;
      case "stock":
        return equipment.stock;
      case "serial":
        return equipment.serial;
      case "quotePrice":
        return equipment.quotePrice || "";
      case "status":
        return equipment.status;
      case "availability":
        return equipment.availability;
      case "notes":
        return equipment.notes;
      default:
        return "";
    }
  };

  // sets the array for the equipment select inputs
  equipmentSelectArray(id) {
    switch (id) {
      case "status":
        return equipmentStatusArray;
      case "availability":
        return equipmentAvailabilityArray;
      default:
        return null;
    }
  };
}

export default AddLeadViewModel;
