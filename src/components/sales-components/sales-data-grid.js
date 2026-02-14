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
          borderRadius: 2,
          height: 500,
          width: "min(100%, 920px)",
          mt: 1,
        }}
      >
        {sales.length > 0 && (
          <DataGrid
            rows={sales?.filter((sale) => {
              if (sale?.year === selectedYear) return sale;
              return null
            })}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 12, page: 0 },
              },
            }}
            pageSizeOptions={[12]}
            density="compact"
            showToolbar
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 300 },
              },
            }}
            disableRowSelectionOnClick
          />
        )}
      </Paper>
  );
};
