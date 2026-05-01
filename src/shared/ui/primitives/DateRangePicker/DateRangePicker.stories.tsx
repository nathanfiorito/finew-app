import { useState, type JSX } from "react";
import { DateRangePicker, type DateRange } from "./DateRangePicker.js";

export const Default = (): JSX.Element => {
  const [range, setRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  return (
    <div style={{ padding: 16, maxWidth: 320 }}>
      <DateRangePicker value={range} onChange={setRange} />
    </div>
  );
};
