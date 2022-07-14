import { doc, setDoc } from "firebase/firestore";
import moment from "moment";
import { equipmentAvailabilityArray, equipmentStatusArray } from "../../../models/static-data";
import { db } from "../../../services/firebase";

class AddLeadViewModel {
  constructor(
    setMessage,
    setOpenSuccess,
    setOpenError,
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
    setEquipmentSuccess
  ) {
    this.setMessage = setMessage;
    this.setOpenSuccess = setOpenSuccess;
    this.setOpenError = setOpenError;
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

    console.table(leadData);

    const leadRef = doc(db, "leads", leadData.id);

    await setDoc(leadRef, leadData, { merge: true });
  };

  // Requst submission validation.
  leadSubmitValidation = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setLoadingLead(true);

    if (this.equipment.model === "" && this.equipmentList.length === 0) {
        this.setMessage("Equipment must have a model to be added to a lead");
        this.setOpenError(true);
      return false;
    } else if (this.leadData.name === "") {
        this.setMessage("Lead must have a name to be created");
        this.setOpenError(true);
      return false;
    } else {
      console.log("eq added directly from submit");
      if (this.equipment.model !== "") {
        console.log("another eq added first");
        await this.pushEquipmentToLead();
      }
      await this.setLeadToFirestore().then(()=> {
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
    console.log("Temp EQ");
    console.log(this.equipmentList);

    await this.resetEquipmentForm();
    this.setLoadingEquipment(false);
    this.setEquipmentSuccess(true);
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

  // Handle deleting of equipment from the lead.
  handleDelete = (equipmentToDelete) => () => {
    this.setEquipmentList((equipmentList) =>
      equipmentList.filter((equiment) => equiment.id !== equipmentToDelete.id)
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
    });
  };

  // Reset the Equipment form
  resetEquipmentForm = async () => {
    this.setEquipmentSuccess(false);
    this.setEquipment({
      model: "",
      stock: "",
      serial: "",
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

    this.setEquipment({ ...this.equipment, [id]: value });
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
