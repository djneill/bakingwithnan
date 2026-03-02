interface FileInputProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  currentKey?: string | null;
}

export function FileInput({
  name,
  label,
  required = false,
  hint,
  currentKey,
}: FileInputProps) {
  const hasExisting = Boolean(currentKey);

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm mb-2 text-text-body"
      >
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      {hint && (
        <p className="text-xs mb-2 font-light text-accent-muted">{hint}</p>
      )}

      {hasExisting && (
        <div className="mb-2 rounded-lg overflow-hidden w-24 h-24 bg-surface">
          <img
            src={`/api/images/${currentKey}`}
            alt="Current"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
      )}

      <label
        htmlFor={name}
        className="flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer transition-all border-2 border-dashed border-border bg-surface hover:border-accent hover:bg-surface-hover"
      >
        <span className="text-xl mb-1">{hasExisting ? "🔄" : "📷"}</span>
        <span className="text-xs font-light text-accent-muted">
          {hasExisting ? "Click to replace" : "Click to choose image"}
        </span>
        <input
          id={name}
          name={name}
          type="file"
          accept="image/*"
          className="sr-only"
          required={required}
          onChange={(e) => {
            const file = e.target.files?.[0];
            const span = e.target
              .closest("label")
              ?.querySelector("span:last-of-type");
            if (span) {
              span.textContent = file
                ? file.name
                : hasExisting
                  ? "Click to replace"
                  : "Click to choose image";
              (span as HTMLElement).style.color = file ? "#b58a66" : "#8b684e";
            }
          }}
        />
      </label>
    </div>
  );
}
