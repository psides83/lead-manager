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
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EquipmentForm from "../../equipment-form/equipment-form";
import { AuthContext } from "../../../../state-management/auth-context-provider";
import moment from "moment";
import { pdiDB } from "../../../../services/pdi-firebase";
import { doc, setDoc } from "firebase/firestore";

export default function EquipmentSection(props) {
  const { lead, setMessage, setOpenError, setOpenSuccess } = props;
  const [showingEquipment, setShowingEquipment] = useState(false);
  const [isShowingConfirmDialog, setIsShowingConfirmDialog] = useState(false);
  var [equipmentList, setEquipmentList] = useState([])
  const { pdiUser } = useContext(AuthContext);

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

  // TODO - add lead equipment functions for updating firestore values (hasSubmittedPDI, update equipment status to pdi requested)

  async function setPDITofirestore() {
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    const salesman = `${pdiUser?.firstName} ${pdiUser?.lastName}`;
    const changeLog = [
      {
        user: salesman,
        change: `request created`,
        timestamp: timestamp,
      },
    ];

    const firestoreRequest = {
      id: id,
      timestamp: timestamp,
      salesman: salesman,
      status: "Requested",
      statusTimestamp: timestamp,
      workOrder: "",
      changeLog: changeLog,
    };

    const requestRef = doc(
      pdiDB,
      "branches",
      pdiUser.branch,
      "requests",
      firestoreRequest.id
    );

    await setDoc(requestRef, firestoreRequest, { merge: true });

    for (var i = 0; i < equipmentList.length; i++) {
      const equipment = {
        requestID: firestoreRequest.id,
        timestamp: firestoreRequest.timestamp,
        model: equipmentList[i].model,
        stock: equipmentList[i].stock,
        serial: equipmentList[i].serial,
        work: equipmentList[i].work,
        notes: equipmentList[i].notes,
        changeLog: equipmentList[i].changeLog,
      };

      const equipmentRef = doc(
        pdiDB,
        "branches",
        pdiUser.branch,
        "requests",
        firestoreRequest.id,
        "equipment",
        equipment.stock
      );
      await setDoc(equipmentRef, equipment, { merge: true });
    }

    // sendNewRequestEmail(
    //   timestamp,
    //   equipmentList,
    //   fullName,
    //   userProfile,
    //   salesman
    // );
  };

  async function buildPdiList() {
    const fullName = pdiUser?.firstName + " " + pdiUser?.lastName;
    lead.equipment.forEach((unit) => {
      if (unit.willSubmitPDI) {
        var temp = [];

        if (unit.work !== undefined) {
          for (let i of unit.work) i && temp.push(i); // copy each non-empty value to the 'temp' array
        }

        var workString = temp.toString().replace(/,/g, ", ");

        if (workString[0] === ",") {
          workString = workString.substring(1).trim();
        }

        console.log(workString);

        const changeLog = [
          {
            user: fullName,
            change: `equipment added to request`,
            timestamp: moment().format("DD-MMM-yyyy hh:mmA"),
          },
        ];

        var equipment = {
          id: equipmentList.length + 1,
          model: unit.model,
          stock: unit.stock,
          serial: unit.serial,
          work: workString,
          notes: unit.pdiNotes,
          changeLog: changeLog,
        };

        equipmentList.push(equipment);
        setEquipmentList(equipmentList);
        console.log("Temp EQ");
        console.log(equipmentList);
      }
    });
  }

  async function submitPDI(e) {
    e.preventDefault()
    e.stopPropagation()
    await buildPdiList().then(() => {
      setPDITofirestore()
    })
  }

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
    </>
  );
}
