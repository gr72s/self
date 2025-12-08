import * as React from "react";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";

interface BasicTableProps<T> {
  columns: (keyof T)[],
  rows: T[],
}

export default function BasicTable<T extends { id?: number }>({columns, rows}: BasicTableProps<T>) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) =>
              (<TableCell key={String(column)} align={index === 0 ? "left" : "right"}>{String(column)}</TableCell>))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0
            ? <TableRow>
              <TableCell colSpan={columns.length} align="center">No data available</TableCell>
            </TableRow>
            : rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map(column => <TableCell key={String(column)}>
                  {row[column] as React.ReactNode}
                </TableCell>)}
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}