import React, { useState } from "react";
import { ExpandLessRounded, ExpandMoreRounded } from "@mui/icons-material";
import {
  Collapse,
  IconButton,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import EquipmentForm from "../../equipment-form/equipment-form";

export default function EquipmentSection(props) {
  const { lead, setMessage, setOpenError, setOpenSuccess } = props;
  const [showingEquipment, setShowingEquipment] = useState(false);

  const showEquipment = (event) => {
    event.preventDefault();
    showingEquipment ? setShowingEquipment(false) : setShowingEquipment(true);
  };

  const stockNumber = (stock) => {
    if (stock === undefined) return;
    if (stock === null) return;
    if (stock === "") return;
    return <Typography variant="caption">{`Stock: ${stock}`}</Typography>;
  };

  const serialNumber = (serial) => {
    if (serial === undefined) return;
    if (serial === null) return;
    if (serial === "") return;
    return <Typography variant="caption">{`Serial: ${serial}`}</Typography>;
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle1">Equipment</Typography>
          <EquipmentForm
            lead={lead}
            setMessage={setMessage}
            setOpenError={setOpenError}
            setOpenSuccess={setOpenSuccess}
          />
        </Stack>
        {lead.equipment.length !== 0 ? (
          <IconButton size="small" onClick={showEquipment}>
            {!showingEquipment ? <ExpandMoreRounded /> : <ExpandLessRounded />}
          </IconButton>
        ) : null}
      </Stack>
      <Collapse in={showingEquipment}>
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {lead.equipment.map((unit) => {
            return (
              <ListItem key={unit.id} disablePadding sx={{ width: "100%" }}>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                >
                  <EquipmentForm
                    equipment={unit}
                    lead={lead}
                    setMessage={setMessage}
                    setOpenError={setOpenError}
                    setOpenSuccess={setOpenSuccess}
                  />

                  <Stack justifyItems="flex-end" alignContent="flex-end">
                    {stockNumber(unit.stock)}
                    {serialNumber(unit.serial)}
                  </Stack>
                </Stack>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </>
  );
}
