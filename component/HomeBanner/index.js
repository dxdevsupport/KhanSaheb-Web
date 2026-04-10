import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import styles from "./HomeBanner.module.scss";
import { getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";

const HomeBanner = ({ data }) => {
  const videoRef = useRef(null);

  // Banner slides data - use API data if available, otherwise use fallback
  const bannerSlides = [
    {
      id: 1,
      video: data?.acf?.hm_banner_video?.url
        ? data.acf.hm_banner_video.url
        : data?.acf?.hm_banner_video?.sizes?.["1536x1536"]
          ? data.acf.hm_banner_video.sizes["1536x1536"]
          : "/videos/banner_video.mp4",
      backgroundImage: data?.acf?.hm_banner_bg?.url
        ? data.acf.hm_banner_bg.url
        : data?.acf?.hm_banner_bg?.sizes?.["1536x1536"]
          ? data.acf.hm_banner_bg.sizes["1536x1536"]
          : "/images/banner_bg.jpg",
      title: extractTextFromObject(data?.acf?.hm_banner_text) || "",
      subtitle: "",
    },
  ];

  return (
    <section className={styles.bannerSection}>
      <div className={styles.greenTriangle}></div>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        loop={true}
        className={styles.bannerSwiper}
      >
        {bannerSlides.map((slide) => (
          <SwiperSlide key={slide.id} className={styles.bannerSlide}>
            <div className={styles.videoContainer}>
              <video
                ref={videoRef}
                className={styles.bannerVideo}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={slide.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className={styles.videoOverlay}></div>
            </div>

            <div className={styles.bannerContent}>
              <div className="container">
                <h1
                  className={styles.bannerTitle}
                  dangerouslySetInnerHTML={{ __html: slide.title }}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HomeBanner;
