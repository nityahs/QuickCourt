export const initReliability = () => 80;
export const adjustReliability = (current, event) => {
  let r = current ?? 80;
  if (event === 'completed') r += 2;
  if (event === 'cancelled') r -= 10;
  return Math.max(0, Math.min(100, r));
};