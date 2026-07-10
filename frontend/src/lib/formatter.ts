/**
 * Helper to parse a markdown-like description string (with asterisks, bullet points, emoji headings)
 * into semantic, styled HTML tags.
 */
export const formatDescriptionToHtml = (desc: string): string => {
  if (!desc) return '';

  // 1. First convert *bold* text to strong tag
  let formatted = desc.replace(/\*([^*]+)\*/g, '<strong class="font-extrabold text-gray-900">$1</strong>');

  // 2. Split by newline to parse structure line-by-line
  const lines = formatted.split('\n');
  const parsedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      return '<div class="h-2"></div>'; // Spacing line
    }

    // 3. Bullet points starting with '-' or '•'
    if (trimmed.startsWith('-')) {
      return `<div class="flex items-start gap-2 pl-4 py-0.5 text-gray-600"><span class="text-[#ff5c00] font-black shrink-0">•</span><span>${trimmed.substring(1).trim()}</span></div>`;
    }
    if (trimmed.startsWith('•')) {
      return `<div class="flex items-start gap-2 pl-4 py-0.5 text-gray-600"><span class="text-[#ff5c00] font-black shrink-0">•</span><span>${trimmed.substring(1).trim()}</span></div>`;
    }

    // 4. Section headers starting with '👉'
    if (trimmed.startsWith('👉')) {
      return `<div class="font-black text-gray-800 my-2 pt-2 flex items-center gap-1.5">${trimmed}</div>`;
    }
    
    // 5. Titles starting with '👕' or other similar emojis
    if (trimmed.startsWith('👕')) {
      return `<div class="font-black text-gray-900 text-base my-3 border-b border-gray-100 pb-2">${trimmed}</div>`;
    }

    // 6. Regular lines
    return `<div class="py-0.5">${line}</div>`;
  });

  return parsedLines.join('');
};
