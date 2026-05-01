import type { JSX } from "react";
import { Table } from "./Table.js";
import { Money } from "../Money/Money.js";

interface Row {
  id: string;
  date: string;
  description: string;
  amount: number;
}

const data: Row[] = [
  {
    id: "1",
    date: "2026-04-28",
    description: "Mercado Extra",
    amount: -187.5,
  },
  { id: "2", date: "2026-04-27", description: "Salário", amount: 6800 },
  { id: "3", date: "2026-04-26", description: "Uber", amount: -34.9 },
  {
    id: "4",
    date: "2026-04-25",
    description: "Netflix",
    amount: -55.9,
  },
];

export const Default = (): JSX.Element => (
  <div style={{ padding: 16 }}>
    <Table
      aria-label="Transações recentes"
      data={data}
      rowKey={(r) => r.id}
      columns={[
        {
          id: "date",
          header: "Data",
          accessor: (r) => r.date,
          sortable: true,
        },
        {
          id: "description",
          header: "Descrição",
          accessor: (r) => r.description,
        },
        {
          id: "amount",
          header: "Valor",
          accessor: (r) => r.amount,
          align: "right",
          cell: (r) => <Money amount={r.amount} sign="always" />,
        },
      ]}
    />
  </div>
);
