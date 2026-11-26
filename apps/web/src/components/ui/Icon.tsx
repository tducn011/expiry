import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Clock,
  Ellipsis,
  Globe,
  History,
  Leaf,
  Lightbulb,
  Milk,
  Package,
  Plus,
  ScanBarcode,
  Search,
  Settings,
  Timer,
  Trash2,
  X,
  type LucideIcon,
  type LucideProps,
} from "lucide-react"

// Keep the existing string-based Button/Shell API; every drawing comes from Lucide.
const icons = {
  globe: Globe,
  lightbulb: Lightbulb,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  calendar: Calendar,
  bottle: Milk,
  leaf: Leaf,
  box: Package,
  clock: Clock,
  plus: Plus,
  "scan-barcode": ScanBarcode,
  search: Search,
  settings: Settings,
  trash: Trash2,
  back: ChevronLeft,
  more: Ellipsis,
  arrow: ArrowRight,
  close: X,
  history: History,
  check: Check,
  alert: CircleAlert,
  help: CircleHelp,
  timer: Timer,
} satisfies Record<string, LucideIcon>

export default function Icon({
  name,
  size = 18,
  className = "icon",
  ...props
}: LucideProps & { name: string }) {
  const Component = Object.prototype.hasOwnProperty.call(icons, name)
    ? icons[(name as keyof typeof icons)]
    : null
  return Component ? (
    <Component
      size={size}
      className={className}
      aria-hidden="true"
      {...props}
    />
  ) : null
}
