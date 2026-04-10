import React, { useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import styles from './Testimonials.module.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Testimonials = ({ 
  title,
  testimonials = [] 
}) => {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  return (
    <section className={styles.testimonials}>
        <div className={styles.contentWrapper}>

          {/* Testimonials Slider */}
          <div className={styles.sliderContainer} data-aos="fade-up">
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
                768: {
                  slidesPerView: 2,
                  spaceBetween: 25,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                1200: {
                  slidesPerView: 4,
                  spaceBetween: 10,
                },
              }}
              className={styles.testimonialsSwiper}
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={index} className={styles.swiperSlide}>
                  <div 
                    className={styles.testimonialCard}
                    data-aos="fade-up"
                    data-aos-delay={index * 150}
                  >
                    <div className={styles.quoteIcon}>
                       <Image src="/images/quote.svg" alt="Quote icon" width={51} height={47} />
                    </div>
                    
                    <div className={styles.testimonialContent}>
                      <p>{testimonial.text}</p>
                    </div>
                    
                    <div className={styles.testimonialAuthor}>
                      <div className={styles.authorImage}>
                        <Image 
                          src={testimonial.image} 
                          alt={testimonial.imageAlt || `Portrait of ${testimonial.name}`} 
                          width={78} 
                          height={78}
                          className={styles.authorPhoto}
                        />
                      </div>
                      <div className={styles.authorInfo}>
                        <h4 className={styles.authorName}>{testimonial.name}</h4>
                        <p>{testimonial.title}</p>
                      </div>
                    </div>
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
            {/* <div className={styles.swiperPagination}></div> */}
          </div>
        </div>
    </section>
  );
};

export default Testimonials;
