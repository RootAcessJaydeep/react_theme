import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Herobanner = ({ banners }) => {
  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-96"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <div className={`${banner.bg} h-96 flex items-center`}>
              {/* <div
                className="h-96 bg-cover bg-center flex items-center"
                style={{ backgroundImage: `url(${banner.image})` }}
              > */}
              <div className="container mx-auto px-4">
                <div className="max-w-lg text-white">
                  <h1 className="text-4xl font-bold mb-4">{banner.title}</h1>
                  <p className="mb-6">{banner.subtitle}</p>
                  <a
                    href={banner.buttonLink}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition"
                  >
                    {banner.buttonText}
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Herobanner;
