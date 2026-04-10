import React, { useEffect, isValidElement } from "react";
import style from "./cybrerSecurity.module.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import OptimizedImage from "../OptimizedImage";
import { extractTextFromObject } from "@/libs/utils/helpers";
import parse from "html-react-parser";

function CyberSecurity({ ImgUrl, imageAlt, title, description }) {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <div className={style.header_container}>
      <div className="container">
        <div className={style.content_grid}>
          <div data-aos="fade-up" data-aos-delay="600">
            <div className={style.text_section}>
              <h2 className="main_title hp_space_mb">{extractTextFromObject(title)}</h2>
              <div className={style.description}>
                {isValidElement(description) || Array.isArray(description)
                  ? description
                  : parse(extractTextFromObject(description))}
              </div>
            </div>
          </div>
          <div data-aos="fade-up" data-aos-delay="300">
            <div className={style.image_section}>
              <OptimizedImage
                src={ImgUrl}
                alt={extractTextFromObject(imageAlt || title)}
                className={style.content_image}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                objectFit="cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CyberSecurity;
