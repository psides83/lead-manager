import { PhoneNumberMask } from "../utils/phone-number-mask";
import moment from "moment";

// array of lead status options
const leadStatusArray = [
  "Lead Created",
  "Quote Requested",
  "Trade assessment required",
  "More info required",
  "Quote sent",
  "Follow-up due",
  "Updated quote requested",
  "Finance app info required",
  "Finance submitted",
  "Finance approved",
  "See equipment status",
  "Schedule pickup/delivery required",
  "Pickup/delivery scheduled",
  "Delivered",
  "Signiture required",
  "Closed",
];

// array of equipment status options
const equipmentStatusArray = [
  "Equipment added",
  "Setup required",
  "Transfer required",
  "Order required",
  "Setup requested",
  "Transfer requested",
  "Order placed",
  "Transfer in progress",
  "Order in progress",
  "Setup in progress",
  "Ready",
  "Delivered",
];

// array of equipment availability options
const equipmentAvailabilityArray = [
  "Availability Unknown",
  "In Stock(Auburn)",
  "In Stock(Transfer)",
  "Pending",
  "Unavailable",
];

// user types
const userTypes = [
  "admin",
  "sales"
]

// SunSouth branches
const branches = [
  "Abbeville",
  "Andalusia",
  "Auburn",
  "Barnesville",
  "Blakely",
  "Brundidge",
  "Carrollton",
  "Carthage",
  "Clanton",
  "Columbus",
  "Demopolis",
  "Donalsonville",
  "Dothan",
  "Foley",
  "Gulfport",
  "Lucedale",
  "Meridian",
  "Mobile",
  "Montgomery",
  "Samson",
  "Tuscaloosa",
];

// array of categories for sales data
const categories = ["sales", "margin", "commission", "bonus"];

// array of years going three years back
const years = (yearStarted) => {
  const yearsSinceStarted = Number(moment().format("yyyy")) - Number(yearStarted)
  const yearsArray =[]

  for (var i=yearsSinceStarted; i>0; i--) {
    yearsArray.push(moment().subtract(i, "years").format("yyyy"))
  }

  yearsArray.push(moment().format("yyyy"))

  return yearsArray
}

// array of months in digit form
const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

// array of props for lead inputs
const addLeadInputs = [
  {
    id: "name",
    label: "Name",
    type: "text",
    gridXS: 12,
    gridSM: 6,
    required: true,
    autoFocus: true,
    select: false,
    multiline: false,
  },
  {
    id: "email",
    label: "Email",
    type: "mail",
    gridXS: 12,
    gridSM: 6,
    required: false,
    autoFocus: false,
    select: false,
    multiline: false,
  },
  {
    id: "phone",
    label: "Phone",
    type: "tel",
    inputProps: {
      inputComponent: PhoneNumberMask,
    },
    gridXS: 12,
    gridSM: 6,
    required: false,
    autoFocus: false,
    select: false,
    multiline: false,
  },
  {
    id: "status",
    label: "Status",
    type: "text",
    select: true,
    gridXS: 12,
    gridSM: 6,
    required: false,
    autoFocus: false,
    multiline: false,
  },
  {
    id: "notes",
    label: "Notes",
    type: "text",
    gridXS: 12,
    gridSM: 12,
    required: false,
    autoFocus: false,
    select: false,
    multiline: true,
  },
  {
    id: "quoteLink",
    label: "Quote Link",
    type: "text",
    gridXS: 12,
    gridSM: 12,
    required: false,
    autoFocus: false,
    select: false,
    multiline: false,
  },
];

// array of props for equipment inputs
const addEquipmentInputs = [
  {
    id: "model",
    label: "Model",
    type: "text",
    gridXS: 12,
    gridSM: 6,
    required: true,
    select: false,
    multiline: false,
  },
  {
    id: "stock",
    label: "Stock",
    type: "tel",
    inputProps: { maxLength: "6" },
    gridXS: 12,
    gridSM: 6,
    required: false,
    select: false,
    multiline: false,
  },
  {
    id: "serial",
    label: "Serial",
    type: "text",
    gridXS: 12,
    gridSM: 12,
    required: false,
    select: false,
    multiline: false,
  },
  {
    id: "status",
    label: "Status",
    type: "text",
    select: true,
    gridXS: 12,
    gridSM: 6,
    required: false,
    multiline: false,
  },
  {
    id: "availability",
    label: "Availability",
    type: "text",
    select: true,
    gridXS: 12,
    gridSM: 6,
    required: false,
    multiline: false,
  },
  {
    id: "notes",
    label: "Notes",
    type: "text",
    gridXS: 12,
    gridSM: 12,
    required: false,
    select: false,
    multiline: true,
  },
];

// array of props for user inputs
const userInputs = [
  {
    id: "firstName",
    label: "First Name",
    type: "text",
    gridXS: 12,
    gridSM: 6,
    required: true,
    autoFocus: true,
    select: false,
    multiline: false,
  },
  {
    id: "lastName",
    label: "Last Name",
    type: "text",
    gridXS: 12,
    gridSM: 6,
    required: true,
    autoFocus: false,
    select: false,
    multiline: false,
  },
  // {
  //   id: "email",
  //   label: "Email",
  //   type: "mail",
  //   gridXS: 12,
  //   gridSM: 12,
  //   required: false,
  //   autoFocus: false,
  //   select: false,
  //   multiline: false,
  // },
  {
    id: "type",
    label: "Type",
    type: "text",
    select: true,
    gridXS: 12,
    gridSM: 6,
    required: false,
    autoFocus: false,
    multiline: false,
  },
  {
    id: "yearStarted",
    label: "Year Started",
    type: "text",
    gridXS: 12,
    gridSM: 6,
    required: false,
    autoFocus: false,
    select: false,
    multiline: false,
  },
];

const SALES_CATEGORIES = {
  SALES: "sales",
  MARGIN: "margin",
  COMMISSION: "commission",
  BONUS: "bonus"
}

export {
  leadStatusArray,
  equipmentStatusArray,
  equipmentAvailabilityArray,
  branches,
  userTypes,
  addLeadInputs,
  addEquipmentInputs,
  userInputs,
  categories,
  years,
  months,
  SALES_CATEGORIES
};
