# Sales Data Sync (Google Sheets)

This app now supports direct sales-data fetch from Google Sheets, with fallback to the legacy GitHub JSON.

## One-time setup

1. Put monthly sales in a Google Sheet tab with these columns (header row):
   - `id` (optional, app can derive)
   - `date` (`YYYY-MM`)
   - `month` (`01`-`12`)
   - `year` (`YYYY`)
   - `sales`
   - `margin`
   - `commission`
   - `bonus`
2. Publish the sheet so it can be read by the app:
   - Google Sheets -> `File` -> `Share` -> `Publish to web`
   - Publish the specific tab you use for sales.
3. In your `.env`, add:

```env
REACT_APP_SALES_SHEET_ID="your_google_sheet_id"
REACT_APP_SALES_SHEET_NAME="salesByMonth"
REACT_APP_SALES_SHEET_GID="0"
```

Notes:
- `REACT_APP_SALES_SHEET_ID` accepts:
  - spreadsheet ID (`/d/<id>/...`)
  - published key (`2PACX-...`)
  - full Google Sheets URL
- `REACT_APP_SALES_SHEET_GID` is optional but recommended for published sheets.
- Fetch behavior:
  - normal spreadsheet ID -> uses Google `gviz` JSON endpoint
  - published key (`2PACX-...`) -> uses published CSV endpoint (`/pub?output=csv`)
- If `REACT_APP_SALES_SHEET_ID` is missing or the sheet is unavailable, app automatically falls back to:
  - `https://psides83.github.io/listJSON/salesByMonth.json`

## Workflow after setup

1. Paste fresh data into the Google Sheet tab.
2. Save.
3. Reload the Sales page in app.

The Sales page now shows:
- data source (`Google Sheets` or `Legacy JSON`)
- last sync time
