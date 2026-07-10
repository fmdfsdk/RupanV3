/**
 * Helper to parse a markdown-like description string (with asterisks, bullet points, emoji headings)
 * into semantic, styled HTML tags.
 */
export const formatDescriptionToHtml = (desc: string): string => {
  if (!desc) return '';

  // 1. Preprocess string to inject newlines before indicators since reseller API concatenates them
  let prepared = desc;

  // Replace &nbsp; with newlines
  prepared = prepared.replace(/&nbsp;/g, '\n');

  // Insert newlines before bullet lines starting with '-' (e.g. -*Fabrics:)
  prepared = prepared.replace(/-\s*\*/g, '\n-*');

  // Insert newlines before bullet lines starting with '*' (e.g. * *Color:)
  prepared = prepared.replace(/\*\s+\*/g, '\n* *');
  prepared = prepared.replace(/\*\s+-/g, '\n* -');

  // Insert newlines before any hyphen-bullet or bullet-symbol not preceded by newline
  prepared = prepared.replace(/([^\n])-\s/g, '$1\n- ');
  prepared = prepared.replace(/([^\n])•\s/g, '$1\n• ');

  // Insert newlines before size specifications like (*M:* or (*L:*
  prepared = prepared.replace(/\(\*/g, '\n(*');

  // Insert newlines before section headers starting with 👉
  prepared = prepared.replace(/👉/g, '\n👉');

  // Insert newlines before headers starting with 👕
  prepared = prepared.replace(/👕/g, '\n👕');

  // Insert newlines before hashtags (#)
  prepared = prepared.replace(/#/g, '\n#');

  // Replace any duplicate newlines
  prepared = prepared.replace(/\n+/g, '\n');

  // 2. Convert *bold* text to strong tag
  let formatted = prepared.replace(/\*([^*]+)\*/g, '<strong class="font-extrabold text-zinc-950">$1</strong>');

  // 3. Split by newline to parse structure line-by-line
  const lines = formatted.split('\n');
  const parsedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      return '<div class="h-2"></div>'; // Spacing line
    }

    // 4. Bullet points starting with '-' or '•'
    if (trimmed.startsWith('-')) {
      const bulletText = trimmed.startsWith('-*') 
        ? trimmed.substring(1).trim()
        : trimmed.substring(1).trim();
      return `<div class="flex items-start gap-2 pl-4 py-0.5 text-gray-600"><span class="text-[#ff5c00] font-black shrink-0 select-none">•</span><span>${bulletText}</span></div>`;
    }
    if (trimmed.startsWith('•')) {
      return `<div class="flex items-start gap-2 pl-4 py-0.5 text-gray-600"><span class="text-[#ff5c00] font-black shrink-0 select-none">•</span><span>${trimmed.substring(1).trim()}</span></div>`;
    }

    // 5. Size specifications starting with '(' or '(*'
    if (trimmed.startsWith('(')) {
      return `<div class="pl-6 py-0.5 text-gray-500 font-semibold font-mono text-xs">${trimmed}</div>`;
    }

    // 6. Section headers starting with '👉'
    if (trimmed.startsWith('👉')) {
      return `<div class="font-black text-zinc-900 my-2 pt-2 flex items-center gap-1.5 text-sm">${trimmed}</div>`;
    }
    
    // 7. Titles starting with '👕' or other similar emojis
    if (trimmed.startsWith('👕')) {
      return `<div class="font-black text-zinc-950 text-base my-3 border-b border-gray-100 pb-2">${trimmed}</div>`;
    }

    // 8. Hashtag line
    if (trimmed.startsWith('#')) {
      return `<div class="text-[11px] font-bold text-gray-400 mt-3 hover:text-[#ff5c00] transition-colors leading-relaxed">${trimmed}</div>`;
    }

    // 9. Regular lines
    return `<div class="py-0.5">${line}</div>`;
  });

  return parsedLines.join('');
};
