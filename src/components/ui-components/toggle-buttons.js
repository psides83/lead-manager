import React from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";

const ToggleButtons = (props) => {
  const { toggleValue, setToggleValue, selections } = props;

  const handleValue = (event, newValue) => {
    if (newValue !== null) {
      setToggleValue(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={toggleValue}
      size="small"
      exclusive
      onChange={handleValue}
      aria-label="text alignment"
    >
      {selections?.map((selection) => (
        <ToggleButton key={selection} value={selection}>
          {selection}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ToggleButtons;
