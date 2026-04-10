import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./CareerSection.module.scss";
import parse from "html-react-parser";
import { getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";

const CareerSection = ({ data }) => {
  return (
    <section className={`${styles.careerSection} pt_80 pb_80`}>
      <div className={styles.backgroundOverlay}></div>
      <div className={`${styles.container} container`}>
        <div className={styles.contentLeft} data-aos="fade-up">
          <div className={styles.engineerImageContainer}>
            <Image
              src={
                data?.acf?.hm_li_image?.url
                  ? data.acf.hm_li_image.url
                  : data?.acf?.hm_li_image?.sizes?.["1536x1536"]
                    ? data.acf.hm_li_image.sizes["1536x1536"]
                    : "/images/career_pic.jpg"
              }
              alt={
                data?.acf?.hm_li_image?.alt ||
                "Khansaheb engineer in safety gear"
              }
              width={821}
              height={597}
              className={styles.engineerImage}
              priority
            />
          </div>
        </div>
        <div className={styles.contentRight} data-aos="fade-up">
          <span className="tag">
            {data?.acf?.hm_li_sub_caption
              ? parse(extractTextFromObject(data.acf.hm_li_sub_caption))
              : ""}
          </span>
          <h2 className="main_title">
            {parse(extractTextFromObject(data?.acf?.hm_li_main_caption || ""))}
          </h2>
          <div>
            {data?.acf?.hm_li_description
              ? parse(extractTextFromObject(data.acf.hm_li_description))
              : ""}
          </div>
          <Link
            href={
              getCleanLink(data?.acf?.hm_li_button?.url)
            }
            className="common_btn text_lift_up_second"
          >
            {data?.acf?.hm_li_button?.title
              ? parse(extractTextFromObject(data.acf.hm_li_button.title))
              : ""}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CareerSection;
