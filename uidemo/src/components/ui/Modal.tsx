import { ReactNode } from "react";
import Icon from "./Icon";

/**
 * Single dialog primitive. `size` picks width; `layout="form"` locks the body height
 * so forms never scroll. Header/footer are built in so every dialog shares them.
 */
export default function Modal({ eyebrow, title, description, onClose, footer, children, size = "regular", layout = "flow", dismissible = true }: {
  eyebrow?: string; title: string; description?: string; onClose: () => void; footer?: ReactNode; children?: ReactNode;
  size?: "compact" | "regular" | "wide"; layout?: "flow" | "form" | "list"; dismissible?: boolean;
}) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={dismissible ? onClose : undefined}>
    <section className={`modal ${size} layout-${layout}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={e => e.stopPropagation()}>
      <header className="modal-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{dismissible && <button type="button" className="icon-button" aria-label="Đóng" onClick={onClose}><Icon name="close" /></button>}</header>
      {children}
      {footer && <footer className="modal-footer">{footer}</footer>}
    </section>
  </div>;
}

/** Footer convention: secondary actions left, primary action last on the right. */
export function ModalActions({ start, end }: { start?: ReactNode; end: ReactNode }) {
  return <>{start}<span className="footer-spacer" />{end}</>;
}
