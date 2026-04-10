import React from 'react';
import Image from 'next/image';
import styles from './NewsCard.module.scss';

const NewsCard = ({
  image,
  imageAlt,
  title,
  date,
  className = '',
  onClick
}) => {
  return (
    <div
      className={`${styles.newsCard} ${className}`}
      onClick={onClick}
    >
      <div className={styles.imageContainer}>
        <Image
          src={image}
          alt={imageAlt || title}
          width={400}
          height={250}
          className={styles.newsImage}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  );
};

export default NewsCard;
