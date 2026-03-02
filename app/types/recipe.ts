export interface Recipe {
  id: number;
  slug: string;
  name: string;
  dish_image: string | null;
  card_image1: string | null;
  card_image2: string | null;
  card_image3: string | null;
  card_image4: string | null;
  created_at: string;
}

/** Subset used on the home page grid */
export type RecipeSummary = Pick<
  Recipe,
  "id" | "slug" | "name" | "dish_image" | "created_at"
>;
