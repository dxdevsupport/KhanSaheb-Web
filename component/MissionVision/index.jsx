import React, { useEffect, useRef, useState } from "react";
import style from "./missionVision.module.scss";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

const missionVisionData = [
  {
    id: 1,
    title: "Our Mission",
    description:
      "Delivering an Excellent Service for Our Customers and Contributing to the Development of Our Nation.",
    image: "/images/mission.png",
    alt: "Construction workers with safety equipment",
  },
  {
    id: 2,
    title: "Our Vision",
    description:
      "To continuously excel as a dynamic, diversified and differentiated Group, enriching the legacy of integrity built over generations and powering a strong and sustainable future for our people, communities and nation.",
    image: "/images/vision.png",
    alt: "Large construction site with multiple buildings",
  },
];

function MissionVision({ data }) {
  // Use data from props if available, otherwise use default data
  const displayData = data && data.length > 0 ? data : missionVisionData;
  const sectionRef = useRef(null);

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
      ref={sectionRef}
      className={`${style.header_container} pb_80 pt_80`}
    >
      <div className="container">
        <div className={style.content_grid}>
          {displayData.map((item, index) => (
              <div key={index} data-aos="fade-up" data-aos-delay={index * 300} className={style.mission_vision_card}>
                <div className={style.image_container}>
                  <Image
                    src={
                      item.ci_mv_image?.url
                        ? item.ci_mv_image.url
                        : item.image
                        ? item.image
                        : index === 0
                        ? "/images/mission.png"
                        : "/images/vision.png"
                    }
                    alt={item.alt || extractTextFromObject(item.ci_mv_title)}
                    fill
                    className={style.image}
                  />
                </div>
                <div className={style.text_content}>
                  <h3 className={style.title}>
                    {item.ci_mv_title
                      ? parse(extractTextFromObject(item.ci_mv_title))
                      : item.title
                      ? extractTextFromObject(item.title)
                      : ""}
                  </h3>
                  <p className={style.description}>
                    {item.ci_mv_description
                      ? parse(extractTextFromObject(item.ci_mv_description))
                      : item.description
                      ? extractTextFromObject(item.description)
                      : ""}
                  </p>
                </div>
                <div className={style.green_triangle}></div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MissionVision;
