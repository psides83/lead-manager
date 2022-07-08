import React from "react";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { columns } from "./sales-data-grid-view-model";

export default function SalesDataGrid(props) {
  const { sales, selectedYear } = props

  return (
      <Paper
        elevation={4}
        sx={{
          borderRadius: "10px",
          height: "500px",
          minWidth: "380px",
          maxWidth: "550px",
          marginTop: "8px",
        }}
      >
        {sales.length > 0 && (
          <DataGrid
            rows={sales?.filter((sale) => {
              if (sale?.year === selectedYear) return sale;
              return null
            })}
            columns={columns}
            pageSize={12}
            rowsPerPageOptions={[12]}
            density="compact"
            hideFooterPagination
            hideFooter
          />
        )}
      </Paper>
  );
};
