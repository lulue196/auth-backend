import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function loadUsers() {
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Cannot load users");
        return;
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleChangePassword(email) {
    setSelectedEmail(email);
    setNewPassword("");
    setOpen(true);
  }

  async function savePassword() {
    if (!newPassword.trim()) {
      alert("Please enter a new password");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/user/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: selectedEmail,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Password change failed");
        return;
      }

      alert("Password changed successfully");
      setOpen(false);
      setNewPassword("");
    } catch (error) {
      console.error(error);
      alert("Password change failed");
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        User Management
      </Typography>

      {users.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        users.map((user) => (
          <Card key={user._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">
                {user.name || user.email}
              </Typography>

              <Typography sx={{ mb: 2 }}>
                {user.email}
              </Typography>

              <Button
                variant="contained"
                onClick={() => handleChangePassword(user.email)}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            User: {selectedEmail}
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={savePassword}
          >
            Save Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}