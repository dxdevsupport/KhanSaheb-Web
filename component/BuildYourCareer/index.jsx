import React, { useEffect, useState } from "react";
import style from "./buildYourCareer.module.scss";
import parse from "html-react-parser";
import OptimizedImage from "../OptimizedImage";
import AOS from "aos";
import "aos/dist/aos.css";
import { extractTextFromObject } from "@/libs/utils/helpers";

function BuildYourCareer({ data }) {
  const [activeTab, setActiveTab] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  // Default fallback data
  const defaultTabContent = [
    {
      id: 0,
      label: "Operatives and Tradesmen",
      title: "Operatives and Tradesmen",
      description: [
        "Our operative training provides courses at both basic and advanced levels. Our 4000 sq ft training facility in Al Quoz includes dedicated areas for electrical, plumbing, ductwork and chilled water training as well as a classroom to teach theory modules such as health and safety.",
        "All training is delivered by our in-house training team and structured around a defined training calendar with two phases that cover individual courses for each discipline.",
      ],
      image: "/images/Delano-Hotel-Entrance.png",
    },
    {
      id: 1,
      label: "Front Line Supervisors",
      title: "Front Line Supervisors",
      description: [
        "Our front line supervisors play a crucial role in managing day-to-day operations and ensuring quality standards. We provide comprehensive leadership training programs that focus on team management, safety protocols, and operational excellence.",
        "Supervisors receive specialized training in communication skills, conflict resolution, and performance management to lead their teams effectively and maintain high productivity standards.",
      ],
      image: "/images/Delano-Hotel-Entrance.png",
    },
    {
      id: 2,
      label: "Middle Managers",
      title: "Middle Managers",
      description: [
        "Middle management positions at Khansaheb offer opportunities to develop strategic thinking and leadership capabilities. Our management development programs include project management, budget planning, and team leadership skills.",
        "Managers participate in advanced training modules covering business strategy, stakeholder management, and operational efficiency to drive organizational success and team performance.",
      ],
      image: "/images/Delano-Hotel-Entrance.png",
    },
    {
      id: 3,
      label: "Senior Leadership",
      title: "Senior Leadership",
      description: [
        "Senior leadership roles at Khansaheb require strategic vision and executive capabilities. Our executive development programs focus on strategic planning, organizational transformation, and industry leadership.",
        "Senior leaders receive mentorship from industry experts and participate in high-level strategic initiatives that shape the future direction of our organization and drive sustainable growth.",
      ],
      image: "/images/Delano-Hotel-Entrance.png",
    },
  ];

  // Helper function to parse HTML description and extract paragraphs
  const parseDescription = (htmlString) => {
    if (!htmlString) return [];
    
    // Extract text if it's an object
    const text = extractTextFromObject(htmlString);

    // Split by paragraph tags and filter out empty strings
    const paragraphs = text
      .split(/<\/?p>/)
      .filter((p) => p.trim() && !p.includes("</p>"))
      .map((p) => p.trim());

    return paragraphs;
  };

  // Transform API data to match component structure
  const tabContent =
    data?.acf?.ts_career_details?.map((item, index) => ({
      id: index,
      label: extractTextFromObject(item.ts_tab_name) || "",
      title: extractTextFromObject(item.ts_tab_name) || "",
      description: parseDescription(item.ts_description),
      image:
        item.ts_image?.url ||
        item.ts_image?.sizes["1536x1536"] ||
        "/images/Delano-Hotel-Entrance.png",
    })) || [];

  // Preload all tab images when component mounts or data changes
  useEffect(() => {
    if (tabContent.length > 0) {
      tabContent.forEach((tab) => {
        if (tab.image) {
          const img = new window.Image();
          img.onload = () => {
            // Image is preloaded and cached
          };
          img.src = tab.image;
        }
      });
    }
  }, [tabContent.length]);

  const currentContent = tabContent[activeTab];

  // Check if current image is already loaded (from preloading)
  useEffect(() => {
    if (currentContent?.image) {
      const img = new window.Image();
      img.onload = () => {
        setImageLoading(false);
      };
      img.onerror = () => {
        setImageLoading(false);
      };
      // Check if image is already cached
      img.src = currentContent.image;
      if (img.complete) {
        setImageLoading(false);
      }
    }
  }, [activeTab, currentContent?.image]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setImageLoading(true); // Reset loading state when tab changes
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <>
      <div className={style.career_section}>
        <div className="container">
          <h2 className="main_title hp_space_mb">
            {data?.acf?.ts_title ? parse(extractTextFromObject(data.acf.ts_title)) : ""}
          </h2>

          <div className={style.tab_container}>
            {tabContent.map((tab, index) => (
              <button
                key={tab.id}
                className={`${style.tab_button} green_tag text_lift_up_second ${
                  activeTab === tab.id ? style.active : ""
                }`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={style.content_section}>
        <div className={style.content_grid}>
          <div className={style.text_panel} key={`text-${activeTab}`}>
            <h3 className={style.content_title}>
              {currentContent?.title || ""}
            </h3>
            <div className={style.content_description}>
              {currentContent?.description.map((paragraph, index) => (
                <div key={index}>{paragraph || ""}</div>
              ))}
            </div>
          </div>
          <div className={style.image_panel} key={`image-${activeTab}`}>
            {imageLoading && <div className={style.shimmer_loader}></div>}
            <OptimizedImage
              src={currentContent?.image}
              alt={currentContent?.imageAlt || currentContent?.title}
              className={`${style.content_image} ${
                imageLoading ? style.image_loading : style.image_loaded
              }`}
              priority={activeTab === 0}
              fill
              onLoad={handleImageLoad}
              onError={handleImageLoad}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default BuildYourCareer;
