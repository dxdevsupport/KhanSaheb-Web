import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import OptimizedImage from '../OptimizedImage';
import Link from 'next/link';
import parse from "html-react-parser";
import styles from './WhatsNew.module.scss';
import { getCleanLink } from "@/libs/utils/helpers";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const WhatsNew = ({ data }) => {
  const defaultNewsItems = [];

  const newsItems = data?.acf?.hm_wn_latest_news?.length > 0 
    ? data.acf.hm_wn_latest_news 
    : [];

  return (
    <section className={`${styles.whatsNewSection} pt_120 pb_120`}>
      <div className={`container`}>
        {/* Header */}
        <div className={`${styles.news_head} hp_space_mb`}>
          <h2 className={`${styles.main_title} main_title`}>What's New</h2>
          <Link href={getCleanLink(data?.acf?.hm_wn_button?.url)} className={`${styles.common_btn} common_btn text_lift_up_second`}>
            {data?.acf?.hm_wn_button?.title ? parse(String(data.acf.hm_wn_button.title)) : ""}
          </Link>
        </div>

        {/* News Cards Swiper */}
        <div className={styles.newsSwiper}>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={true}
            pagination={{
              clickable: true,
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            className={styles.swiper}
          >
            {newsItems.map((item, index) => {
              const imageUrl = item.image || item.image_details?.source_url || "/images/img_placeholder.png";
              const title = item.title?.rendered || item.title || item.post_title || ""; 
              // Handle date from API (date) or ACF (post_date)
              let rawDate = item.date || item.post_date || "";
              // Fix for Safari/Firefox if date format is "YYYY-MM-DD HH:mm:ss"
              if (rawDate && rawDate.indexOf("T") === -1) {
                  rawDate = rawDate.replace(" ", "T");
              }
              
              const formattedDate = rawDate 
                  ? new Date(rawDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "";

               // Construct link if missing. Assumes standard posts are News.
               const postLink = item.link || `/whatsnew/news/${item.slug || item.post_name || ""}`;
               
 
                return (
                <SwiperSlide key={item.id} className={styles.slide}>
                  <div className={styles.newsCard} data-aos="fade-up" data-aos-delay={index*300}>
                    <Link href={postLink} className={styles.cardImage}>
                      <OptimizedImage
                        src={imageUrl}
                        alt={item.imageAlt || title}
                        width={486}
                        height={268}
                        className={styles.newsImage}
                      />
                    </Link>
                    <div className={styles.cardContent}>
                      {/* <span className={styles.categoryTag}>{item.category}</span> */}
                      <h3 className={styles.newsTitle}>
                        <Link href={postLink}>{title ? parse(String(title)) : ""}</Link>
                      </h3>
                      <p className={styles.newsDate}>{formattedDate}</p>
                    </div>
                  </div>
                </SwiperSlide>
              )})}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default WhatsNew;
