import { describe, expect, it } from 'vitest';
import { CATEGORIES, WORDS, getCategoryCount, getRandomWordFromCategory } from './words';

describe('kelime havuzu bütünlüğü', () => {
  it('boş alan, bilinmeyen kategori veya kategori başına yetersiz içerik barındırmaz', () => {
    const categories = new Set<string>(Object.values(CATEGORIES));
    const counts = getCategoryCount();

    expect(WORDS.every(item => item.word.trim() && item.hint.trim())).toBe(true);
    expect(WORDS.every(item => categories.has(item.category))).toBe(true);
    expect(Object.values(counts).every(count => count >= 10)).toBe(true);
  });

  it('aynı kategoride yinelenen kelime barındırmaz', () => {
    const keys = WORDS.map(item => `${item.category}|${item.word.toLocaleLowerCase('tr-TR')}`);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    expect(duplicates).toEqual([]);
  });

  it('kategori seçimini seçilen kategoriyle sınırlar ve bilinmeyen kategoride null döner', () => {
    for (const category of Object.values(CATEGORIES)) {
      expect(getRandomWordFromCategory(category)?.category).toBe(category);
    }
    expect(getRandomWordFromCategory('Bilinmeyen')).toBeNull();
  });
});
