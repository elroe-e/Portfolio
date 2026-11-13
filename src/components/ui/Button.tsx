import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "./icons";

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: "solid" | "outline";
  icon?: ReactNode;
};

/** A pill-shaped link styled as a button, with an arrow that swaps on hover. */
export function ButtonLink({
  variant = "solid",
  icon,
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  const styles =
    variant === "solid"
      ? "bg-bone text-ink hover:bg-ember"
      : "border border-line bg-white/[0.03] text-bone hover:border-bone/60";

  return (
    <a
      className={`group/button inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-sm font-medium transition-colors duration-300 ${styles} ${className}`}
      {...props}
    >
      {children}
      <span
        className={`relative grid size-9 place-items-center overflow-hidden rounded-full ${
          variant === "solid" ? "bg-ink text-bone" : "bg-bone text-ink"
        }`}
      >
        <span className="transition-transform duration-500 ease-expo group-hover/button:-translate-y-[150%] group-hover/button:translate-x-[150%]">
          {icon ?? <ArrowUpRight className="size-4" />}
        </span>
        <span className="absolute -translate-x-[150%] translate-y-[150%] transition-transform duration-500 ease-expo group-hover/button:translate-x-0 group-hover/button:translate-y-0">
          {icon ?? <ArrowUpRight className="size-4" />}
        </span>
      </span>
    </a>
  );
}
