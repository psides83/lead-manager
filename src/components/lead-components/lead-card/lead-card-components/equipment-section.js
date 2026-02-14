import React, { useContext, useState } from "react";
import {
  BuildRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  SendRounded,
} from "@mui/icons-material";
import {
  Button,
  Collapse,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EquipmentForm from "../../equipment-form/equipment-form";
import { AuthContext } from "../../../../state-management/auth-context-provider";
import { submitSetupRequest } from "../../../../services/setup-request-service";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../../services/firebase";
import { syncEquipmentToSetupRequest } from "../../../../services/setup-request-service";
import { writeAuditLog } from "../../../../services/audit-log-service";

export default function EquipmentSection(props) {
  const { lead, setMessage, setOpenError, setOpenSuccess } = props;
  const [showingEquipment, setShowingEquipment] = useState(false);
  const [isShowingConfirmDialog, setIsShowingConfirmDialog] = useState(false);
  const [undoEquipmentOpen, setUndoEquipmentOpen] = useState(false);
  const [deletedEquipmentPayload, setDeletedEquipmentPayload] = useState(null);
  const { pdiUser, userProfile } = useContext(AuthContext);

  const handleCloseConfirmDialog = () => {
    setIsShowingConfirmDialog(false);
  };

  const handleToggleConfirmDialog = () => {
    setIsShowingConfirmDialog(!isShowingConfirmDialog);
  };

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

  function SubmitPDIButton() {
    if (lead.equipment.some((unit) => unit.willSubmitPDI))
      return (
        <Tooltip title="Submit for PDI">
          <Button
            onClick={handleToggleConfirmDialog}
            endIcon={<BuildRounded />}
          >
            PDI
          </Button>
        </Tooltip>
      );
  }

  async function submitPDI(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await submitSetupRequest({ lead, pdiUser, userProfile });
      setMessage(
        result?.isExistingRequest
          ? "Equipment added to existing PDI/Setup request"
          : "PDI/Setup request submitted",
      );
      setOpenSuccess(true);
      handleCloseConfirmDialog();
    } catch (error) {
      setMessage(error?.message || "Unable to submit PDI/Setup request");
      setOpenError(true);
    }
  }

  const handleEquipmentDeleted = (payload) => {
    setDeletedEquipmentPayload(payload);
    setUndoEquipmentOpen(true);
  };

  const handleUndoEquipmentClose = () => {
    setUndoEquipmentOpen(false);
  };

  const handleUndoEquipmentDelete = async () => {
    const equipment = deletedEquipmentPayload?.equipment;
    const equipmentIndex = deletedEquipmentPayload?.equipmentIndex;
    if (!equipment) {
      return;
    }

    const updatedEquipment = [...(lead.equipment || [])];
    const safeIndex =
      typeof equipmentIndex === "number" && equipmentIndex >= 0
        ? Math.min(equipmentIndex, updatedEquipment.length)
        : updatedEquipment.length;
    updatedEquipment.splice(safeIndex, 0, equipment);

    await setDoc(
      doc(db, "leads", lead.id),
      { equipment: updatedEquipment },
      { merge: true },
    );
    await syncEquipmentToSetupRequest({
      lead: { ...lead, equipment: updatedEquipment },
      equipment,
      pdiUser,
      userProfile,
    });
    await writeAuditLog({
      actionType: "equipment_restore_undo",
      entityType: "equipment",
      entityId: equipment?.id || equipment?.stock || "",
      leadId: lead.id,
      after: equipment,
      metadata: { equipmentIndex: safeIndex, source: "equipment-section-undo" },
    });

    setUndoEquipmentOpen(false);
    setDeletedEquipmentPayload(null);
    setMessage("Equipment restored");
    setOpenSuccess(true);
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
            onEquipmentDeleted={handleEquipmentDeleted}
          />
          <SubmitPDIButton />
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
                    onEquipmentDeleted={handleEquipmentDeleted}
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

      <Dialog onClose={handleCloseConfirmDialog} open={isShowingConfirmDialog}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "5px 25px 25px 25px",
          }}
        >
          <DialogTitle>Confirm PDI Submit</DialogTitle>

          <div>
            <Typography>Are you sure you want to</Typography>
            <Typography>submit these units for PDI?</Typography>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: "25px",
              }}
            >
              <Button
                variant="outlined"
                color="info"
                onClick={handleCloseConfirmDialog}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                // color="error"
                // onClick={}
                onClick={submitPDI}
                endIcon={<SendRounded />}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
      <Snackbar
        open={undoEquipmentOpen}
        autoHideDuration={6000}
        onClose={handleUndoEquipmentClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        message="Equipment deleted"
        action={
          <Button color="inherit" size="small" onClick={handleUndoEquipmentDelete}>
            UNDO
          </Button>
        }
      />
    </>
  );
}
