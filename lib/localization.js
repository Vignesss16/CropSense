export function getLocalized(field, lang) {
  if (!field) return '';
  
  if (typeof field === 'string') {
    // Check if the string is actually stringified JSON (starts with { or [)
    if (field.trim().startsWith('{') || field.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(field);
        return getLocalized(parsed, lang); // recursively process the parsed object
      } catch (e) {
        // If it fails to parse, just return the string (legacy data)
        return field;
      }
    }
    return field;
  }
  
  // If it's a new multi-lingual object, extract the correct language
  if (typeof field === 'object' && !Array.isArray(field)) {
    // Return requested lang, fallback to English, fallback to first available
    return field[lang] || field['en'] || Object.values(field)[0] || '';
  }
  
  // If it's a multi-lingual array of objects, map over it or handle it based on structure
  // For remedies, if the array elements are objects...
  if (Array.isArray(field)) {
    return field.map(item => {
      if (typeof item === 'string') return item;
      return item[lang] || item['en'] || Object.values(item)[0] || '';
    });
  }

  return '';
}
