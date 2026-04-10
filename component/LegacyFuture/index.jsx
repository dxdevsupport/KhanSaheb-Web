import React, { useEffect, useState, isValidElement } from "react";
import style from "../../public/css/careerDevelopement.module.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import OptimizedImage from "../OptimizedImage";
import { extractTextFromObject } from "@/libs/utils/helpers";

function LegacyFuture({
  title = "",
  subHeading = "",
  companyName = "",
  image,
  bgColor = "#fff",
  description = [
    // "At Khansaheb Civil Engineering, we believe in nurturing talent and providing opportunities for high-calibre construction and support service professionals to build rewarding careers. We support our employees at every stage of their journey, from entry-level positions to senior leadership roles.",
    // "Our commitment to talent retention is reflected in our investment in structured training initiatives and clear paths for advancement through internal promotions. We create an environment where our people can grow, learn, and contribute to the success of our projects and the communities we serve."
  ],
  imageAlt = "Career Development",
  greenTriangle,
}) {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <div
      className={`${style.legacyFuture_section} pt_80 pb_80`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="container">
        <div className={style.legacyFuture_content}>
          <div data-aos="fade-up" data-aos-delay="300">
            <div className={style.legacyFuture_image}>
              <OptimizedImage
                src={image}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                objectFit="cover"
              />
            </div>
          </div>
          <div data-aos="fade-up" data-aos-delay="600">
            <div className={style.legacyFuture_text}>
              <h2 className={`${style.legacyFuture_title} hp_space_mb`}>
                <span className= {` ${style.legacyFuture_green} pb_20 `}>{extractTextFromObject(title)}</span>
                <span className="main_title">{extractTextFromObject(subHeading)}</span>
                <span className="main_title">{extractTextFromObject(companyName)}</span>
              </h2>
              <div className={style.legacyFuture_description}>
                {description.map((paragraph, index) => (
                  <div key={index}>
                    {isValidElement(paragraph) || Array.isArray(paragraph)
                      ? paragraph
                      : extractTextFromObject(paragraph)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {greenTriangle && <div className={style.green_triangle}></div>}
    </div>
  );
}

export default LegacyFuture;
