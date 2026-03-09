export const upsertById = <T extends { id: string }>(items: T[], value: T) => {
  const index = items.findIndex((item) => item.id === value.id);
  if (index === -1) return [...items, value];
  return items.map((item, currentIndex) => (currentIndex === index ? value : item));
};
