export function formatOcrLabel(ocrResult: string | null | undefined): string {
  if (!ocrResult) return '识别中...';

  try {
    const obj = JSON.parse(ocrResult);
    const parts: string[] = [];

    if (obj.items && Array.isArray(obj.items)) {
      for (const item of obj.items) {
        if (item.value) {
          parts.push(item.name ? `${item.name}: ${item.value}` : item.value);
        }
      }
    }

    if (parts.length > 0) {
      const text = parts.join(', ');
      return text.length > 60 ? text.substring(0, 60) + '...' : text;
    }

    if (typeof obj === 'object' && obj !== null) {
      const values = Object.values(obj).filter(v => typeof v === 'string');
      if (values.length > 0) {
        const text = values.join(', ');
        return text.length > 60 ? text.substring(0, 60) + '...' : text;
      }
    }
  } catch {
    // not valid JSON, return raw string
  }

  return ocrResult.length > 60 ? ocrResult.substring(0, 60) + '...' : ocrResult;
}
