export const scoreRecommendation = ({ sim=0, priceAdv=0, weather=0, quality=0, highlight=0, distance=0 }) => {
  return 0.35*sim + 0.2*priceAdv + 0.15*weather + 0.15*quality + 0.1*highlight + 0.05*distance;
};