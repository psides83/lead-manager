import React from "react";
import { Box, Tooltip } from "@mui/material";

const ICON_BASE_PATH = "/deere-icons";

const iconRules = [
  {
    terms: [
      "FC10R",
      "FC12E",
      "FC15E",
      "FC15M",
      "FC15R",
      "FC20M",
      "FC20R",
      "RC5M",
      "RC6M",
      "RC6R",
      "RC7M",
      "RC7R",
      "RC8M",
      "RC10M",
      "RC10R",
      "RC14R",
      "RC2048",
      "RC2060",
      "RC2072",
      "RC2084",
    ],
    file: "3-point-rotary-cutter.svg",
  },
  {
    terms: ["stand on mower", "stand-on mower"],
    file: "com-stand-on-mower.svg",
  },
  { terms: ["Z7", "Z9"], file: "com-ztrak-mower.svg" },
  { terms: ["Z3", "Z5"], file: "res-ztrak-mower.svg" },
  {
    terms: ["walk behind mower", "walk-behind mower"],
    file: "walk-behind-mower.svg",
  },
  { terms: ["S1", "S2", "X3", "X5", "X7"], file: "lawn-tractor-mower.svg" },
  { terms: ["CP"], file: "cotton-picker.svg" },
  // { terms: ["F8 300", "F8 400", "F8 500"], file: "forage-harv-1.svg" },
  { terms: ["F8 300", "F8 400", "F8 500"], file: "forage-harv-2.svg" },
  // { terms: ["forage harvester"], file: "forage-harv-1.svg" },
  { terms: ["X9", "S7"], file: "harvester.svg" },
  {
    terms: ["1590", "1520", "455 Drill", "BD11 Drill", "drill"],
    file: "drill.svg",
  },
  {
    terms: ["S250", "S300", "S350", "C300", "C350", "C400", "C450", "C500"],
    file: "moco.svg",
  },
  {
    terms: [
      "Frontier LS1125",
      "Frontier LS1130",
      "Frontier LS1130BL",
      "Frontier LS1140",
      "Frontier LS1145",
      "Frontier LS2004",
      "Frontier LS2006",
      "Frontier LS2011",
    ],
    file: "pull-sprayer.svg",
  },
  { terms: ["sprayer"], file: "sprayer.svg" },
  { terms: ["round baler", "baler"], file: "round-baler.svg" },
  { terms: ["skid steer", "skid-steer"], file: "skid-steer.svg" },
  {
    terms: ["track loader", "compact track loader", "ctl"],
    file: "track-loader.svg",
  },
  { terms: ["wheel loader"], file: "wheel-loader.svg" },
  { terms: ["mini ex", "mini excavator", "excavator"], file: "mini-ex.svg" },
  { terms: ["xuv gator", "xuv"], file: "xuv-gator.svg" },
  { terms: ["tx ts gator", "tx gator", "ts gator"], file: "tx-ts-gator.svg" },
  { terms: ["wind rower", "windrower"], file: "wind-rower.svg" },
  {
    terms: [
      "1025R Cab",
      "3033R Cab",
      "3039R Cab",
      "3046R Cab",
      "4044R Cab",
      "4052R Cab",
      "4066R Cab",
    ],
    file: "tractor-compact-cab.svg",
  },
  {
    terms: [
      "1023E",
      "1025R",
      "2025R",
      "2032R",
      "2038R",
      "3025E",
      "3032E",
      "3038E",
      "3025D",
      "3035D",
      "3043D",
      "3033R",
      "3039R",
      "3046R",
      "4044M",
      "4052M",
      "4066M",
      "4044R",
      "4052R",
      "4066R",
      "4044M HD",
      "4052M HD",
      "4066M HD",
    ],
    file: "tractor-compact-open.svg",
  },
  {
    terms: [
      "7R 210",
      "7R 230",
      "7R 250",
      "7R 270",
      "7R 290",
      "7R 310",
      "7R 330",
      "7R 350",
      "8R 230",
      "8R 250",
      "8R 280",
      "8R 310",
      "8R 340",
      "8R 370",
      "8R 410",
      "8R 440",
      "8R 490",
      "8R 540",
    ],
    file: "tractor-cab-lg.svg",
  },
  {
    terms: [
      "6M 95",
      "6M 105",
      "6M 110",
      "6M 115",
      "6M 120",
      "6M 125",
      "6M 130",
      "6M 140",
      "6M 145",
      "6M 150",
      "6M 155",
      "6M 165",
      "6M 180",
      "6M 200",
      "6M 220",
      "6M 230",
      "6M 240",
      "6M 250",
      "6R 110",
      "6R 120",
      "6R 130",
      "6R 140",
      "6R 145",
      "6R 150",
      "6R 155",
      "6R 165",
      "6R 175",
      "6R 185",
      "6R 195",
      "6R 215",
      "6R 230",
      "6R 250",
    ],
    file: "tractor-cab-md.svg",
  },
  {
    terms: [
      "5060E",
      "5067E",
      "5075E",
      "5090E",
      "5100E",
      "5075M",
      "5085M",
      "5090M",
      "5095M",
      "5105M",
      "5110M",
      "5115M",
      "5120M",
      "5125M",
      "5130M",
      "6105E",
      "6120E",
      "6125E",
      "6135E",
      "6140E",
      "6150E",
    ],
    file: "tractor-cab-small.svg",
  },
  {
    terms: ["5105ML", "5120ML"],
    file: "tractor-open-low-pro.svg",
  },
  {
    terms: [
      "5050E",
      "5060E",
      "5067E",
      "5075E",
      "5090E",
      "5100E",
      "6105E",
      "6120E",
      "6125E",
      "6135E",
      "6140E",
      "6150E",
    ],
    file: "tractor-open-station.svg",
  },
  {
    terms: [
      "120R",
      "300E",
      "320R",
      "400E",
      "420R",
      "440R",
      "500E",
      "500M",
      "520M",
      "540M",
      "600R",
      "620R",
      "620M",
      "630M",
      "640M",
      "644M",
      "650R",
      "650M",
      "660R",
      "660M",
    ],
    file: "loader.svg",
  },
];

const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const resolveFile = (model = "") => {
  const normalizedModel = normalize(model);
  if (!normalizedModel) return null;

  for (const rule of iconRules) {
    if (rule.terms.some((term) => normalizedModel.includes(normalize(term)))) {
      return rule.file;
    }
  }
  return null;
};

export default function EquipmentIcon({ model, size = 48, title }) {
  const file = resolveFile(model);

  if (!file) {
    return null;
  }

  const node = (
    <Box
      component="img"
      src={`${ICON_BASE_PATH}/${file}`}
      alt={model || "equipment"}
      sx={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );

  if (!title) {
    return node;
  }

  return <Tooltip title={title}>{node}</Tooltip>;
}
