import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { computeWinLossIntelligence } from "../../utils/win-loss-intelligence";

const listText = (items) => {
  if (!items || items.length === 0) {
    return "No data yet";
  }
  return items.map((item) => `${item.label} (${item.count})`).join(", ");
};

function WinLossIntelligence({ closedLeads }) {
  const metrics = computeWinLossIntelligence(closedLeads);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        gap: 1.5,
        mb: 2,
      }}
    >
      <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Top Loss Reasons</Typography>
          <Typography variant="body2" color="text.secondary">
            {listText(metrics.topLossReasons)}
          </Typography>
        </Stack>
      </Paper>
      <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Competitor Mentions</Typography>
          <Typography variant="body2" color="text.secondary">
            {listText(metrics.competitorMentions)}
          </Typography>
        </Stack>
      </Paper>
      <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Average Cycle Time</Typography>
          <Typography variant="body2" color="text.secondary">
            {metrics.avgCycleDays !== null
              ? `${metrics.avgCycleDays} days across ${metrics.closedCount} closed lead(s)`
              : "No cycle data yet"}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default WinLossIntelligence;
