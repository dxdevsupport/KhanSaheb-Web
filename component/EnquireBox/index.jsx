import React, { useRef, useEffect, useState } from "react";
import style from "./enquire.module.scss";
import parse from "html-react-parser";
import Link from "next/link";
import { getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";
import OptimizedImage from "../OptimizedImage";

function EnquireBox({ data }) {
  const sectionRef = useRef(null);

  // Get data from ACF fields or use defaults
  const title = extractTextFromObject(data?.acf?.bb_title);
  const description = extractTextFromObject(data?.acf?.bb_description);
  const image = data?.acf?.bb_image?.url || "";
  const buttonText = extractTextFromObject(data?.acf?.bb_button?.title);
  const buttonUrl = data?.acf?.bb_button?.url || "";

  // Split description into paragraphs if it contains line breaks
  const descriptionParagraphs = description ? description.split("\n").filter((p) => p.trim()) : [];

  return (
    <div
      ref={sectionRef}
      className={`${style.header_container}`}
    >
      <div className="container">
        <div className={style.content_grid}>
          <div className={style.text_section}>
            <h2 className={style.title}>
              {title && title.includes("<br>")
                ? parse(title)
                : title}
            </h2>
            <div className={style.description_container}>
              {descriptionParagraphs.map((item, index) => (
                <div key={index} className={style.description}>
                  {item &&
                  (item.includes("<") || item.includes("&"))
                    ? parse(item)
                    : item}
                </div>
              ))}
            </div>
            {buttonText && buttonUrl && (
              <Link href={getCleanLink(buttonUrl)} className={`${style.enquire_btn}  white_bg_btn`}>
                {buttonText}
              </Link>
            )}
          </div>
          <div className={style.image_section}>
            <OptimizedImage
              src={image}
              alt={data?.acf?.bb_image?.alt}
              className={style.content_image}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              objectFit="cover"
            />
            <div className={style.red_traingle}></div>
          </div>
        </div>
      </div>
      <div className={style.green_triangle}></div>
    </div>
  );
}

export default EnquireBox;
