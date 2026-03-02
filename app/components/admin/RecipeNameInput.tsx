interface RecipeNameInputProps {
  defaultValue?: string;
}

export function RecipeNameInput({ defaultValue }: RecipeNameInputProps) {
  return (
    <div>
      <label
        htmlFor="name"
        className="block text-sm mb-2 text-text-body"
      >
        Recipe Name <span className="text-accent">*</span>
      </label>
      <input
        id="name"
        name="name"
        type="text"
        required
        defaultValue={defaultValue}
        placeholder="e.g. Chocolate Chip Cookies"
        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all bg-surface-raised border border-border text-text-body font-body focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
