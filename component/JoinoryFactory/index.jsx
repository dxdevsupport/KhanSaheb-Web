import React from "react";
import style from "./joinoryFactory.module.scss";
import Image from "next/image";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

function JoinoryFactory({ data }) {
  // Helper function to strip <p> tags from HTML content
  const stripPTags = (htmlInput) => {
    const htmlString = extractTextFromObject(htmlInput);
    if (!htmlString) return "";
    return htmlString.replace(/<\/?p>/g, "").trim();
  };
  return (
    <div className={`${style.factory_section} pt_80 pb_80`}>
      <div
        className="container"
      >

        
        <div className={style.content_grid} style={{ backgroundColor: "#222423"}}>
        <div className={style.triangle}></div>

          {/* Left Content Section */}
          <div className={style.text_content}>
            {/* Turquoise Triangle */}

            <h2 className={style.title}>
              {data?.acf?.jo_title ? parse(extractTextFromObject(data.acf.jo_title)) : ""}
            </h2>
            <p className={style.description}>
              {/* Our next-generation joinery factory is equipped with advanced machinery and staffed with skilled craftsmen, some with over 30 years of experience, enabling us to produce premium bespoke woodwork tailored to client specifications. With broad in-house resources, we provide complete renovation and fit-out solutions across all sectors, from residential developments to hospitality, retail, leisure and commercial. We have collaborated with some of the best architects in the country to bring their visions to life, delivering exceptional craftsmanship and work. Clients trust our ability to meet precise requirements, even on large-scale projects. */}
              {stripPTags(data?.acf?.jo_description) || ""}
            </p>
          </div>

          {/* Right Image Section */}
          <div className={style.image_content}>
            <Image
              src={
                data?.acf?.jo_image?.url
                  ? data.acf.jo_image.url
                  : data?.acf?.jo_image?.sizes?.["1536x1536"]
                  ? data.acf.jo_image.sizes["1536x1536"]
                  : "/images/join_factory.png"
              }
              alt={data?.acf?.jo_image?.alt}
              width={800}
              height={600}
              className={style.factory_image}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinoryFactory;
