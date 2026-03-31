export const localVideoMapping: Record<string, string> = {
  'Тактильні сенсорні активності': '/videos/Sensoric exercise.mp4',
  'Як зменшити шумове перевантаження': '/videos/noise reduction.mp4',
  'Розвиток візуальної уваги': '/videos/eye focus.mp4',
  'Баланс і координація': '/videos/coordination improve.mp4',
  'Оральні вправи': '/videos/oral exercise.mp4',
};

export function getLocalVideoUrl(title: string): string | null {
  return localVideoMapping[title] || null;
}
