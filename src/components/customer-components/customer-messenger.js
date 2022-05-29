import { ArrowUpwardRounded, Check } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { db } from "../../services/firebase";

function CustomerMessenger(props) {
  const { user, lead } = props;
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  //    Fetch leads from firestore
  const fetchMessages = useCallback(async () => {
    console.log(lead);
    const messagesQuery = query(collection(db, "messages"));

    onSnapshot(messagesQuery, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          timestamp: doc.data().timestamp,
          text: doc.data().text,
          sender: doc.data().sender,
          senderID: doc.data().senderID,
          recipiantID: doc.data().recipiantID,
        }))
      );
    });

    console.log(user?.type);

    // timer.current = window.setTimeout(() => {
    //   setLoading(false);
    // }, 1000);
  }, [user, lead]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const submitMessage = async (e) => {
    e.preventDefault();
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");
    const messageData = {
      id: id,
      timestamp: timestamp,
      text: messageText,
      sender: user.type,
      senderID: user.id,
      recipiantID:
        user?.type === "admin" ? lead?.uid : "MT9eUPO0ZxVIQLv1sOjnHJpV9YD3",
    };
    const newMessage = doc(db, "messages", messageData.id);
    await setDoc(newMessage, messageData, { merge: true });
    setMessageText("");
  };

  const filter = (messages) => {
    return messages.filter((message) => {
      /*
      // in here we check if our region is equal to our c state
      // if it's equal to then only return the messages that match
      // if not return All the countries
      */
      if (lead) {
        if (message.sednerID === lead.uid || message.recipiantID === lead.uid) {
          return message;
        }
      }
      if (message.senderID === user?.id || message.recipiantID === user?.id) {
        return message;
      }
      return null;
    });
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
        margin: user?.type === "customer" && "12px",
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
          {filter(messages).map((message) => (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                justifyContent:
                  message.sender === user?.type ? "flex-end" : "flex-start",
                flexGrow: 1,
              }}
            >
              <Box
                sx={{
                  background:
                    message.sender === user?.type ? "#367C2B" : "#e9e9e9",
                  padding: "4px 12px 4px 12px",
                  margin: "0 12px 12px",
                  borderRadius: "30px",
                  textAlign: "left",
                  alignSelf: "flex-end",
                  color: message.sender === user?.type ? "white" : "inherit",
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
