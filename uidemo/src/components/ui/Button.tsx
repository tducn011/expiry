import { ReactNode } from "react";
import Icon from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export default function Button({ children, variant = "primary", icon, onClick, type = "button", disabled, block }: { children: ReactNode; variant?: ButtonVariant; icon?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; block?: boolean }) {
  return <button type={type} className={`button ${variant} ${block ? "block" : ""}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} />}<span>{children}</span></button>;
}
