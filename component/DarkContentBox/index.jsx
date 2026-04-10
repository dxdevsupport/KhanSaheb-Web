import React, { useRef, useEffect, useState, isValidElement } from "react";
import style from "./darkContentBox.module.scss";
import OptimizedImage from "../OptimizedImage";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

function DarkContentBox({ ImgUrl, imageAlt, title, description, backgroundImage = false }) {
  const sectionRef = useRef(null);

 

  return (
    <div
      ref={sectionRef}
      className={`${style.header_container} pb_80 pt_80 ${backgroundImage ? style.backgroundImage : ""}`}
    >
      <div className="container">
        <div className={style.content_grid}>
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
          <div className={style.text_section}>
            <h2 className={style.title}>{title ? parse(extractTextFromObject(title)) : ""}</h2>
            <div className={style.description_container}>
              {Array.isArray(description)
                ? description.map((item, index) => (
                    <div key={index} className={style.description}>
                      {isValidElement(item) || Array.isArray(item)
                        ? item
                        : item
                        ? parse(extractTextFromObject(item))
                        : ""}
                    </div>
                  ))
                : isValidElement(description)
                ? description
                : description
                ? <div className={style.description}>{parse(extractTextFromObject(description))}</div>
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DarkContentBox;
