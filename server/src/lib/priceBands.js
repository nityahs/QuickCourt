export const quartiles = (arr) => {
  if (!arr.length) return { p25:0,p50:0,p75:0, min:0, max:0 };
  const s=[...arr].sort((a,b)=>a-b); const n=s.length;
  const q = (p)=> s[Math.floor((n-1)*p)];
  return { p25:q(0.25), p50:q(0.5), p75:q(0.75), min:s[0], max:s[n-1] };
};