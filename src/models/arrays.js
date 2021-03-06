import { PhoneNumberMask } from "../components/lead-components/phone-number-mask";
import moment from "moment";

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

const equipmentAvailabilityArray = [
  "Availability Unknown",
  "In Stock(Auburn)",
  "In Stock(Transfer)",
  "Pending",
  "Unavailable",
];

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

const categories = ["sales", "margin", "commission", "bonus"];


const dataTypes = ["Gross Revenue", "Margin", "Commission", "Bonus"];

  const years = [
    moment().subtract(3, "years").format("yyyy"),
    moment().subtract(2, "years").format("yyyy"),
    moment().subtract(1, "years").format("yyyy"),
    moment().format("yyyy"),
  ];

  const months = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

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

export {
  leadStatusArray,
  equipmentStatusArray,
  equipmentAvailabilityArray,
  branches,
  addLeadInputs,
  addEquipmentInputs,
  categories,
  dataTypes,
  years,
  months
};
