export const validateDateRange = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 'Start- en einddatum zijn verplicht.';
  if (startDate > endDate) return 'Startdatum mag niet na einddatum liggen.';
  return null;
};
