import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded,
  CheckCircleRounded,
  RadioButtonUncheckedRounded,
} from "@mui/icons-material";
import { db } from "../../services/firebase";
import { relativeTime } from "../../utils/utils";
import { sortTasksByFollowUpPriority } from "../../utils/task-sort";
import EditLead from "./edit-lead/edit-lead";
import EquipmentForm from "./equipment-form/equipment-form";

const sectionTitleSx = { fontWeight: 700, mb: 1 };

const hasValue = (value) =>
  value !== undefined &&
  value !== null &&
  !(typeof value === "string" && value.trim() === "");

const formatBool = (value) => (value ? "Yes" : "No");

export default function LeadDetailPage() {
  const { leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingLead, setLoadingLead] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [message, setMessage] = useState("");
  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  useEffect(() => {
    if (!leadId) {
      setLoadingLead(false);
      return () => {};
    }

    const unsubscribe = onSnapshot(
      doc(db, "leads", leadId),
      (snapshot) => {
        setLead(
          snapshot.exists()
            ? { id: snapshot.id, ...snapshot.data() }
            : null
        );
        setLoadingLead(false);
      },
      () => {
        setLoadingLead(false);
      }
    );

    return () => unsubscribe?.();
  }, [leadId]);

  useEffect(() => {
    if (!leadId) {
      setLoadingTasks(false);
      return () => {};
    }

    const tasksQuery = query(
      collection(db, "tasks"),
      where("leadID", "==", leadId)
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const mappedTasks = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setTasks(sortTasksByFollowUpPriority(mappedTasks));
        setLoadingTasks(false);
      },
      () => {
        setLoadingTasks(false);
      }
    );

    return () => unsubscribe?.();
  }, [leadId]);

  const openTasks = useMemo(
    () => tasks.filter((task) => !task?.isComplete),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((task) => Boolean(task?.isComplete)),
    [tasks]
  );

  const loading = loadingLead || loadingTasks;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack alignItems="center" sx={{ mt: 8 }}>
          <CircularProgress color="primary" />
        </Stack>
      </Container>
    );
  }

  if (!lead) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Lead not found</Typography>
            <Typography color="text.secondary">
              This lead may have been deleted or you may not have access.
            </Typography>
            <Box>
              <Button
                component={RouterLink}
                to="/"
                startIcon={<ArrowBackRounded />}
                variant="outlined"
              >
                Back to Dashboard
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackRounded />}
            variant="outlined"
          >
            Back
          </Button>
          <EditLead
            lead={lead}
            setMessage={setMessage}
            setOpenError={setOpenError}
            setOpenSuccess={setOpenSuccess}
          />
        </Stack>

        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Stack spacing={1}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
            >
              <Typography variant="h4" sx={{ overflowWrap: "anywhere" }}>
                {lead?.name}
              </Typography>
              <Chip
                size="small"
                label={lead?.status || "Unknown"}
                color={lead?.status === "Closed" ? "default" : "success"}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Created {hasValue(lead?.timestamp) ? lead.timestamp : "Unknown"}{" "}
              {lead?.changeLog?.[0]?.timestamp
                ? `• Updated ${relativeTime(lead.changeLog[0].timestamp)}`
                : ""}
            </Typography>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
            <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle1" sx={sectionTitleSx}>
                Contact Info
              </Typography>
              <Stack spacing={0.75}>
                {hasValue(lead?.phone) ? (
                  <Typography variant="body2">
                    <strong>Phone:</strong> {lead.phone}
                  </Typography>
                ) : null}
                {hasValue(lead?.email) ? (
                  <Typography variant="body2">
                    <strong>Email:</strong>{" "}
                    <Link href={`mailto:${lead.email}`}>{lead.email}</Link>
                  </Typography>
                ) : null}
                {hasValue(lead?.quoteLink) ? (
                  <Typography variant="body2">
                    <strong>Quote Link:</strong>{" "}
                    <Link href={lead.quoteLink} target="_blank" rel="noreferrer">
                      Open Quote
                    </Link>
                  </Typography>
                ) : null}
                {!hasValue(lead?.phone) && !hasValue(lead?.email) && !hasValue(lead?.quoteLink) ? (
                  <Typography variant="body2" color="text.secondary">
                    No contact details provided.
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle1" sx={sectionTitleSx}>
                Opportunity Details
              </Typography>
              <Stack spacing={0.75}>
                <Typography variant="body2">
                  <strong>Will Finance:</strong> {formatBool(lead?.willFinance)}
                </Typography>
                <Typography variant="body2">
                  <strong>Has Trade:</strong> {formatBool(lead?.hasTrade)}
                </Typography>
                <Typography variant="body2">
                  <strong>Will Purchase:</strong> {formatBool(lead?.willPurchase)}
                </Typography>
                {hasValue(lead?.notes) ? (
                  <>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="body2">
                      <strong>Notes:</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {lead.notes}
                    </Typography>
                  </>
                ) : null}
              </Stack>
            </Paper>
          </Grid>

          {lead?.status === "Closed" ? (
            <Grid size={12}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={sectionTitleSx}>
                  Close Details
                </Typography>
                <Grid container spacing={1.5}>
                  {hasValue(lead?.closeOutcome) ? (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Outcome:</strong> {lead.closeOutcome}
                      </Typography>
                    </Grid>
                  ) : null}
                  {hasValue(lead?.closeReason) ? (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Reason:</strong> {lead.closeReason}
                      </Typography>
                    </Grid>
                  ) : null}
                  {hasValue(lead?.closeCompetitor) ? (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Competitor:</strong> {lead.closeCompetitor}
                      </Typography>
                    </Grid>
                  ) : null}
                  {hasValue(lead?.closeCycleDays) ? (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Cycle Time:</strong> {lead.closeCycleDays} days
                      </Typography>
                    </Grid>
                  ) : null}
                  {hasValue(lead?.closeNotes) ? (
                    <Grid size={12}>
                      <Typography variant="body2" sx={{ mb: 0.25 }}>
                        <strong>Close Notes:</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      >
                        {lead.closeNotes}
                      </Typography>
                    </Grid>
                  ) : null}
                </Grid>
              </Paper>
            </Grid>
          ) : null}

          <Grid size={12}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={sectionTitleSx}>
                Equipment
              </Typography>
              {Array.isArray(lead?.equipment) && lead.equipment.length > 0 ? (
                <Stack spacing={1}>
                  {lead.equipment.map((unit) => (
                    <Paper key={unit?.id || unit?.stock || unit?.model} variant="outlined" sx={{ p: 1.25 }}>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {unit?.model || "Unnamed Equipment"}
                          </Typography>
                          <EquipmentForm
                            iconButton
                            equipment={unit}
                            lead={lead}
                            setMessage={setMessage}
                            setOpenError={setOpenError}
                            setOpenSuccess={setOpenSuccess}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {hasValue(unit?.stock) ? `Stock: ${unit.stock}` : ""}
                          {hasValue(unit?.stock) && hasValue(unit?.serial) ? " • " : ""}
                          {hasValue(unit?.serial) ? `Serial: ${unit.serial}` : ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {unit?.status || "No status"} • {unit?.availability || "Availability Unknown"}
                        </Typography>
                        {hasValue(unit?.quotePrice) ? (
                          <Typography variant="caption" color="text.secondary">
                            {`Quote: $${Number(unit.quotePrice).toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}`}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No equipment added.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle1" sx={sectionTitleSx}>
                Open Tasks ({openTasks.length})
              </Typography>
              {openTasks.length > 0 ? (
                <Stack spacing={0.75}>
                  {openTasks.map((task) => (
                    <Stack key={task?.id} direction="row" spacing={1} alignItems="flex-start">
                      <RadioButtonUncheckedRounded color="disabled" sx={{ mt: "2px", fontSize: 18 }} />
                      <Stack spacing={0.15}>
                        <Typography variant="body2">{task?.task}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task?.dueUnix
                            ? Number(task.dueUnix) < Date.now()
                              ? "Overdue"
                              : "Upcoming"
                            : "No due date"}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No open tasks.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle1" sx={sectionTitleSx}>
                Completed Tasks ({completedTasks.length})
              </Typography>
              {completedTasks.length > 0 ? (
                <Stack spacing={0.75}>
                  {completedTasks.map((task) => (
                    <Stack key={task?.id} direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleRounded color="success" sx={{ mt: "2px", fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary">
                        {task?.task}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No completed tasks.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={12}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={sectionTitleSx}>
                Activity
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Status / Lead Changes
                  </Typography>
                  <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                    {(lead?.changeLog || []).slice(0, 12).map((entry) => (
                      <Typography key={entry?.id} variant="body2" color="text.secondary">
                        {entry?.change}
                      </Typography>
                    ))}
                    {!lead?.changeLog?.length ? (
                      <Typography variant="body2" color="text.secondary">
                        No change history.
                      </Typography>
                    ) : null}
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Contact History
                  </Typography>
                  <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                    {(lead?.contactLog || []).slice(0, 12).map((entry) => (
                      <Typography key={entry?.id} variant="body2" color="text.secondary">
                        {entry?.change}
                      </Typography>
                    ))}
                    {!lead?.contactLog?.length ? (
                      <Typography variant="body2" color="text.secondary">
                        No contact history.
                      </Typography>
                    ) : null}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {openError ? (
          <Alert severity="error" onClose={() => setOpenError(false)}>
            {message || "Unable to complete request"}
          </Alert>
        ) : null}
        {openSuccess ? (
          <Alert severity="success" onClose={() => setOpenSuccess(false)}>
            {message || "Saved"}
          </Alert>
        ) : null}
      </Stack>
    </Container>
  );
}
