import React, { useRef, useEffect } from "react";
import OptimizedImage from "../OptimizedImage";
import style from "./groupValue.module.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

const GroupValue = ({ data, isDarkMode }) => {
  const valuesContainerRef = useRef(null);

  // Use data from props if available, otherwise use empty array
  const displayValues = data?.acf?.ci_gv_values || []; 

  // Background colors for the cards
  const backgroundColors = [
    "#E40032", // Group 1: Red - "We are one family"
    "#00B582", // Group 2: Green - "We empower lives"
    "#C7C1BB", // Group 3: Light Gray - "We transform communities"
    "#808081", // Group 4: Medium Gray - "We foster trust"
    "#525454", // Group 5: Dark Gray - "We pursue excellence"
    "#FAB815", // Group 6: Yellow/Gold - "We build the future"
  ];

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  // Handle wheel event to enable scrolling when mouse is over the container
  useEffect(() => {
    const container = valuesContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Check if mouse is over the container or its children
      const isOverContainer = container.contains(e.target);
      if (!isOverContainer) return;

      // Check if the container is scrollable
      const hasVerticalScroll = container.scrollHeight > container.clientHeight;
      if (!hasVerticalScroll) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollDelta = e.deltaY;
      const isScrollingDown = scrollDelta > 0;
      const isScrollingUp = scrollDelta < 0;

      // Use a small threshold for boundary detection (5px tolerance)
      const threshold = 5;
      const isAtTop = scrollTop <= threshold;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      // If at boundaries, allow page scroll
      if ((isScrollingDown && isAtBottom) || (isScrollingUp && isAtTop)) {
        return; // Allow default page scroll
      }

      // Check if we would scroll past boundaries
      const willScrollPastTop = scrollTop + scrollDelta < 0;
      const willScrollPastBottom =
        scrollTop + scrollDelta + clientHeight > scrollHeight;

      if (willScrollPastTop) {
        // Scroll to top and allow page scroll
        container.scrollTop = 0;
        return;
      }

      if (willScrollPastBottom) {
        // Scroll to bottom and allow page scroll
        container.scrollTop = scrollHeight - clientHeight;
        return;
      }

      // Otherwise, prevent page scroll and scroll the container
      e.preventDefault();
      e.stopPropagation();

      // Scroll the container
      container.scrollTop += scrollDelta;
    };

    // Use capture phase to catch events before they bubble
    container.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      container.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, []);

  return (
    <div className={`${style.header_container}`}>
      <div className="container">
        <h2
          className={`main_title ${
            isDarkMode ? style.darkTitle : ""
          } hp_space_mb`}
        >
          {extractTextFromObject(data?.acf?.ci_gv_main_title) || "Our Group Values"}
        </h2>
        <div className={style.content_grid}>
          <div className={style.image_section}>
            <OptimizedImage
              src={
                data?.acf?.ci_gv_main_image?.url || "/images/group-value.png"
              }
              alt={data?.acf?.ci_gv_main_image?.alt}
              width={600}
              height={400}
              className={style.group_image}
            />
          </div>
          <div className={style.values_section}>
            <div className={style.values_container} ref={valuesContainerRef}>
              {displayValues.map((value, index) => {
                const iconSrc =
                  value.ci_gv_icon?.url ||
                  (typeof value.ci_gv_icon === "string" &&
                    value.ci_gv_icon.trim()) ||
                  value.icon?.url ||
                  (typeof value.icon === "string" && value.icon.trim()) ||
                  null;

                return (
                  <div
                    key={value.id || index}
                    className={style.value_card}
                    style={{
                      backgroundColor:
                        value.backgroundColor ||
                        backgroundColors[index % backgroundColors.length],
                    }}
                  >
                    <div className={style.icon_container}>
                      {iconSrc && (
                        <OptimizedImage
                          src={iconSrc}
                          alt={
                            extractTextFromObject(value.ci_gv_icon?.alt) ||
                            extractTextFromObject(value.ci_gv_title) ||
                            extractTextFromObject(value.title) ||
                            "Value icon"
                          }
                          fill
                        />
                      )}
                    </div>
                    <div className={style.value_content}>
                      <h3 className={style.value_title}>
                        {value.ci_gv_title
                          ? parse(extractTextFromObject(value.ci_gv_title))
                          : ""}
                      </h3>
                      <p className={style.value_description}>
                        {value.ci_gv_description
                          ? parse(extractTextFromObject(value.ci_gv_description))
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupValue;
