import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';
import styles from './SocialMedia.module.scss';

// Import Swiper styles
import 'swiper/css';

const SocialMedia = ({ data }) => {
  // Social media posts data - can be extended with API data in the future
  const socialPosts = [
    {
      id: 1,
      image: '/images/insta_1.jpg',
      platform: 'instagram'
    },
    {
      id: 2,
      image: '/images/insta_2.jpg',
      platform: 'facebook'
    },
    {
      id: 3,
      image: '/images/insta_3.jpg',
      platform: 'linkedin'
    },
    {
      id: 4,
      image: '/images/insta_4.jpg',
      platform: 'twitter'
    },
    {
      id: 5,
      image: '/images/insta_5.jpg',
      platform: 'instagram'
    },
    {
      id: 6,
      image: '/images/insta_6.jpg',
      platform: 'youtube'
    },
    {
      id: 7,
      image: '/images/insta_7.jpg',
      platform: 'facebook'
    },
    {
      id: 7,
      image: '/images/insta_3.jpg',
      platform: 'facebook'
    },
  ];

  // Function to get platform icon and color
  const getPlatformDetails = (platform) => {
    switch (platform) {
      case 'instagram':
        return {
          icon: 'icon-Instagram',
        };
      case 'facebook':
        return {
          icon: 'icon-Facebook',
        };
      case 'linkedin':
        return {
          icon: 'icon-Linkedin',
        };
      case 'twitter':
        return {
          icon: 'icon-X',
        };
      default:
        return {
          icon: 'icon-Instagram',
          color: '#E4405F',
          bgColor: 'rgba(228, 64, 95, 0.1)'
        };
    }
  };

  return (
    <section className={styles.socialMediaSection}>
      <div className={styles.container}>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={5}
          slidesPerView={5}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          speed={2000}
          loop={true}
          allowTouchMove={false}
          className={styles.socialSwiper}
          breakpoints={{
            320: {
              slidesPerView: 1.4,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
            1200: {
              slidesPerView: 4.5,
            },

            1450: {
              slidesPerView: 5.5,
            },
          }}
        >
          {socialPosts.map((post) => {
            const platformDetails = getPlatformDetails(post.platform);
            return (
              <SwiperSlide key={post.id} className={styles.socialSlide}>
                <div className={styles.postContainer}>
                  <Image
                    src={post.image}
                    alt={`${post.platform} post ${post.id}`}
                    width={339}
                    height={439}
                    className={styles.postImage}
                  />
                  <div
                    className={styles.platformIcon}
                  >
                    <span
                      className={platformDetails.icon}
                    ></span>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default SocialMedia;
