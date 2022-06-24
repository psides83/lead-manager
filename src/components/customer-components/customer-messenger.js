import { ArrowUpwardRounded } from "@mui/icons-material";
import {
  IconButton,
  Paper,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import {
  doc,
  setDoc,
} from "firebase/firestore";
import moment from "moment";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { db } from "../../services/firebase";

function CustomerMessenger(props) {
  const { user, lead } = props;
  const [messageText, setMessageText] = useState("");
  // eslint-disable-next-line
  var [messages, setMessages] = useState();

  const bottomRef = useRef(null);

  const scroll = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line
  }, [lead.messages]);

  useEffect(() => {
    setMessages(lead.messages);
    scroll();
  }, [scroll, lead.messages]);

  const recipiantID = useCallback(() => {
    if (user?.type === "admin") return lead?.id;
    if (user === undefined) return lead?.salesmanID;
  }, [user, lead]);

  const threadID = useCallback(() => {
    if (user?.type === "admin") return user?.id + lead?.id;
    if (user === undefined) return lead?.salesmanID + lead?.id;
    return;
  }, [user, lead]);

  const submitMessage = async (e) => {
    e.preventDefault();
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = moment().format("yyyyMMDDHHmmss");

    const sender = () => {
      if (user === undefined) return "customer";
      return "admin";
    };

    const senderID = () => {
      if (user === undefined) return lead?.id;
      return user?.id;
    };

    if (threadID()) {
      const messageData = {
        id: id,
        timestamp: timestamp,
        text: messageText,
        sender: sender(),
        senderID: senderID(),
        recipiantID: recipiantID(),
        threadID: threadID(),
        unread: sender() === "customer" ? true : false,
      };

      var messagesArray = [];

      if (lead.messages !== undefined) {
        lead.messages.push(messageData);
        messagesArray = lead.messages;
      } else {
        messagesArray.push(messageData);
      }

      const leadDoc = doc(db, "leads", lead.id);
      await setDoc(leadDoc, { messages: messagesArray }, { merge: true })
        .then
        ();
      setMessageText("");
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const messageSenderCheck = (message) => {
    if (user === undefined && message.senderID === lead.id) return true;
    if (user !== undefined && message.senderID === user?.id) return true;
    return false;
  };

  return (
    <Paper
      elevation={4}
      sx={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignContent: "space-between",
        padding: "10px 10px 10px 10px",
        backgroundColor: "white",
        borderRadius: 2,
        minWidth: "350px",
      }}
    >
      <div
        style={{
          borderBottom: "solid gray 1px",
          marginBottom: "10px",
        }}
      >
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
      </div>
      <div
        style={{
          overflow: "scroll",
          minHeight: "150px",
          maxHeight: "400px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {lead.messages?.map((message) => (
          <div
            key={message.id}
            style={{
              display: "flex",
              justifyContent: messageSenderCheck(message)
                ? "flex-end"
                : "flex-start",
              flexGrow: 1,
            }}
          >
            <div
              style={{
                background: messageSenderCheck(message) ? "#367C2B" : "#e9e9e9",
                padding: "4px 12px 4px 12px",
                margin: "0 12px 12px",
                borderRadius: "20px",
                textAlign: "left",
                alignSelf: "flex-end",
                color: messageSenderCheck(message) ? "white" : "inherit",
                maxWidth: "200px",
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div
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
            flexGrow: 1,
            fontFamily: "sans-serif",
            borderRadius: "20px 0 0 20px",
            border: "none",
            backgroundColor: "white",
            padding: "10px 10px 12px 10px",
            resize: "none",
            outline: "none",
            fontSize: "16px",
          }}
          value={messageText}
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
      </div>
    </Paper>
  );
}

export default CustomerMessenger;
