import React from "react";
import { Box, Container, Paper, Skeleton, Stack } from "@mui/material";

export default function SalesDashboardSkeleton() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
      }}
    >
      <Skeleton variant="rounded" width={260} height={36} sx={{ mt: 1 }} />
      <Skeleton variant="rounded" width={260} height={36} sx={{ mt: 1 }} />

      <Stack spacing={1} sx={{ mt: 3, width: "100%", maxWidth: 500, alignItems: "center" }}>
        <Skeleton variant="text" width={180} height={42} />
        <Skeleton variant="text" width={220} />
      </Stack>

      <Paper sx={{ borderRadius: 2, width: "min(100%, 920px)", mt: 2, p: 1.5 }}>
        <Skeleton variant="rounded" height={260} />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Skeleton variant="text" width={130} />
          <Skeleton variant="text" width={130} />
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 2, width: "min(100%, 920px)", mt: 2, p: 1.5 }}>
        <Skeleton variant="rounded" height={300} />
      </Paper>
    </Container>
  );
}
