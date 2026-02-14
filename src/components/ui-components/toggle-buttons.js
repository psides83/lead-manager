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
      sx={{
        mt: 1,
        p: 0.5,
        borderRadius: 999,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        "& .MuiToggleButton-root": {
          border: "none",
          borderRadius: 999,
          px: 1.5,
          color: "text.secondary",
        },
        "& .Mui-selected": {
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
        },
      }}
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
