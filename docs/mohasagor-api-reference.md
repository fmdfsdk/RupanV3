# Mohasagor Wholesale Reseller API — Complete Architecture & Integration Reference

This document serves as the permanent single-source-of-truth for how the Mohasagor Reseller API operates, its exact response schemas, rate limits, and how Rupan V3 maps, synchronizes, and presents these products without system crashes or data regressions.

---

## 1. Authentication & API Specifications

- **Base URL**: `https://mohasagor.com.bd/api/reseller/product`
- **Method**: `GET`
- **Rate Limit**: **Maximum 5 requests per minute** (Strictly enforced by Cloudflare / API Gateway).
  - Exceeding rate limit triggers `HTTP 429: Too Many Requests` with `{"retry_after": N}`.
  - When batch-syncing multiple pages, the client **must throttle** requests with a minimum 12–15 second sleep between consecutive page calls.
- **Headers**:
  ```http
  api-key: A8niclztH9JtzS4t
  secret-key: 2ff380917a11d3a7c97bcf6dddfb8adf38194c7d6b726ab12c4d0d5fb136fef8
  ```
- **Pagination Query**:
  - `?page=N` (Starts at `1`).
  - Response headers/body contain `current_page` and `last_page`.
  - Always stop when `page >= last_page`.
  - **Dynamic Catalog Size (CRITICAL)**: The total number of products (`total`) and pages (`last_page`) in Mohasagor is **NOT fixed**. It increases or decreases at any time as new products are published, restocked, or discontinued upstream. Never hardcode numbers like `3181`, `2747`, or `64`. The sync loop must always dynamically read `result.last_page` and `result.total` from each live response envelope.
  - **Note on Page Size**: While Mohasagor docs mention 200/page, the live server serves `per_page: 50` (approx 64 pages for ~3,200 products).

---

## 2. Top-Level Response Envelope

```json
{
  "status": 200,
  "current_page": 1,
  "last_page": 64,
  "per_page": 50,
  "total": 3181,
  "products": [ ... ]
}
```

---

## 3. Product Object Schema & Types

| Field | Type | Description | Example / Handling |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Unique numeric Mohasagor product ID | `14` (Mapped to Rupan DB as `mohasagor-14`) |
| `name` | `string` | Full title of the product | `"X01 Full Charge Separator – Type-C..."` |
| `product_code` | `number \| string` | Reseller product code / SKU suffix | `3002` (Mapped to Rupan SKU: `MOHASAGOR-3002`) |
| `category` | `string` | Category name from Mohasagor | `"Gadgets & Electronics"`, `"Men's Fashion"` |
| `thumbnail_img` | `string` | Absolute URL to the primary image | `"https://mohasagor.com.bd/public/storage/images/products/..."` |
| `slug` | `string` | Suggested URL slug | `"mens-winter-hoodie-3002"` |
| `price` | `number` | **Maximum Retail Price (MSRP)** / Regular price | `690` (Used as strikethrough retail anchor) |
| `sale_price` | `number` | **Wholesale Reseller Cost** (Purchase Price) | `490` (Wholesale base cost before margin) |
| `details` | `string` | Raw HTML / plain text product description | Bengali or English specs & features |
| `status` | `string` | Listing status | `"active"` or `"inactive"` |
| `stock_status` | `string` | Stock indicator | `"available"`, `"out_of_stock"`, or `""` |
| `stock` | `number` | Numerical stock available | `0`, `5`, `65` (If `<= 0`, marked out-of-stock) |
| `video_url` | `string \| null` | Product demonstration video link | YouTube or MP4 link |
| `product_variants` | `array` | Flat list of attribute-value pairs | See details below |
| `product_images` | `array` | Gallery image objects | `[{ "id": 11, "product_image": "https://..." }]` |

---

## 4. How Mohasagor Handles Variants & Missing Fields

### A. Variant Structure in API
Mohasagor returns variants in a flat key-value list under `product_variants`:
```json
"product_variants": [
  { "id": 33523, "product_id": 14, "attribute": "Color", "variant": "White" },
  { "id": 33524, "product_id": 14, "attribute": "Color", "variant": "Blue" },
  { "id": 33527, "product_id": 20, "attribute": "Size", "variant": "M" },
  { "id": 33528, "product_id": 20, "attribute": "Size", "variant": "L" }
]
```

### B. What Mohasagor Does NOT Provide (Crucial Architectural Reality)
1. **NO Variant-Specific Extra Prices**:
   - In Mohasagor, every variant option shares the exact same `price` and `sale_price`.
   - Rupan's custom variant system supports `extraPrice` per option (e.g. `XL +50 Tk`), which is configured in Rupan's Admin Panel.
2. **NO Variant-Specific Stock**:
   - Mohasagor only provides an overall integer `stock`. It does not report stock per color or per size.
   - When Rupan syncs from Mohasagor, the overall product stock is assigned. In the Admin Panel, the merchant can activate "Maintain variant wise stock" if granular control is needed.
3. **NO Variant-To-Image Mapping**:
   - `product_images` is an unmapped array of gallery pictures.
   - The Rupan Admin Panel provides the "Setup Variant Image" modal to map specific images to colors/sizes.
4. **NO Gender Field**:
   - Mohasagor **does not have a gender attribute** in its API.
   - All gender assignment must be resolved dynamically by Rupan's `detectProductGender` utility.

---

## 5. Gender Resolution Engine (`detectProductGender`)

Because Mohasagor does not return gender, Rupan uses an automated rule-based resolution engine:

```ts
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

  // 5. Title-based checks for ambiguous categories (Winter, Ethnic, etc.)
  const isFemale = /(women|female|saree|sari|three\s*piece|three-piece|kurti|kurtis|lehenga|salwar|kamiz|kameez|hijab|abaya|borqa|borkha|ladies|girl|bra|panties)/i.test(title);
  if (isFemale) return 'Women';

  const isKids = /(kids|baby|children|child|toddler|infant|boy\'s|girls\')/i.test(title);
  if (isKids) return 'Kids';

  const isMale = /(\bmen\b|\bmale\b|panjabi|punjabi|\bshirt\b|\bpolo\b|t-shirt|tshirt|\bboy\b|\bgents\b)/i.test(title);
  if (isMale) return 'Men';

  // 6. Non-clothing / tech / home categories default to Accessories
  const isAccessoryCategory = /(gadget|electronic|home|lifestyle|gift|food|kitchen|living|decor|mug|speaker|watch|bottle|phone|cable|charger|cleaner|light|device|other)/i.test(cat);
  if (isAccessoryCategory) {
    return 'Accessories';
  }

  // 7. Retain validated existing manual gender
  if (existingGender && ['Women', 'Couple', 'Kids', 'Accessories'].includes(existingGender)) {
    return existingGender as any;
  }
  if (existingGender === 'Men' && !isAccessoryCategory) {
    return 'Men';
  }

  return 'Accessories';
};
```

---

## 6. Sizing & Non-Sized Item Integrity Rules

- **Never inject artificial `['M', 'L', 'XL']` sizes** into products where the API returned no `attribute === 'Size'`.
- Items such as **Sarees, Jewelry sets, Rings, Bangles, Bed Sheets, Gadgets, and Home Decor** must have `sizes: []`.
- The storefront UI (`ProductDetail.tsx` and `QuickViewModal.tsx`) checks `productSizes.length > 0` before rendering any size selector or sizing guide modal.

---

## 7. Pricing & Margin Calculation Formula

When syncing a product from Mohasagor:

1. **Price Difference ($X$)**:
   $$\text{diffX} = \max(0, \text{regularMSRP} - \text{wholesaleCost})$$
2. **Floor / Base Website Price**:
   $$\text{websiteFinalPrice} = \text{round}\left(\text{regularMSRP} - \left(\frac{\text{deductionPercentage}}{100}\right) \times \text{diffX}\right)$$
3. **Selling Price (with Margin)**:
   - Percentage Margin:
     $$\text{marginAmount} = \text{round}\left(\text{websiteFinalPrice} \times \frac{\text{marginVal}}{100}\right)$$
   - Fixed Margin:
     $$\text{marginAmount} = \text{marginVal}$$
   - Final Selling Price:
     $$\text{sellingPrice} = \text{websiteFinalPrice} + \text{marginAmount}$$
4. **Strikethrough Presentation**:
   - If $\text{regularMSRP} > \text{sellingPrice}$:
     - `price`: $\text{regularMSRP}$
     - `discount_price`: $\text{sellingPrice}$
   - Else:
     - `price`: $\text{sellingPrice}$
     - `discount_price`: `null`

---

## 8. Summary for Future Maintenance & AI Agents

1. **No Breaking Schema**: Rupan's Supabase schema has additive columns (`variants`, `variant_stock`, `variant_images`) alongside backward-compatible columns (`colors`, `sizes`). Any sync script must populate `colors` and `sizes` alongside `variants`.
2. **Rate Limit Throttling**: Never run concurrent sync calls against Mohasagor without respecting the 5 req/min threshold.
3. **Gender Safety**: Do not revert to `gender: 'Men'` hardcoding. Always invoke `detectProductGender(category, name)`.
4. **Size Safety**: Do not insert default sizes when `product_variants` does not contain `"Size"`.
5. **Dynamic Catalog Size & Pagination**: Neither the product count nor the total pages (`last_page`) are fixed. Products are added or archived on Mohasagor on a daily basis. Any sync loop must read `last_page` dynamically from every response envelope and terminate when `page >= last_page` or when a page returns an empty products array (`products: []`).
