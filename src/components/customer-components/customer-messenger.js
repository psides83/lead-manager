import { ArrowUpwardRounded } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import {
  db,
} from "../../services/firebase";

function CustomerMessenger(props) {
  const { user, lead } = props;
  const [messageText, setMessageText] = useState("");
  // const [messages, setMessages] = useState([]);

  // const getSalesmanUID = useCallback(async () => {
  //   const docRef = doc(db, "users");
  //   const docSnap = await getDoc(docRef);

  //   if (docSnap.exists()) {
  //     console.log("Document data:", docSnap.data());
  //   } else {
  //     // doc.data() will be undefined in this case
  //     console.log("No such document!");
  //   }
  // }, []);

  const recipiantID = useCallback(() => {
    if (user?.type === "admin") return lead?.id;
    if (user == undefined) return lead?.salesmanID;
  }, [user, lead]);

  const threadID = useCallback(() => {
    if (user?.type === "admin") return user?.id + lead?.id;
    if (user == undefined) return lead?.salesmanID + lead?.id;
    return;
  }, [user, lead]);

  //    Fetch leads from firestore
  // const fetchMessages = useCallback(async () => {
  //   console.log(threadID());
  //   const messagesQuery = query(
  //     collection(db, "messages"),
  //     where("threadID", "==", threadID())
  //   );

  //   onSnapshot(messagesQuery, (querySnapshot) => {
  //     setMessages(
  //       querySnapshot.docs.map((doc) => ({
  //         id: doc.data().id,
  //         timestamp: doc.data().timestamp,
  //         text: doc.data().text,
  //         sender: doc.data().sender,
  //         senderID: doc.data().senderID,
  //         recipiantID: doc.data().recipiantID,
  //       }))
  //     );
  //   });

  //   // timer.current = window.setTimeout(() => {
  //   //   setLoading(false);
  //   // }, 1000);
  // }, [threadID]);

  // useEffect(() => {
  //   fetchMessages();
  // }, [fetchMessages]);

  const submitMessage = async (e) => {
    e.preventDefault();
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");

    const sender = () => {
      if (user == undefined) return "customer"
      return "admin"
    }

    const senderID = () => {
      if (user == undefined) return lead?.id
      return user?.id
    }

    if (threadID()) {
      const messageData = {
        id: id,
        timestamp: timestamp,
        text: messageText,
        sender: sender(),
        senderID: senderID(),
        recipiantID: recipiantID(),
        threadID: threadID(),
        unread: true
      };

      var messagesArray = [];

      if (lead.messages != undefined) {
        lead.messages.push(messageData)
        messagesArray = lead.messages
      } else {
        messagesArray.push(messageData)
      };

      const leadDoc = doc(db, "leads", lead.id);
      await setDoc(leadDoc, { messages: messagesArray }, { merge: true })
      .then(
        // sendNotificationToClient(lead.notificationToken, notificationMessage)
      );
      setMessageText("");
    };
  };

  const messageSenderCheck = (message) => {
    if (user == undefined && message.senderID === lead.id) return true
    if (user != undefined && message.senderID === user?.id) return true
    return false
 };

  return (
    <Paper
      elevation={4}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignContent: "space-between",
        padding: "10px 10px 10px 10px",
        backgroundColor: "white",
        borderRadius: 2,
        margin: "12px",
        minHeight: "270px",
        minWidth: "350px",
      }}
    >
      <Box>
        <Box sx={{ borderBottom: "solid gray 1px", marginBottom: "10px" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "darkgray",
              margin: "0 0 10px 10px",
            }}
          >
            Messages
          </Typography>
        </Box>
        <Box
          sx={{
            minHeight: "150px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {lead.messages?.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                justifyContent:
                  messageSenderCheck(message) ? "flex-end" : "flex-start",
                flexGrow: 1,
              }}
            >
              <Box
                sx={{
                  background:
                    messageSenderCheck(message) ? "#367C2B" : "#e9e9e9",
                  padding: "4px 12px 4px 12px",
                  margin: "0 12px 12px",
                  borderRadius: "30px",
                  textAlign: "left",
                  alignSelf: "flex-end",
                  color: messageSenderCheck(message) ? "white" : "inherit",
                }}
              >
                {message.text}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          width: "100%",
          borderRadius: "20px",
          border: "solid gray .5px",
          backgroundColor: "white",
          marginTop: "5px",
        }}
      >
        <TextareaAutosize
          placeholder="message..."
          style={{
            // width: "93%",
            fontFamily: "sans-serif",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "white",
            padding: "10px 10px 12px 10px",
            resize: "none",
            outline: "none",
            fontSize: "16px",
          }}
          value={messageText}
          // minRows={8}
          onChange={(e) =>
            setMessageText(
              e.target.value.replace(/^\w/, (c) => c.toUpperCase())
            )
          }
        />

        <IconButton disabled={!messageText} onClick={submitMessage}>
          <ArrowUpwardRounded
            style={{
              padding: "1px",
              color: "white",
              backgroundColor: !messageText ? "gray" : "#367C2B",
              borderRadius: "20px",
            }}
          />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default CustomerMessenger;
