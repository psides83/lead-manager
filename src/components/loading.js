import { Box, CircularProgress } from "@mui/material";
import React from "react";

function Loading() {
  return (
    <Box
      sx={{
        // position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#e3e8e8",
        zIndex: 100,
      }}
    >
      <CircularProgress
        sx={{ position: "absolute", top: "50%", left: "50%", zIndex: 200 }}
      />
    </Box>
  );
}

export default Loading;
