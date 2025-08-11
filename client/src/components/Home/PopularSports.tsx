import React from 'react';
import { motion } from 'framer-motion';

const PopularSports: React.FC = () => {
  const sports = [
    { name: 'Badminton', image: 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=300', venues: 45 },
    { name: 'Tennis', image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=300', venues: 32 },
    { name: 'Football', image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=300', venues: 28 },
    { name: 'Basketball', image: 'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=300', venues: 21 },
    { name: 'Cricket', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=300', venues: 18 },
    { name: 'Swimming', image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=300', venues: 15 },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Sports</h2>
          <p className="text-lg text-gray-600">Choose from a variety of sports and find the perfect venue</p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {sports.map((sport) => (
            <motion.div
              key={sport.name}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-lg bg-white"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={sport.image}
                  alt={sport.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-90" />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 mb-1">{sport.name}</h3>
                <p className="text-sm text-gray-600">{sport.venues} venues</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PopularSports;