import React, { useEffect, useRef, useState, isValidElement } from "react";
import style from "./industryStandards.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";
import parse from "html-react-parser";

function IndustryStandards({ title, desc, bgImg }) {
  const sectionRef = useRef(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  return (
    <div
      ref={sectionRef}
      className={style.industryStandards}
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className={`${style.contentContainer} container`}>
        <div className={style.contentBox} data-aos="fade-up">
          <div className={style.leftContent}>
            <h2 className={style.title}>{extractTextFromObject(title)}</h2>
          </div>

          <div className={style.rightContent}>
            <div className={style.paragraph}>
              {isValidElement(desc) || Array.isArray(desc)
                ? desc
                : extractTextFromObject(desc)
                ? parse(extractTextFromObject(desc))
                : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndustryStandards;
