import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode, MouseEvent as ReactMouseEvent } from "react";
import { Button } from "@termbridge/ui";
import { Check } from "lucide-react";

type SheetTriggerButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, "children"> & {
  label: string;
  icon: ReactNode;
};

export const SheetTriggerButton = forwardRef<HTMLButtonElement, SheetTriggerButtonProps>(
  ({ label, icon, className, type, variant = "secondary", size = "icon", "aria-label": ariaLabel, ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        type={type ?? "button"}
        variant={variant}
        size={size}
        aria-label={ariaLabel ?? label}
        className={`h-11 w-11 rounded-full bg-input/50 ${className ?? ""}`.trim()}
        {...rest}
      >
        {icon}
      </Button>
    );
  }
);
SheetTriggerButton.displayName = "SheetTriggerButton";

type SheetHeaderProps = {
  eyebrow: string;
  title: string;
  countLabel?: string | null;
};

export const SheetHeader = ({ eyebrow, title, countLabel }: SheetHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-1 pb-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground">{eyebrow}</p>
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      {countLabel ? <span className="text-xs text-muted-foreground">{countLabel}</span> : null}
    </div>
  );
};

type SheetListProps = {
  children: ReactNode;
};

export const SheetList = ({ children }: SheetListProps) => {
  return <div className="no-scrollbar max-h-[min(55vh,360px)] space-y-2 overflow-y-auto px-1">{children}</div>;
};

type SheetStatusMessageProps = {
  message: string;
};

export const SheetStatusMessage = ({ message }: SheetStatusMessageProps) => {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
      {message}
    </div>
  );
};

type SheetOptionButtonProps = {
  label: string;
  description?: string;
  active?: boolean;
  onSelect?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
  ariaLabel?: string;
  showActiveIcon?: boolean;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

export const SheetOptionButton = forwardRef<HTMLButtonElement, SheetOptionButtonProps>(
  (
    {
      label,
      description,
      active = false,
      onSelect,
      leading,
      trailing,
      ariaLabel,
      showActiveIcon = true,
      onClick,
      type,
      className,
      ...rest
    },
    ref
  ) => {
    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onSelect?.();
    };

    const trailingNode =
      trailing ?? (showActiveIcon && active ? (
        <span className="flex h-8 w-8 items-center justify-center text-primary">
          <Check className="size-6" aria-hidden="true" />
        </span>
      ) : null);

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        aria-label={ariaLabel ?? label}
        aria-current={active ? "page" : undefined}
        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
          active
            ? "border-primary/60 bg-primary/10 text-foreground"
            : "border-transparent bg-background/70 text-foreground hover:bg-background/90"
        } ${className ?? ""}`.trim()}
        onClick={handleClick}
        {...rest}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {leading ? (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 text-foreground">
                {leading}
              </span>
            ) : null}
            <div className="min-w-0">
              <span className="text-sm font-medium">{label}</span>
              {description ? (
                <div className="pt-1 text-xs text-muted-foreground">{description}</div>
              ) : null}
            </div>
          </div>
          {trailingNode}
        </div>
      </button>
    );
  }
);
SheetOptionButton.displayName = "SheetOptionButton";
