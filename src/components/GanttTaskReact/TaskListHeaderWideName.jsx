import React from "react";

/**
 * Intestazione della tabella Gantt con prima colonna (Name) più larga.
 * Allineata a TaskListTableAbbrevDates che usa la stessa larghezza per il nome.
 */
const HEADER_STYLES = {
  ganttTable: "_3_ygE",
  ganttTable_Header: "_1nBOt",
  ganttTable_HeaderSeparator: "_2eZzQ",
  ganttTable_HeaderItem: "_WuQ0f"
};

/** Larghezza colonna nome task (prima colonna) */
export const TASK_NAME_COLUMN_WIDTH = "280px";

export const TaskListHeaderWideName = ({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth
}) => {
  return (
    <div
      className={HEADER_STYLES.ganttTable}
      style={{ fontFamily, fontSize }}
    >
      <div
        className={HEADER_STYLES.ganttTable_Header}
        style={{ height: headerHeight - 2 }}
      >
        <div
          className={HEADER_STYLES.ganttTable_HeaderItem}
          style={{ minWidth: TASK_NAME_COLUMN_WIDTH }}
        >
          {"\u00A0"}Name
        </div>
        <div
          className={HEADER_STYLES.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.2
          }}
        />
        <div
          className={HEADER_STYLES.ganttTable_HeaderItem}
          style={{ minWidth: rowWidth }}
        >
          {"\u00A0"}From
        </div>
        <div
          className={HEADER_STYLES.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.25
          }}
        />
        <div
          className={HEADER_STYLES.ganttTable_HeaderItem}
          style={{ minWidth: rowWidth }}
        >
          {"\u00A0"}To
        </div>
      </div>
    </div>
  );
};

export default TaskListHeaderWideName;
