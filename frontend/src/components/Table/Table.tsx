import type { ReactElement } from "react";

import styles from "./Table.module.css";

export interface ColumnProperty<T> {
  name: string;
  render(record: T): ReactElement | string | number | null;
  className?: string;
  orderingKey?: string;
  style?: React.CSSProperties;
}

interface TableProps<T> {
  rowKey: string | ((row: T) => string);
  data: T[];
  columns: ColumnProperty<T>[];
  onRowClick?: (record: T) => void;
  headerCellStyle?: React.CSSProperties;
}

interface RowProps<T> {
  row: T;
  columns: ColumnProperty<T>[];
  onRowClick?: (record: T) => void;
}

export interface IOrdering {
  key: string;
  direction: "asc" | "desc";
}

const getColumnCssClass = <T,>(column: ColumnProperty<T>) => {
  if (column.className) {
    return `${column.className} ${styles.cell}`;
  } else {
    return styles.cell;
  }
};

const getStyle = <T,>(column: ColumnProperty<T>) => {
  const style: React.CSSProperties = {};

  if (column.style) {
    return column.style;
  }

  return style;
};

const controlTagNames = ["A", "BUTTON"];

// This is used to prevent the onClick handler from triggering if the user clicks on a
// control element
const isChildOfControlElement = (node: HTMLElement): boolean => {
  if (controlTagNames.includes(node.tagName)) {
    return true;
  }

  if (node.tagName == "TD") {
    return false;
  }

  if (!node.parentElement) {
    return false;
  }

  return isChildOfControlElement(node.parentElement);
};

const TableRow = <RecordType,>({
  row,
  columns,
  onRowClick,
}: React.PropsWithChildren<RowProps<RecordType>>) => {
  const rowClass = onRowClick ? styles.clickableRow : styles.row;

  const handleClick = (evt: React.MouseEvent<HTMLTableRowElement>) => {
    if (isChildOfControlElement(evt.target as HTMLElement)) {
      return;
    }

    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <tr className={rowClass} onClick={handleClick}>
      {columns.map((col) => (
        <td
          key={col.name}
          className={getColumnCssClass(col)}
          style={getStyle(col)}
        >
          <span>{col.render(row)}</span>
        </td>
      ))}
    </tr>
  );
};

const Table = <T extends Record<string, unknown>>({
  rowKey,
  data,
  columns,
  onRowClick,
  headerCellStyle = {},
}: React.PropsWithChildren<TableProps<T>>) => {
  const rowKeyFunc =
    typeof rowKey === "function" ? rowKey : (row: T) => row[rowKey] as string;

  return (
    <table className={styles.root}>
      <thead>
        <tr className={styles.row}>
          {columns.map((col) => (
            <th key={col.name} className={styles.cell} style={headerCellStyle}>
              {col.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <TableRow<T>
            key={rowKeyFunc(row)}
            row={row}
            columns={columns}
            onRowClick={onRowClick}
          />
        ))}
      </tbody>
    </table>
  );
};

export default Table;
