import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./QuoteSection.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";

const QuoteSection = ({
  quote,
  subTitle,
  mainTitle,
  paragraphs,
  authorName,
  authorTitle,
  authorImage,
  authorImageAlt,
  imageOrder = "right", // 'left' or 'right' to control image position
  onInViewChange,
}) => {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

 
  return (
    <section
      className={`${styles.quoteSection} pb_80 ${
        isInView ? styles.inView : ""
      }`}
      ref={sectionRef}
    >
      <div className="container">
        <div className={styles.quoteBox}>
          <div
            className={`${styles.quoteWrapper} ${
              imageOrder === "right" ? styles.imageRight : styles.imageLeft
            }`}
          >
            {/* Quote Content */}
            <div className={styles.quoteContent}>
              {quote && (
                <blockquote className={styles.quote}>{extractTextFromObject(quote)}</blockquote>
              )}
              <div className={styles.authorInfo}>
                {mainTitle && <h2 className="main_title">{extractTextFromObject(mainTitle)}</h2>}
                {subTitle && <h5 className={styles.sub_title}>{extractTextFromObject(subTitle)}</h5>}
                {paragraphs && paragraphs.length > 0 && (
                  <div className={styles.paragraphs}>
                    {paragraphs.map((description, index) => (
                      <p
                        key={index}
                        dangerouslySetInnerHTML={{ __html: extractTextFromObject(description) }}
                      ></p>
                    ))}
                  </div>
                )}
                <h3 className={styles.authorName}>{extractTextFromObject(authorName)}</h3>
                <span className={styles.authorTitle}>{extractTextFromObject(authorTitle)}</span>
              </div>
            </div>

            {/* Author Image */}
            <div className={styles.authorImage}>
              <Image
                src={authorImage}
                alt={authorImageAlt || `Portrait of ${authorName}`}
                width={630}
                height={583}
                className={styles.portrait}
              />
            <div className={styles.green_triangle}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteSection;
