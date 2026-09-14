import React from 'react';

export const SideWatermarks: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-10 flex justify-between items-center">
      {/* Left: Sacred Hand of Christ radiating light */}
      <div className="w-72 lg:w-96 h-[550px] -ml-20 lg:-ml-12 opacity-30 mix-blend-screen filter drop-shadow-[0_0_20px_rgba(56,189,248,0.25)] select-none">
        <img
          alt="Llagas y Mano Sagrada de Cristo"
          className="w-full h-full object-contain object-left pointer-events-none"
          src="https://lh3.googleusercontent.com/aida/AEtjO1Vxo_shsrMIBhh3FH8vetZ1GQThWjzGTZzjHfjwthqLSSG8CeYQwXXZoJBQUQ49PQ5XVLwk0Y2Hlj7tORZuq511xHDSMZN2hvFpS0RaZTxtT9DuftuurJ2ytckTbHPSqbV0qBdkBwFZBUZ2oosp-1sZDF7Qdgm4QUt2tClMl5llZZ7bW9ITn3NCVGqPoKFahS37PkE0mzsAGzSrikF5ZVsCkkTWGRcvzoV7PfOI0wtR3B0rW6cyYnABO3FC"
          loading="eager"
        />
      </div>

      {/* Right: Holy Spirit Divine Dove radiating celestial rays */}
      <div className="w-72 lg:w-96 h-[550px] -mr-20 lg:-mr-12 opacity-30 mix-blend-screen filter drop-shadow-[0_0_20px_rgba(245,158,11,0.2)] select-none">
        <img
          alt="Espíritu Santo Paloma Divina"
          className="w-full h-full object-contain object-right pointer-events-none"
          src="https://lh3.googleusercontent.com/aida/AEtjO1X0NfQiujbOUooPxpiERqEcA5ImnCP9NAyl6Jp_M1MB40Hpwj6dxA-XlrnMVMsnqEY4PaGKchJr1R_B5Le-5HlGkx7GRaDp3BeMQHuE0xgfRK3Z1LGBVMXGHLUxJmx07SI6C6BOqYGQw7iQIt-VuKmC4wN3_GE0MqFSeVy7qKNti_4sPVKB-XXYlJRxhTCyYR5xDb9D1kW_aPuAiJFKKnFjsXuBnmUnL1hs9v2IiQW5jrd_FsAP3ylw6tY"
          loading="eager"
        />
      </div>
    </div>
  );
};
