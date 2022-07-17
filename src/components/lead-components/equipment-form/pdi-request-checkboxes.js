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
    setOther(event.target.value);

    equipmentData.work[7] = other;
    setEquipmentData({ ...equipmentData, work: equipmentData.work });

    if (event.target.value !== "") {
      setOtherDisabled(false);
      setChecked8(true);
    } else if (event.target.value === "") {
      setOtherDisabled(true);
      setChecked8(false);
      equipmentData.work[7] = null;
      setEquipmentData({ ...equipmentData, work: equipmentData.work });
    }
  };

  // Handle changes in the checkboxes.
  const handleWorkChange = (event) => {
    switch (event.target.id) {
      case "1":
        if (!checked1) {
          setChecked1(true);
          equipmentData.work[0] = event.target.value;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        } else {
          setChecked1(false);
          equipmentData.work[0] = null;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        }
        break;
      case "2":
        if (!checked2) {
          setChecked2(true);
          equipmentData.work[1] = event.target.value;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        } else {
          setChecked2(false);
          equipmentData.work[1] = null;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        }
        break;
      case "3":
        if (!checked3) {
          setChecked3(true);
          equipmentData.work[2] = event.target.value;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        } else {
          setChecked3(false);
          equipmentData.work[2] = null;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        }
        break;
      case "4":
        if (!checked4) {
          setChecked4(true);
          equipmentData.work[3] = event.target.value;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        } else {
          setChecked4(false);
          equipmentData.work[3] = null;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        }
        break;
      case "5":
        if (!checked5) {
          setChecked5(true);
          equipmentData.work[4] = event.target.value;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        } else {
          setChecked5(false);
          equipmentData.work[4] = null;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        }
        break;
      case "6":
        if (!checked6) {
          setChecked6(true);
          equipmentData.work[5] = event.target.value;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        } else {
          setChecked6(false);
          equipmentData.work[5] = null;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        }
        break;
      case "7":
        if (!checked7) {
          setChecked7(true);
          equipmentData.work[6] = event.target.value;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
        } else {
          setChecked7(false);
          equipmentData.work[6] = null;
          setEquipmentData({ ...equipmentData, work: equipmentData.work });
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
                inputProps={{ style: { fontSize: 14 } }}
                id="other"
                value={other}
                onChange={enableOther}
              />
            </Stack>
            <Grid item xs={12} sm={12} style={{ marginTop: "10px" }}>
              <TextField
                fullWidth
                size="small"
                id={"pdiNotes"}
                name={"pdiNotes"}
                label={"PDI Notes"}
                labelid={"pdiNotes"}
                variant="outlined"
                onChange={(e) =>
                  setEquipmentData({
                    ...equipmentData,
                    pdiNotes: e.target.value,
                  })
                }
                value={equipmentData.pdiNotes ? equipmentData.pdiNotes : ""}
              />
            </Grid>
          </FormGroup>
        </Collapse>
      </Grid>
    </>
  );
}

export default PDIRequestCheckboxes;
