import { Form, useNavigation } from "react-router";

export function DeleteButton({ slug, name }: { slug: string; name: string }) {
  const navigation = useNavigation();
  const isDeleting =
    navigation.state === "submitting" &&
    navigation.formData?.get("slug") === slug &&
    navigation.formData?.get("intent") === "delete";

  return (
    <Form
      method="post"
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="intent" value="delete" />
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={isDeleting}
        className="text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 bg-danger-bg text-danger border border-danger-border hover:bg-danger-border"
      >
        {isDeleting ? "Deleting…" : "Delete"}
      </button>
    </Form>
  );
}
