import React, { useState } from "react";
import Image from "next/image";
import styles from "./BuildingShowcase.module.scss";
import Link from "next/link";
import parse from "html-react-parser";
import { getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";

const BuildingShowcase = ({ data }) => {
  const [hoveredImage, setHoveredImage] = useState(null);

  return (
    <section
      className={`${styles.buildingShowcase} pb_80 pt_80`}
      data-aos="fade-up"
    >
      <div className="container">
        <div
          className={`${styles.layoutContainer} ${
            hoveredImage ? styles[`${hoveredImage}Hovered`] : ""
          }`}
        >
          {/* Left Side - Large Image */}
          <div
            className={`${styles.leftImageContainer} ${
              hoveredImage === "left" ? styles.expanded : ""
            } ${hoveredImage === "right" ? styles.shrunk : ""}`}
            onMouseEnter={() => setHoveredImage("left")}
            onMouseLeave={() => setHoveredImage(null)}
          >
            <Image
              src={
                data?.acf?.hm_bs_left_image?.url
                  ? data.acf.hm_bs_left_image.url
                  : data?.acf?.hm_bs_left_image?.sizes?.["1536x1536"]
                  ? data.acf.hm_bs_left_image.sizes["1536x1536"]
                  : "/images/building_1.jpg"
              }
              alt={data?.acf?.hm_bs_left_image?.alt}
              width={600}
              height={500}
              className={styles.leftImage}
            />
          </div>

          {/* Center - Text Content */}
          <div className={`${styles.textContent}`}>
            <h2 className={`${styles.mainTitle} hp_space_mb`}>
              {parse(extractTextFromObject(data?.acf?.hm_bs_title) || "")}
            </h2>

            {parse(extractTextFromObject(data?.acf?.hm_bs_description) || "")}
            {data?.acf?.hm_bs_button?.title && (
              <Link
                href={getCleanLink(data?.acf?.hm_bs_button?.url)}
                className="common_btn text_lift_up_second pb_space_mt"
              >
                {data?.acf?.hm_bs_button?.title ? parse(extractTextFromObject(data.acf.hm_bs_button.title)) : ""}
              </Link>
            )}
          </div>

          {/* Right Side - Smaller Image (Bottom Positioned) */}
          <div
            className={`${styles.rightImageContainer} ${
              hoveredImage === "right" ? styles.expanded : ""
            } ${hoveredImage === "left" ? styles.shrunk : ""}`}
            onMouseEnter={() => setHoveredImage("right")}
            onMouseLeave={() => setHoveredImage(null)}
          >
            <Image
              src={
                data?.acf?.hm_bs_right_image?.url
                  ? data.acf.hm_bs_right_image.url
                  : data?.acf?.hm_bs_right_image?.sizes?.["1536x1536"]
                  ? data.acf.hm_bs_right_image.sizes["1536x1536"]
                  : "/images/building_2.jpg"
              }
              alt={data?.acf?.hm_bs_right_image?.alt}
              width={400}
              height={300}
              className={styles.rightImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuildingShowcase;
