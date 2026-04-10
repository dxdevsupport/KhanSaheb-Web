import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import styles from './JoinerySectors.module.scss';
import { getCleanLink } from '@/libs/utils/helpers';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const JoinerySectors = ({ 
  title, 
  description, 
  sectors = [] 
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  return (
    <section className={styles.joinerySectors}>
        <div className={styles.contentWrapper}>
          {/* Header Section */}
          <div className={styles.headerSection} data-aos="fade-up">
            <div className="container">
                <h2 className={`main_title ${styles.mainTitle}`}>{title}</h2>
                <p dangerouslySetInnerHTML={{ __html: description }}></p>
            </div>
          </div>

          {/* Sectors Slider */}
          <div className={styles.sliderContainer} data-aos="fade-up" data-aos-delay="200">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView="auto"
              navigation={{
                nextEl: `.${styles.swiperButtonNext}`,
                prevEl: `.${styles.swiperButtonPrev}`,
              }}
              pagination={{
                el: `.${styles.swiperPagination}`,
                clickable: true,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 'auto',
                  spaceBetween: 15,
                },
                480: {
                  slidesPerView: 'auto',
                  spaceBetween: 15,
                },
                768: {
                  slidesPerView: 'auto',
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 'auto',
                  spaceBetween: 25,
                },
                1200: {
                  slidesPerView: 'auto',
                  spaceBetween: 27,
                },
              }}
              className={styles.sectorsSwiper}
            >
              {sectors.map((sector, index) => (
                <SwiperSlide key={index} className={styles.swiperSlide}>
                  <div 
                    className={styles.sectorCard}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className={styles.sectorContent}>
                      <div className={styles.iconContainer}>
                        <Image 
                          src={hoveredCard === index && sector.hoverIcon ? sector.hoverIcon : sector.icon} 
                          alt={sector.imageAlt || sector.title} 
                          width={63} 
                          height={63}
                          className={styles.sectorIcon}
                        />
                      </div>
                      <h3 className={styles.sectorTitle}>{sector.title}</h3>
                    </div>
                    
                    <Link href={getCleanLink(sector.link)} className={`${styles.common_btn} common_btn`}>
                      LEARN MORE
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons */}
            {/* <div className={styles.swiperButtonPrev}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.swiperButtonNext}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div> */}

            {/* Pagination */}
            <div className={styles.swiperPagination}></div>
          </div>
        </div>
    </section>
  );
};

export default JoinerySectors;
