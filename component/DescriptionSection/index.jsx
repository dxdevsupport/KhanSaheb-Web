import React, { useRef, useEffect, useState } from "react";
import style from "./descriptionSection.module.scss";
import parse from "html-react-parser";
import OptimizedImage from "../OptimizedImage";
import Image from "next/image";
import { extractTextFromObject } from "@/libs/utils/helpers";

function DescriptionSection({
  desc,
  image,
  imageAlt,
  title,
  onInViewChange,
  isHeaderMoreThan50Visible,
  smallImage = false,
}) {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

 
  // Check if desc is a string (HTML content) or array (plain text array)
  const isHtmlString = typeof desc === "string";

  // Apply dark mode only when:
  // 1. Description section is in view (isInView)
  // 2. AND header is in view and more than 50% visible (isHeaderMoreThan50Visible)
  // When header passes 50% (isHeaderMoreThan50Visible becomes false), remove dark mode
  // Only use isInView as fallback if isHeaderMoreThan50Visible prop is not provided at all


  return (
    <div
      className={`${style.descriptionSection}  pb_80`}
      ref={sectionRef}
    >
      <div className={`${style.image_container} ${smallImage ? style.smallImage : ""}`}>
        <Image
          src={image}
          alt={extractTextFromObject(imageAlt || title)}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          objectFit="cover"
        />
      </div>
      <div className={style.content_wrapper}>
        <div className={` ${style.description_container} pt_80`}>
          <div className={style.content}>
            {title && (
              <h2 className={style.title}>
                {React.isValidElement(title) ? title : extractTextFromObject(title)}
              </h2>
            )}
            <div className={style.description_text}>
              {React.isValidElement(desc) ? (
                desc
              ) : isHtmlString ? (
                desc ? (
                  parse(extractTextFromObject(desc))
                ) : null
              ) : Array.isArray(desc) ? (
                desc.map((item, index) => (
                  <div key={index}>
                    {React.isValidElement(item) ||
                    (Array.isArray(item) &&
                      item.some((i) => React.isValidElement(i)))
                      ? item
                      : extractTextFromObject(item)}
                  </div>
                ))
              ) : null}
              {/* {desc ? parse(String(desc)) : null}  */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescriptionSection;
