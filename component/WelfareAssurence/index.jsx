import React, { useEffect, isValidElement } from "react";
import style from "../../public/css/careerDevelopement.module.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import parse from "html-react-parser";
import OptimizedImage from "../OptimizedImage";
import { extractTextFromObject } from "@/libs/utils/helpers";

function WelfareAssurence({
  title = "",
  image = "/images/assurence.png",
  description = [],
  imgRedTri,
  isDarkMode = false,
}) {
  // Check if description is a string (HTML content) or array (plain text array)
  // Also handle object case which might come from WP API
  const isHtmlString =
    typeof description === "string" ||
    (typeof description === "object" && !Array.isArray(description));

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
      data-aos="fade-up"
      data-aos-delay="600"
      className={`${style.legacyFuture_section} ${
        isDarkMode ? style.darkMode : ""
      } pb_80 pt_80`}
    >
      <div className="container">
        <div className={style.legacyFuture_content}>
          <div data-aos="fade-up" data-aos-delay="800">
            <div className={style.legacyFuture_text}>
              <h2 className="main_title hp_space_mb">
                {isValidElement(title) ? title : extractTextFromObject(title)}
              </h2>
              <div className={style.legacyFuture_description}>
                {isValidElement(description)
                  ? description
                  : isHtmlString
                    ? description
                      ? parse(extractTextFromObject(description))
                      : null
                    : Array.isArray(description)
                      ? description.map((paragraph, index) => (
                          <div key={index}>
                            {isValidElement(paragraph)
                              ? paragraph
                              : extractTextFromObject(paragraph)}
                          </div>
                        ))
                      : null}
              </div>
            </div>
          </div>
          <div data-aos="fade-up" data-aos-delay="300">
            <div className={style.legacyFuture_image}>
              <OptimizedImage
                src={image}
                alt={"image"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                objectFit="cover"
                objectPosition="right"
              />
              {imgRedTri && <div className={style.red_traingle}></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelfareAssurence;
