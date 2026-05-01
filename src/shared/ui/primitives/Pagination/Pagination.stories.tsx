import { useState, type JSX } from "react";
import { Pagination } from "./Pagination.js";

export const Default = (): JSX.Element => {
  const [page, setPage] = useState(3);
  return (
    <div style={{ padding: 16 }}>
      <Pagination page={page} pageCount={12} onPageChange={setPage} />
    </div>
  );
};
