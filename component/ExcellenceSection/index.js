import React from "react";
import Image from "next/image";
import parse from "html-react-parser";
import styles from "./ExcellenceSection.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";

const ExcellenceSection = ({ 
  title, 
  description, 
  leftImage, 
  rightImage 
}) => {
  // If coming from flexible content, props might be different or nested.
  // But based on the manual extraction, we can map them in the parent or expect them here.
  // Let's expect flat props here for reusability.

  return (
    <section
      className={`${styles.excellenceSection} pb_80 pt_50`}
      data-aos="fade-up"
    >
      <div className="container">
        <div className={styles.contentWrapper}>
          <div className={styles.leftColumn}>
            <div
              className={styles.textContent}
              data-aos="fade-up"
              data-aos-delay="1000"
            >
              <h2 className="main_title hp_space_mb">
                {title ? parse(extractTextFromObject(title)) : ""}
              </h2>
              {description ? parse(extractTextFromObject(description)) : ""}
            </div>
            <div
              className={styles.secondaryImage}
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <Image
                src={leftImage?.url || "/images/history_1.jpg"}
                alt={leftImage?.alt || "History Left Image"}
                width={675}
                height={348}
              />
            </div>
          </div>
          <div className={styles.rightColumn}>
            <div
              className={styles.mainImage}
              data-aos="fade-up"
              data-aos-delay="600"
            >
              <Image
                src={rightImage?.url || "/images/history_2.jpg"}
                alt={rightImage?.alt || "History Right Image"}
                width={700}
                height={799}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExcellenceSection;
