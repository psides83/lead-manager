import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { NotificationsRounded } from "@mui/icons-material";
import { relativeTime } from "../../utils/utils";
import {
  markAllNotificationsRead,
  markNotificationRead,
  watchNotifications,
} from "../../services/notification-service";

export default function NotificationsMenu({ userId }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return () => {};
    }
    return watchNotifications({
      userId,
      onChange: setNotifications,
    });
  }, [userId]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item?.isRead).length,
    [notifications],
  );

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead({ userId, notifications });
  };

  const handleNotificationClick = async (item) => {
    if (!item?.id || item?.isRead) return;
    await markNotificationRead({ userId, notificationId: item.id });
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          size="large"
          color="inherit"
          aria-label="Open notifications"
          onClick={handleOpen}
        >
          <Badge
            badgeContent={unreadCount > 99 ? "99+" : unreadCount}
            color="error"
          >
            <NotificationsRounded />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: "92vw",
            maxHeight: 420,
            borderRadius: 2,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          <Button size="small" onClick={handleMarkAllRead} disabled={!unreadCount}>
            Mark all read
          </Button>
        </Stack>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                sx={{
                  alignItems: "flex-start",
                  py: 1.2,
                  px: 2,
                  bgcolor: item?.isRead ? "transparent" : "rgba(54,124,43,0.08)",
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: item?.isRead ? 500 : 700 }}>
                      {item?.title || "Notification"}
                    </Typography>
                  }
                  secondary={
                    <Stack spacing={0.25} sx={{ mt: 0.25 }}>
                      <Typography variant="caption" color="text.primary">
                        {item?.body || ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {relativeTime(item?.createdAt || "")}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}

