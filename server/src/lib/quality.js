export const computeQuality = ({ ratingAvg=0, ratingCount=0, onTimeRate=0.9, complaintRate=0.02 }) => {
  const vol = Math.log10(1 + ratingCount);
  const score = 0.6*ratingAvg*20 + 0.2*(vol/2)*100 + 0.1*onTimeRate*100 + 0.1*(1 - complaintRate)*100;
  return Math.round(Math.max(0, Math.min(100, score)));
};