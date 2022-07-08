import { Alert, Snackbar } from '@mui/material'
import React from 'react'

function DynamicSnackbar(props) {
    const { openSuccess, handleClose, message, openError } = props;
  return (
    <>
    <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openError}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default DynamicSnackbar