interface SubmitButtonProps {
  isSubmitting: boolean;
  label?: string;
  submittingLabel?: string;
}

export function SubmitButton({
  isSubmitting,
  label = "Save Recipe",
  submittingLabel = "Saving…",
}: SubmitButtonProps) {
  return (
    <div className="pt-4 flex items-center gap-4">
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-8 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 bg-accent text-text-primary hover:bg-accent-light"
      >
        {isSubmitting ? submittingLabel : label}
      </button>
      {isSubmitting && (
        <p className="text-sm font-light text-accent-muted">
          Uploading images, this may take a moment…
        </p>
      )}
    </div>
  );
}
