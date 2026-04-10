import React, { useEffect, useRef, useState } from "react";
import OptimizedImage from "../OptimizedImage";
import Link from "next/link";
import style from "./businessUnits.module.scss";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

// Default fallback data
const defaultBusinessUnitsData = [
  {
    id: 1,
    title: "Roads & Infrastructure",
    icon: "/images/icons/roads.svg",
    bgColor: "#FFB92A",
    link: "/roads-infrastructure",
  },
  {
    id: 2,
    title: "MEP",
    icon: "/images/icons/mep.svg",
    bgColor: "#7C7D7C",
    link: "/mep",
  },
  {
    id: 3,
    title: "Construction",
    icon: "/images/icons/construction.svg",
    bgColor: "#E40032",
    link: "/construction",
  },
  {
    id: 4,
    title: "Interior Fit-Out",
    icon: "/images/icons/interior.svg",
    bgColor: "#00C48D",
    link: "/interior-fitout",
  },
  {
    id: 5,
    title: "Joinery",
    icon: "/images/icons/joinery.svg",
    bgColor: "#003865",
    link: "/joinery",
  },
];

// Color mapping for different business units
const colorMap = {
  "ROADS & INFRASTRUCTURE": "#FFB92A",
  MEP: "#7C7D7C",
  CONSTRUCTION: "#E40032",
  INTERIORS: "#00C48D",
  "INTERIOR FIT-OUT": "#00C48D",
  JOINERY: "#003865",
};

const BusinessUnits = ({ data }) => {
  const containerRef = useRef(null);
  const backgroundRef = useRef(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Transform API data to match component structure
  const features = data?.acf?.ok_features;
  const businessUnitsData =
    features && features.length > 0
      ? features.map((unit, index) => {
          const title = extractTextFromObject(unit.title);
          return {
            id: index + 1,
            title: title || "",
            icon: unit.icon?.url
              ? unit.icon.url
              : unit.icon?.sizes?.["1536x1536"]
                ? unit.icon.sizes["1536x1536"]
                : "/images/icons/default.svg",
            bgColor: colorMap[title?.toUpperCase()] || "#003865",
            link: unit.link_if_any || "#.", // You can add link mapping if needed
          };
        })
      : defaultBusinessUnitsData;

  // Get background image from API
  const backgroundImage = isMobile
    ? data?.acf?.ok_background_image_mob?.url
    : data?.acf?.ok_background_image?.url;

  // Parallax effect for background image (works on all screen sizes)
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollY =
          window.pageYOffset || document.documentElement.scrollTop;

        // True parallax effect: background moves slower than scroll
        // When user scrolls down, background moves up at 50% speed
        const parallaxSpeed = 0.5; // Background moves at 50% of scroll speed
        const sectionTop = containerRef.current.offsetTop;
        const offset = (scrollY - sectionTop) * parallaxSpeed;

        setParallaxOffset(offset);
      }
    };

    // Check on mount
    handleScroll();
    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <>
      <section ref={containerRef} className={style.business_banner}>
        <div
          ref={backgroundRef}
          className={style.backgroundImage}
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        ></div>
        <div className={style.business_bg_overlay}></div>
        <div className="container pt_50">
          <div className={style.content_wrapper}>
            <div className={style.business_grid} data-aos="fade-up">
              {businessUnitsData.map((unit) => (
                <div key={unit.id} className={style.business_item}>
                  <div className={style.business_card_border}>
                    <Link
                      href={unit.link}
                      className={style.business_card}
                      style={{ backgroundColor: unit.bgColor }}
                    >
                      <div className={style.card_inner}>
                        <OptimizedImage
                          src={unit.icon}
                          alt={unit.imageAlt || unit.title}
                          width={60}
                          height={60}
                          className={style.business_icon}
                        />
                      </div>
                    </Link>
                  </div>
                  <span className={style.business_title}>{unit.title ? parse(String(unit.title)) : ""}</span>
                </div>
              ))}
            </div>

            <div
              className={style.bottom_text}
              data-aos="fade-up"
              data-aos-delay="600"
            >
              <h2>
                {data?.acf?.ok_bottom_text
                  ? parse(extractTextFromObject(data.acf.ok_bottom_text))
                  : ""}
              </h2>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BusinessUnits;
