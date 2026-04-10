import React from 'react';
import Image from 'next/image';
import styles from './LegacySection.module.scss';

const LegacySection = ({ 
  text = "This legacy of trust continues to guide the company today, ensuring consistent delivery on time with quality and integrity. For Khansaheb Civil Engineering, these are not just projects; they are promises made and promises kept.",
  imageUrl = "/images/legacy_interior.jpg",
  imageAlt = "Luxurious interior space",
  imageOrder = 'right' // 'left' or 'right' to control image position
}) => {
  // Don't render if no content provided
  if (!text || !imageUrl) {
    return null;
  }

  return (
    <section className={styles.legacySection}>
      <div className="container">
        <div className={`${styles.legacyWrapper} ${imageOrder === 'right' ? styles.imageRight : styles.imageLeft}`}>
           {/* Image Content */}
           <div className={styles.imageContent}>
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={630}
              height={583}
              className={styles.legacyImage}
            />
          </div>
          {/* Text Content */}
          <div className={styles.textContent}>
            <p>{text}</p>
          </div>
          
         
        </div>
      </div>
    </section>
  );
};

export default LegacySection;
