import type { AnchorHTMLAttributes, ReactNode } from "react";

export default function ExternalLink({
  children,
  className = "external-link",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a {...props} className={className} target="_blank" rel="noreferrer">
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
