import {
  Checkbox,
  Collapse,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

function PDIRequestCheckboxes(props) {
  const { equipmentData, setEquipmentData, other, setOther } = props;

  var [checked1, setChecked1] = useState(false);
  var [checked2, setChecked2] = useState(false);
  var [checked3, setChecked3] = useState(false);
  var [checked4, setChecked4] = useState(false);
  var [checked5, setChecked5] = useState(false);
  var [checked6, setChecked6] = useState(false);
  var [checked7, setChecked7] = useState(false);
  var [checked8, setChecked8] = useState(false);
  var [otherDisabled, setOtherDisabled] = useState(true);

  const updateWorkAt = (index, value) => {
    const nextWork = Array.isArray(equipmentData.work)
      ? [...equipmentData.work]
      : [];
    nextWork[index] = value;
    setEquipmentData({ ...equipmentData, work: nextWork });
  };

  // Array of work options that populate the checkbox setion of the form.
  var workOptions = [
    {
      id: "1",
      work: "PDI",
      checkedState: checked1,
    },
    {
      id: "2",
      work: "Water in tires",
      checkedState: checked2,
    },
    {
      id: "3",
      work: "Mount to listed tractor/CCE machine",
      checkedState: checked3,
    },
    {
      id: "4",
      work: "Add 3rd function",
      checkedState: checked4,
    },
    {
      id: "5",
      work: "Install radio",
      checkedState: checked5,
    },
    {
      id: "6",
      work: "Mount canopy",
      checkedState: checked6,
    },
    {
      id: "7",
      work: "Widen tires",
      checkedState: checked7,
    },
  ];

  // Set the state of the "other" checkbox. It's disabled if the textfield is empty.
  const enableOther = (event) => {
    const nextOther = event.target.value;
    setOther(event.target.value);

    updateWorkAt(7, nextOther === "" ? null : nextOther);

    if (nextOther !== "") {
      setOtherDisabled(false);
      setChecked8(true);
    } else if (nextOther === "") {
      setOtherDisabled(true);
      setChecked8(false);
      updateWorkAt(7, null);
    }
  };

  // Handle changes in the checkboxes.
  const handleWorkChange = (event) => {
    switch (event.target.id) {
      case "1":
        if (!checked1) {
          setChecked1(true);
          updateWorkAt(0, event.target.value);
        } else {
          setChecked1(false);
          updateWorkAt(0, null);
        }
        break;
      case "2":
        if (!checked2) {
          setChecked2(true);
          updateWorkAt(1, event.target.value);
        } else {
          setChecked2(false);
          updateWorkAt(1, null);
        }
        break;
      case "3":
        if (!checked3) {
          setChecked3(true);
          updateWorkAt(2, event.target.value);
        } else {
          setChecked3(false);
          updateWorkAt(2, null);
        }
        break;
      case "4":
        if (!checked4) {
          setChecked4(true);
          updateWorkAt(3, event.target.value);
        } else {
          setChecked4(false);
          updateWorkAt(3, null);
        }
        break;
      case "5":
        if (!checked5) {
          setChecked5(true);
          updateWorkAt(4, event.target.value);
        } else {
          setChecked5(false);
          updateWorkAt(4, null);
        }
        break;
      case "6":
        if (!checked6) {
          setChecked6(true);
          updateWorkAt(5, event.target.value);
        } else {
          setChecked6(false);
          updateWorkAt(5, null);
        }
        break;
      case "7":
        if (!checked7) {
          setChecked7(true);
          updateWorkAt(6, event.target.value);
        } else {
          setChecked7(false);
          updateWorkAt(6, null);
        }
        break;
      case "8":
        if (!checked8) {
          setChecked8(true);
        } else {
          setChecked8(false);
        }
        break;
      default:
        break;
    }
  };

  // Handle changes in the checkboxes.
  function handleChange(event) {
    if (equipmentData.willSubmitPDI)
      setEquipmentData({ ...equipmentData, willSubmitPDI: false, work: [] });
    if (!equipmentData.willSubmitPDI)
      setEquipmentData({ ...equipmentData, willSubmitPDI: true });
  }

  const workArrayString = () => {
    var temp = [];

    if (equipmentData.work !== undefined) {
      for (let i of equipmentData?.work) i && temp.push(i);
    }
    var workString = temp.toString().replace(/,/g, ", ");

    if (workString[0] === ",") {
      return workString.substring(1).trim();
    }

    return workString;
  };

  function PDICheckBox() {
    if (
      !equipmentData.hasSubmittedPDI &&
      (equipmentData.stock.length === 6) &&
      (equipmentData.serial !== "")
    ) {
      return (
        <FormControlLabel
          control={
            <Checkbox
              id={"submitToPDI"}
              checked={equipmentData.willSubmitPDI}
              onChange={(e) => handleChange(e)}
              color="primary"
              value={equipmentData.willSubmitPDI}
            />
          }
          label={
            <Typography style={{ fontSize: 14 }}>Submit PDI/Setup</Typography>
          }
        />
      );
    } else if (equipmentData.hasSubmittedPDI) {
      return (
        <div
          style={{
            padding: "3px 5px 3px 5px",
            background: "rgb(54, 124, 42, 0.9)",
            borderRadius: "4px",
          }}
        >
          <Typography style={{ fontSize: 12, color: "white" }}>
            PDI/Setup Submitted
          </Typography>
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <>
      <Grid item>
        <Stack direction="row">
          <PDICheckBox />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Collapse
          in={equipmentData.willSubmitPDI && !equipmentData.hasSubmittedPDI}
        >
          <Typography>
            <strong>Current Work</strong>
          </Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flexStart",
            }}
          >
            <Typography>{workArrayString()}</Typography>
          </div>

          <FormGroup>
            <Typography variant="h6" style={{ fontSize: 18 }}>
              Work Required
            </Typography>

            {workOptions.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    id={option.id}
                    checked={option.checkedState}
                    size="small"
                    onChange={handleWorkChange}
                    color="primary"
                    value={option.work}
                  />
                }
                label={
                  <Typography style={{ fontSize: 14 }}>
                    {option.work}
                  </Typography>
                }
              />
            ))}
            <Stack direction="row">
              <FormControlLabel
                control={
                  <Checkbox
                    id="8"
                    checked={checked8}
                    size="small"
                    onChange={handleWorkChange}
                    disabled={otherDisabled}
                    color="primary"
                    value={other}
                  />
                }
                label={
                  <Typography style={{ fontSize: 14 }}>Other: </Typography>
                }
              />

              <TextField
                fullWidth
                size="small"
                id="other"
                name="lm-equipment-other"
                value={other}
                onChange={enableOther}
                autoComplete="off"
                slotProps={{
                  htmlInput: {
                    style: { fontSize: 14 },
                    autoComplete: "new-password",
                    name: "lm-equipment-other",
                    "data-form-type": "other",
                    "data-lpignore": "true",
                  }
                }}
              />
            </Stack>
            <Grid item xs={12} sm={12} style={{ marginTop: "10px" }}>
              <TextField
                fullWidth
                size="small"
                id={"pdiNotes"}
                name="lm-equipment-pdi-notes"
                label={"PDI Notes"}
                variant="outlined"
                autoComplete="off"
                onChange={(e) =>
                  setEquipmentData({
                    ...equipmentData,
                    pdiNotes: e.target.value,
                  })
                }
                value={equipmentData.pdiNotes ? equipmentData.pdiNotes : ""}
                slotProps={{
                  htmlInput: {
                    autoComplete: "new-password",
                    name: "lm-equipment-pdi-notes",
                    "data-form-type": "other",
                    "data-lpignore": "true",
                  }
                }}
              />
            </Grid>
          </FormGroup>
        </Collapse>
      </Grid>
    </>
  );
}

export default PDIRequestCheckboxes;
