export default function ProgressBar({
  value,
  max = 100,
  label,
  valueText,
  tone = "primary",
  size = "regular",
}: {
  value: number;
  max?: number;
  label?: string;
  valueText?: string;
  tone?: "primary" | "success" | "warning" | "danger";
  size?: "regular" | "compact";
}) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`progress-bar-container ${size}`}>
      {(label || valueText) && (
        <div className="progress-bar-labels">
          {label && <span className="progress-label">{label}</span>}
          <span className="progress-value">{valueText ?? `${percent}%`}</span>
        </div>
      )}
      <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div
          className={`progress-fill tone-${tone}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
