import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
  where,
} from "@firebase/firestore";
import { db } from "../../services/firebase";
import { EditRounded, Menu } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import moment from "moment";

const RowText = (props) => {
  const { item, isEditing } = props;
  const [task, setTask] = useState(item.task);

  const blurHandler = async (event) => {
    await setDoc(
      doc(db, "tasks", event.target.id),
      { task: task },
      { merge: true }
    );
  };

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    // const id = moment().format("yyyyMMDDHHmmss");

    if (item.task !== "") {
      const status = item.isComplete === false ? true : false;
      const taskRef = doc(db, "tasks", item.id);
      setDoc(
        taskRef,
        {
          isComplete: status,
          completedTimestamp: timestamp,
        },
        { merge: true }
      );
    }
  };

  return (
    <>
      {isEditing ? null : (
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={item.isComplete}
            onClick={handleClick}
            // disableRipple
            inputProps={{ "aria-labelledby": task.id }}
          />
        </ListItemIcon>
      )}
      <ListItemText>
        {isEditing ? (
          <input
            required
            style={{
              width: "100%",
              outline: "none",
              border: "none",
              fontSize: "16px",
              // color: "rgba(255, 255, 255, 1)",
              // backgroundColor: "rgba(242, 242, 242, 1)"
            }}
            // size="small"
            key={item.id}
            id={item.id}
            name="item"
            // variant="standard"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            onBlur={blurHandler}
          />
        ) : (
          <Stack
          // direction="row"
          // alignItems="center"
          // justifyContent="space-between"
          >
            <Typography variant="subtitle1">{item.task}</Typography>
            <Typography
              //                           //   sx={{ display: "inline" }}
              component="span"
              variant="caption"
              color="text.secondary"
            >
              {item.leadName}
            </Typography>
          </Stack>
        )}
      </ListItemText>
    </>
  );
};

function Tasks() {
  // const [newTask, setNewTask] = useState();
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  // const [isAdding, setIsAdding] = useState(false);

  // const handleAdding = () => {
  //   if (!isAdding) {
  //     setIsAdding(true);
  //   } else {
  //     setNewTask("");
  //     setIsAdding(false);
  //   }
  // };

  const handleEditing = () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
      // setIsAdding(false);
    }
  };

  // const addNewTask = async () => {
  //   const newDoc = await addDoc(collection(db, "tasks"), {
  //     task: newTask,
  //     order: tasks.length,
  //   });

  //   await setDoc(
  //     doc(db, "tasks", newDoc.id),
  //     { id: newDoc.id },
  //     { merge: true }
  //   );

  //   handleAdding();
  // };

  const fetchTasks = useCallback(async () => {
    const taskQuery = query(
      collection(db, "tasks"),
      where("isComplete", "!=", true),
      orderBy("isComplete"),
      orderBy("order", "asc")
    );

    onSnapshot(taskQuery, (querySnapshot) => {
      setTasks(
        querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          task: doc.data().task,
          isComplete: doc.data().isComplete,
          leadName: doc.data().leadName,
          order: doc.data().order,
        }))
      );
    });
    console.log("fetch task has run");
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const setToFirestore = async (newOrder) => {
    const batch = writeBatch(db);

    newOrder.forEach((task) => {
      task.order = newOrder.indexOf(task);
      const groupRef = doc(db, "tasks", task.id);
      batch.set(groupRef, { order: task.order }, { merge: true });
    });

    await batch.commit();
  };

  return (
    <>
      <DragDropContext
        onDragEnd={(param) => {
          const sourceIndex = param.source.index;
          const destinationIndex = param.destination.index;
          tasks.splice(destinationIndex, 0, tasks.splice(sourceIndex, 1)[0]);
          setToFirestore(tasks);
          console.log(param);
        }}
      >
        <Paper
          elevation={4}
          style={{ padding: "15px 25px 15px 25px", borderRadius: "10px" }}
        >
          <List
            sx={{
              width: "100%",
              minWidth: 300,
              maxWidth: 360,
              // bgcolor: "background.paper",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "Center",
              }}
            >
              <Typography variant="h5">Tasks</Typography>
              {isEditing ? (
                <Button onClick={handleEditing}>Done</Button>
              ) : (
                <IconButton onClick={handleEditing}>
                  <EditRounded />
                </IconButton>
              )}
            </div>

            <Droppable droppableId="droppable-1">
              {(provided, _) => (
                <div ref={provided.innerRef}>
                  {tasks.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={`draggable-${item.id}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <>
                          <ListItem
                            // id={item.id}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...(isEditing ? provided.dragHandleProps : null)}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: snapshot.isDragging
                                ? "white"
                                : "none",
                              boxShadow: snapshot.isDragging
                                ? "0 0 .4rem #6666"
                                : "none",
                              borderRadius: "10px",
                            }}
                            secondaryAction={
                              isEditing ? (
                                <Tooltip title="Reorder">
                                  {/* <IconButton edge="end" {...provided.draggableProps}> */}
                                  <Menu />
                                  {/* </IconButton> */}
                                </Tooltip>
                              ) : null
                            }
                          >
                            <RowText item={item} isEditing={isEditing} />
                          </ListItem>
                          {index !== tasks.length - 1 ? (
                            <Divider variant="fullWidth" component="li" />
                          ) : null}
                        </>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {/* <ListItem>
              {isEditing ? (
                isAdding ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TextField
                      size="small"
                      variant="outlined"
                      label="Add New Task"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                    />

                    <IconButton onClick={addNewTask}>
                      <Save />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdding();
                      }}
                    >
                      <CancelPresentationRounded />
                    </IconButton>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleAdding}
                      startIcon={<Add />}
                    >
                      Add Task
                    </Button>
                  </div>
                )
              ) : null}
            </ListItem> */}
          </List>
        </Paper>
      </DragDropContext>
    </>
  );
}

export default Tasks;
