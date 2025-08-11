import React, { useEffect, useMemo, useState } from 'react';
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
  m.set('badminton', 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('tennis', 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('football', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('basketball', 'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('cricket', 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('swimming', 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('table tennis', 'https://images.pexels.com/photos/209969/pexels-photo-209969.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('squash', 'data:image/jpeg;base64,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');
  m.set('volleyball', 'https://images.pexels.com/photos/1198171/pexels-photo-1198171.jpeg?auto=compress&cs=tinysrgb&w=600');
  m.set('hockey', 'https://images.pexels.com/photos/163427/field-hockey-game-sport-sports-163427.jpeg?auto=compress&cs=tinysrgb&w=600');
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
    const counts = new Map<string, number>();
    facilities.forEach((f: any) => {
      const arr: string[] = Array.isArray(f.sports) ? f.sports : [];
      arr.forEach((s) => {
        const key = typeof s === 'string' ? s : String(s);
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    const items = Array.from(counts.entries())
      .map(([name, venues]) => {
        const curated = SPORT_IMAGES.get(name.toLowerCase());
        const fallback = `https://source.unsplash.com/featured/400x400/?${encodeURIComponent(name)},sport`;
        return {
          name,
          venues,
          image: curated || fallback,
        };
      })
      .sort((a, b) => b.venues - a.venues)
      .slice(0, 12);
    return items;
  }, [facilities]);

  const handleClickSport = (sport: string) => {
    const params = new URLSearchParams({ sport });
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {sports.map((sport) => (
              <motion.button
                type="button"
                key={sport.name}
                onClick={() => handleClickSport(sport.name)}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-lg bg-white text-left"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e: any) => {
                      e.currentTarget.src = `https://via.placeholder.com/400?text=${encodeURIComponent(sport.name)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-90" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{sport.name}</h3>
                  <p className="text-sm text-gray-600">{sport.venues} venues</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PopularSports;