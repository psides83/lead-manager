import { db } from "../../../services/firebase";
import { setDoc, doc } from "@firebase/firestore";
import moment from "moment";
import {
  equipmentAvailabilityArray,
  equipmentStatusArray,
} from "../../../models/static-data";

export default class EquipmentFormViewModel {
  constructor(
    lead,
    equipment,
    equipmentData,
    setEquipmentData,
    importedData,
    setImportedData,
    change,
    setChange,
    setMessage,
    setOpenSuccess,
    setOpenError,
    loading,
    setLoading,
    setSuccess,
    setIsShowingDialog,
    handleCloseDialog
  ) {
    this.lead = lead;
    this.equipment = equipment;
    this.equipmentData = equipmentData;
    this.setEquipmentData = setEquipmentData;
    this.change = change;
    this.setChange = setChange;
    this.setMessage = setMessage;
    this.setOpenSuccess = setOpenSuccess;
    this.setOpenError = setOpenError;
    this.loading = loading;
    this.setLoading = setLoading;
    this.setSuccess = setSuccess;
    this.importedData = importedData;
    this.setImportedData = setImportedData;
    this.setIsShowingDialog = setIsShowingDialog;
    this.handleCloseDialog = handleCloseDialog;
  }

  // deletes the equipment item
  deleteEquipment = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const leadRef = doc(db, "leads", this.lead.id);

    const equipmentIndex = this.lead.equipment.indexOf(this.equipment);

    this.lead.equipment.splice(equipmentIndex, 1);

    await setDoc(leadRef, { equipment: this.lead.equipment }, { merge: true });

    this.setIsShowingDialog(false);
  };

  logChanges() {
    const equipmentData = this.equipmentData;
    const importedData = this.importedData;
    const change = this.change;
    const setChange = this.setChange;

    if (equipmentData.model !== importedData.model) {
      setChange(
        change.push(
          `Model edited from ${
            importedData.model === "" ? "BLANK" : importedData.model
          } to ${equipmentData.model === "" ? "BLANK" : equipmentData.model}`
        )
      );
    }

    if (equipmentData.stock !== importedData.stock) {
      setChange(
        change.push(
          `Stock # for ${equipmentData.model} edited from ${
            importedData.stock === "" ? "BLANK" : importedData.stock
          } to ${equipmentData.stock === "" ? "BLANK" : equipmentData.stock}`
        )
      );
    }

    if (equipmentData.serial !== importedData.serial) {
      setChange(
        change.push(
          `Serial # for ${equipmentData.model} edited from ${
            importedData.serial === "" ? "BLANK" : importedData.serial
          } to ${equipmentData.serial === "" ? "BLANK" : equipmentData.serial}`
        )
      );
    }

    if (equipmentData.status !== importedData.status) {
      setChange(
        change.push(
          `Status of ${equipmentData.model} updated from ${importedData.status} to ${equipmentData.status}`
        )
      );
    }

    if (equipmentData.notes !== importedData.notes) {
      setChange(
        change.push(
          `Notes on ${equipmentData.model} edited from ${
            importedData.notes === "" ? "BLANK" : importedData.notes
          } to ${equipmentData.notes === "" ? "BLANK" : equipmentData.notes}`
        )
      );
    }

    if (equipmentData.availability !== importedData.availability) {
      setChange(
        change.push(
          `Availability of ${equipmentData.model} updated from ${importedData.availability} to ${equipmentData.availability}`
        )
      );
    }
  }

  // Add the equipment to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
  setEquipmentToFirestore = async () => {
    const lead = this.lead;
    const equipment = this.equipment;
    const equipmentData = this.equipmentData;

    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = equipment ? equipment.id : moment().format("yyyyMMDDHHmmss");
    this.logChanges();
    var changeString = this.change.toString().replace(/,/g, ", ");

    if (changeString[0] === ",") {
      changeString = changeString.substring(1).trim();
    }

    equipmentData.changeLog.push({
      id: id,
      change: equipment ? changeString : `${equipmentData.model} added`,
      timestamp: timestamp,
    });

    var leadChangeLog = lead.changeLog;

    leadChangeLog.push({
      id: moment().format("yyyyMMDDHHmmss"),
      change: equipment ? changeString : `${equipmentData.model} added`,
      timestamp: timestamp,
    });

    equipmentData.id = id;
    equipmentData.timestamp = timestamp;

    if (equipment) {
      const currentEquipmentIndex = lead.equipment.indexOf(equipment);
      lead.equipment[currentEquipmentIndex] = equipmentData;
    } else {
      lead.equipment.push(equipmentData);
    }

    const leadRef = doc(db, "leads", lead?.id);

    await setDoc(
      leadRef,
      { equipment: lead.equipment, changeLog: leadChangeLog },
      { merge: true }
    );
  };

  // Reset the Lead form
  resetLeadForm() {
    this.setEquipmentData({
      model: "",
      stock: "",
      serial: "",
      availability: "Availability Unknown",
      status: "Equipment added",
      notes: "",
      willSubmitPDI: false,
      hasSubmittedPDI: false,
      changeLog: [],
    });
    this.setChange([]);
    this.setImportedData({});
  }

  // Requst submission validation.
  equipmentSubmitValidation = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setLoading(true);

    if (this.equipmentData.model === "") {
      this.setMessage("Equipment must have a model");
      this.setOpenError(true);
      return;
    } else {
      await this.setEquipmentToFirestore();
      this.setSuccess(true);
      this.setMessage("lead successfully edited");
      this.setOpenSuccess(true);
      this.setLoading(false);
      this.handleCloseDialog();
    }
  };

  // sets the state of the save button based on whether data in the form has changed or is being saved
  buttonIsDisabled() {
    const equipmentData = this.equipmentData;
    const importedData = this.importedData;

    if (this.loading) return true;

    if (equipmentData.model !== importedData.model) return false;
    if (equipmentData.stock !== importedData.stock) return false;
    if (equipmentData.serial !== importedData.serial) return false;
    if (equipmentData.status !== importedData.status) return false;
    if (equipmentData.availability !== importedData.availability) return false;
    if (equipmentData.notes !== importedData.notes) return false;
    if (equipmentData.willSubmitPDI !== importedData.willSubmitPDI) return false;
    if (equipmentData.work.length !== 0 && equipmentData.work.some((item) => { return item !== null })) return false;
    return true;
  }

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

    this.setEquipmentData({ ...this.equipmentData, [id]: value });
  }

  // handles equipment object values for the inputs
  handleEquipmentValues(id) {
    const equipmentData = this.equipmentData;

    switch (id) {
      case "model":
        return equipmentData.model;
      case "stock":
        return equipmentData.stock;
      case "serial":
        return equipmentData.serial;
      case "status":
        return equipmentData.status;
      case "availability":
        return equipmentData.availability;
      case "notes":
        return equipmentData.notes;
      default:
        return "";
    }
  }

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
  }
}
