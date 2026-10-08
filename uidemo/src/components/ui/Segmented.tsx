export default function Segmented<T extends string>({ options, value, onChange, size = "regular" }: { options: Record<T, string>; value: T; onChange: (value: T) => void; size?: "regular" | "compact" }) {
  return <div className={`segmented ${size}`} role="group">{(Object.keys(options) as T[]).map(key => <button type="button" key={key} aria-pressed={value === key} className={value === key ? "active" : ""} onClick={() => onChange(key)}>{options[key]}</button>)}</div>;
}
