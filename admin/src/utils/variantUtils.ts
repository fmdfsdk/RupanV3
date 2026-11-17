import { ProductVariant, VariantStock } from '../types';

/** Generate a short unique ID */
export const uid = (): string => 'var_' + Math.random().toString(36).substring(2, 9);

/** Build or ensure complete variant stock map from variants array */
export const buildInitialVariantStock = (
  variants: ProductVariant[],
  existingStock?: VariantStock
): VariantStock => {
  const stock: VariantStock = existingStock ? JSON.parse(JSON.stringify(existingStock)) : {};

  variants.forEach((v) => {
    if (!stock[v.id]) {
      stock[v.id] = {};
    }
    v.options.forEach((o) => {
      if (!stock[v.id][o.value]) {
        stock[v.id][o.value] = { qty: 0, active: true };
      }
    });
  });

  return stock;
};

/** Compute extra price for the currently selected variant options */
export const computeExtraPrice = (
  variants: ProductVariant[] | undefined,
  selected: Record<string, string>
): number => {
  if (!variants || !Array.isArray(variants)) return 0;

  return variants.reduce((acc, v) => {
    const selectedVal = selected[v.id];
    if (!selectedVal) return acc;
    const opt = v.options.find((o) => o.value === selectedVal);
    return acc + (opt?.extraPrice || 0);
  }, 0);
};

/**
 * Detect product gender from category and name with high accuracy,
 * preserving women's items as 'Women', kids as 'Kids', men as 'Men', etc.
 */
export const detectProductGender = (
  category: string = '',
  name: string = '',
  existingGender?: string
): 'Men' | 'Women' | 'Couple' | 'Kids' | 'Accessories' => {
  const cat = (category || '').toLowerCase();
  const title = (name || '').toLowerCase();
  const text = `${cat} ${title}`;

  // 1. Kids check by category first
  if (cat.includes('kid')) return 'Kids';

  // 2. Couple/Combo check
  const isCouple = /(couple|combo)/i.test(text);
  if (isCouple) return 'Couple';

  // 3. Women check by category
  if (cat.includes('women') || cat.includes('female') || cat.includes('ladies')) return 'Women';

  // 4. Men check by category (if not women)
  if (cat.includes('men') && !cat.includes('women')) return 'Men';

  // 5. Title-based checks for ambiguous categories (like winter, fashion, clothing, etc.)
  const isFemale = /(women|female|saree|sari|three\s*piece|three-piece|kurti|kurtis|lehenga|salwar|kamiz|kameez|hijab|abaya|borqa|borkha|ladies|girl|bra|panties)/i.test(title);
  if (isFemale) return 'Women';

  const isKids = /(kids|baby|children|child|toddler|infant|boy\'s|girls\')/i.test(title);
  if (isKids) return 'Kids';

  const isMale = /(\bmen\b|\bmale\b|panjabi|punjabi|\bshirt\b|\bpolo\b|t-shirt|tshirt|\bboy\b|\bgents\b)/i.test(title);
  if (isMale) return 'Men';

  // 6. Non-clothing / tech / home categories should default to Accessories
  const isAccessoryCategory = /(gadget|electronic|home|lifestyle|gift|food|kitchen|living|decor|mug|speaker|watch|bottle|phone|cable|charger|cleaner|light|device|other)/i.test(cat);
  if (isAccessoryCategory) {
    return 'Accessories';
  }

  // 7. If existingGender is valid and not an unverified fallback
  if (existingGender && ['Women', 'Couple', 'Kids', 'Accessories'].includes(existingGender)) {
    return existingGender as any;
  }
  if (existingGender === 'Men' && !isAccessoryCategory) {
    return 'Men';
  }

  return 'Accessories';
};

/**
 * Safely resolves variants for a product.
 * If product already has structured variants, returns them.
 * Otherwise, synthesizes variant groups from legacy sizes and colors.
 */
export const resolveProductVariants = (product: any): ProductVariant[] => {
  if (!product) return [];

  let rawVariants = product.variants;
  if (typeof rawVariants === 'string') {
    try {
      rawVariants = JSON.parse(rawVariants);
    } catch (_) {
      rawVariants = null;
    }
  }

  // If variants is explicitly set as an array (even if empty []), respect it!
  // ONLY synthesize from legacy sizes/colors if variants is undefined or null (unmigrated product).
  if (Array.isArray(rawVariants)) {
    return rawVariants;
  }

  const synthesized: ProductVariant[] = [];

  // Synthesize from sizes
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  if (sizes.length > 0) {
    synthesized.push({
      id: 'var_size',
      title: 'Size',
      mandatory: false,
      options: sizes.map((s: any) => ({ value: String(s), extraPrice: 0 }))
    });
  }

  // Synthesize from colors
  const colors = Array.isArray(product.colors) ? product.colors : [];
  if (colors.length > 0) {
    const isAgeBased = colors.some((c: any) => /age/i.test(typeof c === 'string' ? c : c.name));
    synthesized.push({
      id: 'var_color',
      title: isAgeBased ? 'Age / Color' : 'Color',
      mandatory: false,
      options: colors.map((c: any) => ({
        value: typeof c === 'string' ? c : (c.name || 'Default'),
        extraPrice: 0
      }))
    });
  }

  return synthesized;
};
