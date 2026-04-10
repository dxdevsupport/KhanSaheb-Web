import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './AwardShowcase.module.scss';
import AOS from 'aos';

const AwardShowcase = ({ title, description, image, imageAlt }) => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  return (
    <section className={styles.awardShowcaseSection}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.textContent}>
            <h2 className={`${styles.main_title} main_title`}>{title}</h2>
            <p dangerouslySetInnerHTML={{ __html: description }}></p>
          </div>
        </div>
        
        <div className={styles.rightSection}>
          <div className={styles.imageContainer}>
            <Image
              src={image || "/images/award_placeholder.jpg"}
              alt={imageAlt || title || "Award"}
              width={961}
              height={600}
              className={styles.awardImage}
            />
            <div className={styles.greenAccent}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwardShowcase;
