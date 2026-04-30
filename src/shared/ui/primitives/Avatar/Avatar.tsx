import type { HTMLAttributes, ForwardedRef, JSX } from "react";
import { forwardRef } from "react";
import "./Avatar.css";

export type AvatarSize = "sm" | "md" | "lg";
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials?: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
}

function AvatarImpl(
  { initials, src, alt, size = "md", className, ...rest }: AvatarProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const classes = ["fw-avatar", `fw-avatar-${size}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span ref={ref} className={classes} {...rest}>
      {src ? (
        <img src={src} alt={alt ?? ""} />
      ) : initials ? (
        initials.slice(0, 2).toUpperCase()
      ) : null}
    </span>
  );
}

export const Avatar = forwardRef(AvatarImpl);
Avatar.displayName = "Avatar";
