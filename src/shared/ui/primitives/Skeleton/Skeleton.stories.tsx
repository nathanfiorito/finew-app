import type { JSX } from "react";
import { Skeleton } from "./Skeleton.js";

export const Default = (): JSX.Element => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: 16,
      maxWidth: 320,
    }}
  >
    <Skeleton width={240} height={16} />
    <Skeleton variant="text" lines={3} />
    <Skeleton variant="circle" width={48} height={48} />
  </div>
);
