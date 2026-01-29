import React from "react";
import { formatDateWithAbbreviatedMonth } from "../../utils/ganttTaskReactParser";
import { TASK_NAME_COLUMN_WIDTH } from "./TaskListHeaderWideName";

/**
 * Tabella task per il Gantt con date in formato abbreviato (es. 15 Dic 2025).
 * Prima colonna (nome task) più larga; seconda e terza (From/To) con mese abbreviato.
 */
const STYLES = {
  taskListWrapper: "_3ZbQT",
  taskListTableRow: "_34SS0",
  taskListCell: "_3lLk3",
  taskListNameWrapper: "_nI1Xw",
  taskListExpander: "_2QjE6",
  taskListEmptyExpander: "_2TfEi"
};

export const TaskListTableAbbrevDates = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  selectedTaskId,
  setSelectedTask,
  onExpanderClick
}) => {
  return (
    <div
      className={STYLES.taskListWrapper}
      style={{ fontFamily, fontSize }}
    >
      {tasks.map((t) => {
        let expanderSymbol = "";
        if (t.hideChildren === false) expanderSymbol = "▼";
        else if (t.hideChildren === true) expanderSymbol = "▶";

        return (
          <div
            className={STYLES.taskListTableRow}
            style={{ height: rowHeight }}
            key={t.id + "row"}
          >
            {/* Colonna 1: nome task (più larga) */}
            <div
              className={STYLES.taskListCell}
              style={{ minWidth: TASK_NAME_COLUMN_WIDTH, maxWidth: TASK_NAME_COLUMN_WIDTH }}
              title={t.name}
            >
              <div className={STYLES.taskListNameWrapper}>
                <div
                  className={
                    expanderSymbol ? STYLES.taskListExpander : STYLES.taskListEmptyExpander
                  }
                  onClick={() => onExpanderClick(t)}
                >
                  {expanderSymbol}
                </div>
                <div>{t.name}</div>
              </div>
            </div>
            {/* Colonna 2: data inizio (mese abbreviato) */}
            <div
              className={STYLES.taskListCell}
              style={{ minWidth: rowWidth, maxWidth: rowWidth }}
            >
              {"\u00A0"}
              {formatDateWithAbbreviatedMonth(t.start)}
            </div>
            {/* Colonna 3: data fine (mese abbreviato; usa endFormatted se presente per "ultimo giorno incluso") */}
            <div
              className={STYLES.taskListCell}
              style={{ minWidth: rowWidth, maxWidth: rowWidth }}
            >
              {"\u00A0"}
              {t.endFormatted ?? formatDateWithAbbreviatedMonth(t.end)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskListTableAbbrevDates;
