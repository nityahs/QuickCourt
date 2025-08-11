import React from 'react';

const PopularSports: React.FC = () => {
  const sports = [
    {
      name: 'Badminton',
      image: 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=300',
      venues: 45
    },
    {
      name: 'Tennis',
      image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=300',
      venues: 32
    },
    {
      name: 'Football',
      image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=300',
      venues: 28
    },
    {
      name: 'Basketball',
      image: 'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=300',
      venues: 21
    },
    {
      name: 'Cricket',
      image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=300',
      venues: 18
    },
    {
      name: 'Swimming',
      image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=300',
      venues: 15
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Sports</h2>
          <p className="text-lg text-gray-600">Choose from a variety of sports and find the perfect venue</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {sports.map((sport) => (
            <div
              key={sport.name}
              className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={sport.image}
                  alt={sport.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 mb-1">{sport.name}</h3>
                <p className="text-sm text-gray-600">{sport.venues} venues</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularSports;