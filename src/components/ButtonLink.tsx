import { NavLink } from "react-router";
import type { ReactNode } from "react";

export default function ButtonLink({
  to,
  children,
  variant = "primary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <NavLink className={`button-link button-link--${variant}`} to={to}>
      {children}
    </NavLink>
  );
}
