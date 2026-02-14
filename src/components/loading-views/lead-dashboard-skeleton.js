import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
} from "@mui/material";

function LeadCardSkeleton() {
  return (
    <Card sx={{ height: 370, borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width="52%" height={40} />
            <Skeleton variant="rounded" width={132} height={24} />
          </Stack>
          <Skeleton variant="text" width="45%" />
          <Skeleton variant="rounded" width={84} height={26} />
          <Divider />
          <Skeleton variant="text" width="38%" />
          <Skeleton variant="rounded" width="100%" height={36} />
          <Skeleton variant="text" width="24%" />
          <Skeleton variant="rounded" width="100%" height={36} />
          <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
            <Skeleton variant="text" width={130} />
            <Skeleton variant="text" width={110} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function LeadDashboardSkeleton() {
  const placeholders = Array.from({ length: 6 });
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 380px)",
          md: "repeat(2, 380px)",
        },
        gap: 2,
        maxWidth: 800,
        mx: "auto",
        justifyContent: "center",
      }}
    >
      {placeholders.map((_, index) => (
        <LeadCardSkeleton key={index} />
      ))}
    </Box>
  );
}
