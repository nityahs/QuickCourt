import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { facilitiesAPI } from '../../services/facilities';

interface SportItem {
  name: string;
  venues: number;
  image: string;
}

// Curated image URLs for common sports; fallback to Unsplash keyword if not found
const SPORT_IMAGES = (() => {
  const m = new Map<string, string>();
  m.set('badminton', 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ86z3AYjU76fmm7RVY59OXj7jx6P28YTZszId9ldP39tRoV9qX8Ty1M9ozZS407zjBAARrBvHARIC1RSeJaJUkk-GOWGjCqR-Q3An5Mw8I');
  m.set('tennis', 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('football', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('basketball', 'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('cricket', 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcS5tZLfKDvR_C0LQG_QMYyEX2k2-Ea42fHfRb8QuZSWLeBwt8ykGqRbVm6ezie3RXIbyem3JEmYB26SBjoOExyn7Ya5t1ESQU1vMhkGPQ0uPg');
  m.set('swimming', 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('table tennis', 'https://images.pexels.com/photos/573945/pexels-photo-573945.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('squash', 'data:image/jpeg;base64,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');
  m.set('volleyball', 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTwfesogIjWkrHoFGJ9wprCIu2pXjAL3aLNQeArMsayZGUkecnMWfqPAv2uweZuR2kkMzo8sssMQbeJeEBzli1gI0fgc7qKie4WlAGYnyVjcg');
  m.set('hockey', 'data:image/jpeg;base64,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');
  m.set('yoga', 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('gym', 'https://images.pexels.com/photos/699887/pexels-photo-699887.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('rugby', 'https://images.pexels.com/photos/190594/pexels-photo-190594.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('kabaddi', 'https://images.pexels.com/photos/7607265/pexels-photo-7607265.jpeg?auto=compress&cs=tinysrgb&w=600');
  return m;
})();

const PopularSports: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await facilitiesAPI.getAll({ page: 1, limit: 1000 });
        if (!ignore) setFacilities(res.data.data || []);
      } catch {
        if (!ignore) setFacilities([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const sports: SportItem[] = useMemo(() => {
  const counts = new Map<string, { count: number; displayName: string }>();
    
    facilities.forEach((f: any) => {
      const arr: string[] = Array.isArray(f.sports) ? f.sports : [];
      arr.forEach((s) => {
        const sportName = typeof s === 'string' ? s : String(s);
        const normalizedKey = sportName.toLowerCase();
  if (counts.has(normalizedKey)) {
          const existing = counts.get(normalizedKey)!;
          counts.set(normalizedKey, {
            count: existing.count + 1,
            displayName: existing.displayName // Keep the first display name format
          });
        } else {
          counts.set(normalizedKey, {
            count: 1,
            displayName: sportName // Use the original format as display name
          });
        }
      });
    });
    
    let items = Array.from(counts.entries())
      .map(([normalizedName, data]) => {
        const curated = SPORT_IMAGES.get(normalizedName);
        const fallback = `https://source.unsplash.com/featured/400x400/?${encodeURIComponent(normalizedName)},sport`;
        return {
          name: data.displayName,
          venues: data.count,
          image: curated || fallback,
        };
      })
      .sort((a, b) => b.venues - a.venues)
      .slice(0, 12);

    // Ensure table tennis appears even if zero venues (force show its image)
    const ensureSports: { key: string; display: string }[] = [
    ];
    ensureSports.forEach(({ key, display }) => {
      if (!items.some(i => i.name.toLowerCase() === key)) {
        const curated = SPORT_IMAGES.get(key);
        items.push({ name: display, venues: 0, image: curated || `https://source.unsplash.com/featured/400x400/?${encodeURIComponent(key)},sport` });
      }
    });
    
    // Remove duplicate entries by normalizing names and keeping the one with more venues
    const uniqueItems = new Map<string, SportItem>();
    items.forEach(item => {
      const normalizedName = item.name.toLowerCase().replace(/[-\s]/g, ''); // Remove hyphens and spaces for comparison
      if (!uniqueItems.has(normalizedName) || item.venues > uniqueItems.get(normalizedName)!.venues) {
        uniqueItems.set(normalizedName, item);
      }
    });
    items = Array.from(uniqueItems.values());

    // Resort so that non-venue items appear at end but maintain loop variety
  items = items.sort((a, b) => b.venues - a.venues);
    return items;
  }, [facilities]);

  // Carousel logic
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [cycleWidth, setCycleWidth] = useState(0);

  useLayoutEffect(() => {
    if (trackRef.current) {
      // Width of first half (unique items) for one full cycle
      const children = Array.from(trackRef.current.children);
      const half = children.slice(0, sports.length);
      const width = half.reduce((acc, el) => acc + (el as HTMLElement).offsetWidth, 0) + (half.length - 1) * 24; // 24px gap-6
      setCycleWidth(width);
    }
  }, [sports]);

  // Duplicate list for seamless infinite scroll
  const scrollingSports = [...sports, ...sports];

  const duration = cycleWidth ? cycleWidth / 60 : 20; // 60px per second baseline

  const handleClickSport = (sport: string) => {
    const params = new URLSearchParams({ sport: sport.toLowerCase() });
    window.history.pushState({}, '', `/venues?${params.toString()}`);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Sports</h2>
          <p className="text-lg text-gray-600">Choose a sport to see all available turfs</p>
        </div>

        {loading ? (
      <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-56 h-56 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden peer">
              <motion.div
                ref={trackRef}
                className="flex gap-6"
                animate={cycleWidth ? { x: [0, -cycleWidth] } : undefined}
                transition={cycleWidth ? { duration, repeat: Infinity, ease: 'linear' } : undefined}
              >
        {scrollingSports.map((sport, idx) => (
                  <button
                    type="button"
                    key={sport.name + idx}
                    onClick={() => handleClickSport(sport.name)}
          className="group w-56 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={sport.image}
                        alt={sport.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e: any) => {
                          e.currentTarget.src = `https://via.placeholder.com/400?text=${encodeURIComponent(sport.name)}`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 backdrop-blur text-[10px] font-medium tracking-wider text-white">{sport.venues} VENUES</div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm tracking-wide">{sport.name.toUpperCase()}</h3>
                    </div>
                  </button>
                ))}
              </motion.div>
            </div>
            {/* Gradient edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-50 to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularSports;