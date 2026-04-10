import React, { useEffect, useRef } from "react";
import style from "./welfareList.module.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import { extractTextFromObject } from "@/libs/utils/helpers";

// Default fallback data for welfare sections
const defaultWelfareData = [];

function WelfareList({ data, onInViewChange }) {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = React.useState(false);

  // Helper function to parse HTML list and extract items
  const parseFacilitiesList = (htmlInput) => {
    const htmlString = extractTextFromObject(htmlInput);
    if (!htmlString) return [];

    // Extract all <li> content using regex
    const liMatches = htmlString.match(/<li[^>]*>(.*?)<\/li>/g);

    if (!liMatches) return [];

    // Clean up each list item by removing HTML tags and decoding entities
    const items = liMatches.map((li) => {
      // Remove <li> tags and any class attributes
      let text = li.replace(/<li[^>]*>/, "").replace(/<\/li>/, "");
      // Decode HTML entities like &amp;
      text = text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/\//g, "/");
      return text.trim();
    });

    return items;
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  // Transform API data to match component structure
  const welfareData =
    data?.acf?.welfare_details?.map((item, index) => ({
      id: index + 1,
      title: extractTextFromObject(item.ew_wd_title) || "",
      items: parseFacilitiesList(item.ew_wd_facilities),
      image:
        item.ew_wd_image?.url ||
        item.ew_wd_image?.sizes?.large ||
        "/images/accomadation.png",
      imageAlt: extractTextFromObject(item.ew_wd_image?.alt),
    })) || defaultWelfareData;
  return (
    <div
      ref={sectionRef}
      className={`${style.welfare_section} pb_80 pt_80 ${isInView ? style.inView : ""}`}
    >
      <div className="container">
        <div className={style.welfare_grid}>
          {welfareData.map((section, index) => (
            <div
              key={section.id}
              data-aos="fade-up"
              data-aos-delay={index * 300}
            >
              <div className={style.welfare_item}>
                <div className={style.welfare_panel}>
                  <h3 className={style.welfare_title}>{section.title}</h3>
                  <ul className={style.welfare_list}>
                    {section.items.map((item, index) => (
                      <li key={index} className={style.welfare_list_item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={style.welfare_image}>
                  <img
                    src={section.image}
                    alt={section.imageAlt || section.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WelfareList;
