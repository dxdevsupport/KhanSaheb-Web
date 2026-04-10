import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import styles from "./TimelineSlider.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";

const TimelineSliderV2 = ({ data }) => {
  const [lineHeight, setLineHeight] = useState(0);
  const [smoothLineHeight, setSmoothLineHeight] = useState(0);
  const [visibleContainers, setVisibleContainers] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAllItems, setShowAllItems] = useState(true);
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const pointerRefs = useRef([]);
  const containerRefs = useRef([]);
  const lineAnimationRef = useRef(null);
  const currentSmoothHeightRef = useRef(0);
  const targetHeightRef = useRef(0);


  // Map API timeline data to the expected format
  const timelineData = useMemo(() => {
    if (!data?.acf?.our_timeline_listing) return [];

    return data.acf.our_timeline_listing.map((item) => ({
      year: extractTextFromObject(item.year || item.otp_t_year || ""),
      title: extractTextFromObject(item.title || item.otp_t_title || ""),
      description: extractTextFromObject(item.description || item.otp_t_description || ""),
      image: item.image?.url
        ? item.image.url
        : item.image?.sizes?.["1536x1536"]
        ? item.image.sizes["1536x1536"]
        : item.otp_t_image?.url // Fallback to old key
        ? item.otp_t_image.url
        : "/images/img_placeholder.png", // Fallback image
    }));
  }, [data]);

  const displayedItems = useMemo(() => {
    return timelineData;
  }, [timelineData]);



  // Scroll handler to calculate line height and show/hide containers
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!sectionRef.current || !lineRef.current) {
            ticking = false;
            return;
          }

          const scrollPosition = window.scrollY;
          const viewportHeight = window.innerHeight;
          const sectionRect = sectionRef.current.getBoundingClientRect();
          const sectionTop = sectionRect.top + scrollPosition;
          const sectionHeight = sectionRect.height;

          let maxPointerPosition = sectionHeight;

          const displayedPointerRefs = pointerRefs.current.filter(
            (ref, index) => index < displayedItems.length
          );
          if (displayedPointerRefs.length > 0) {
            const lastPointer =
              displayedPointerRefs[displayedPointerRefs.length - 1];
            if (lastPointer) {
              const lastPointerRect = lastPointer.getBoundingClientRect();
              const lastPointerTop = lastPointerRect.top + scrollPosition;
              maxPointerPosition = lastPointerTop - sectionTop;
            }
          }

          // Calculate when section enters and exits viewport
          const entryPoint = sectionTop - viewportHeight;
          const exitPoint = sectionTop + maxPointerPosition;

          // Calculate scroll progress (0 to 100%) based on pointer positions
          let progress = 0;

          if (scrollPosition < entryPoint) {
            // Before section enters viewport
            progress = 0;
          } else if (scrollPosition >= exitPoint) {
            // After last pointer
            progress = 100;
          } else {
            // Within section range - calculate based on pointer positions
            const scrollRange = exitPoint - entryPoint;
            if (scrollRange > 0) {
              progress = ((scrollPosition - entryPoint) / scrollRange) * 100;
            }
          }

          // Clamp to valid range
          progress = Math.max(0, Math.min(100, progress));
          setLineHeight(progress);

          // Get line bottom position
          const lineRect = lineRef.current.getBoundingClientRect();
          const lineBottom = lineRect.top + lineRect.height + scrollPosition;

          // Check each pointer position and show/hide containers
          const containers = {};
          let closestIndex = 0;
          let closestDistance = Infinity;

          // Active threshold - lower value means items become active earlier (when coming into view)
          // Using a lower threshold so items activate when they're approaching the viewport
          const activeThreshold = 0.15; // Lower than 0.28 to activate earlier
          const viewportCenter =
            scrollPosition + viewportHeight * activeThreshold;

          // Also consider items that are coming into view from below
          const viewportBottom = scrollPosition + viewportHeight;

          // Only process displayed items
          pointerRefs.current.forEach((pointerRef, index) => {
            if (pointerRef && index < displayedItems.length) {
              const pointerRect = pointerRef.getBoundingClientRect();
              const pointerTop = pointerRect.top + scrollPosition;
              const pointerCenter =
                pointerRect.top + scrollPosition + pointerRect.height / 2;
              const pointerBottom = pointerRect.bottom + scrollPosition;

              // Show container when line bottom reaches or passes pointer position
              containers[index] = lineBottom >= pointerTop;

              // Calculate which item is closest to viewport center (active item)
              // Also consider items that are approaching from below (within 200px of viewport bottom)
              const distanceToCenter = Math.abs(viewportCenter - pointerCenter);

              // If item is coming into view from below (within 200px of viewport bottom), prioritize it
              const isApproaching =
                pointerTop > viewportBottom - 200 &&
                pointerTop < viewportBottom + 100;

              // Use a weighted distance - items approaching get priority
              const distance = isApproaching
                ? distanceToCenter * 0.5
                : distanceToCenter;

              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
              }
            }
          });

          setVisibleContainers(containers);
          setActiveIndex(closestIndex);

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [displayedItems.length]);

  // Smooth animation for line height
  useEffect(() => {
    targetHeightRef.current = lineHeight;

    const animate = () => {
      const target = targetHeightRef.current;
      const current = currentSmoothHeightRef.current;
      const delta = target - current;

      if (Math.abs(delta) < 0.1) {
        currentSmoothHeightRef.current = target;
        setSmoothLineHeight(target);
        lineAnimationRef.current = null;
        return;
      }

      // Smooth interpolation
      const easedHeight = current + delta * 0.15;
      currentSmoothHeightRef.current = easedHeight;
      setSmoothLineHeight(easedHeight);
      lineAnimationRef.current = requestAnimationFrame(animate);
    };

    if (lineAnimationRef.current) {
      cancelAnimationFrame(lineAnimationRef.current);
    }

    lineAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (lineAnimationRef.current) {
        cancelAnimationFrame(lineAnimationRef.current);
        lineAnimationRef.current = null;
      }
    };
  }, [lineHeight]);

  return (
    <section className={styles.timelineSliderSection} ref={sectionRef}>
      <div className="container">
        {displayedItems.map((item, index) => {
          const isReverse = index % 2 === 1;

          return (
            <div
              key={`timeline-item-${index}`}
              className={`${styles.timeline_line_pointer_container} ${
                isReverse ? styles.row_reverse : ""
              } ${activeIndex === index ? styles.active : ""}`}
              ref={(el) => {
                if (el) {
                  containerRefs.current[index] = el;
                }
              }}
              style={{
                opacity: visibleContainers[index] ? 1 : 0,
                visibility: visibleContainers[index] ? "visible" : "hidden",
                transition: "opacity 0.05s ease, visibility 0.1s ease",
              }}
            >
              <div
                className={styles.timeline_line_pointer}
                ref={(el) => {
                  if (el) {
                    pointerRefs.current[index] = el;
                  }
                }}
              >
                <div className={styles.markerArrow}></div>
              </div>
              <div
                className={`${styles.timeline_text_block} ${
                  visibleContainers[index]
                    ? index === 0 || index % 2 === 0
                      ? styles.animateLeftToRight
                      : styles.animateRightToLeft
                    : ""
                }`}
                style={{
                  animationDelay: index % 2 === 0 ? "0.15s" : "0.15s",
                }}
              >
                {item.year && <h4 className={styles.year}>{item.year}</h4>}
                {item.title && <h3 className={styles.title}>{item.title}</h3>}
                {item.description && (
                  <p className={styles.description}>{item.description}</p>
                )}
              </div>
              <div
                className={`${styles.timeline_img_block} ${
                  visibleContainers[index]
                    ? index % 2 === 0
                      ? styles.animateLeftToRight
                      : styles.animateRightToLeft
                    : ""
                }`}
                style={{
                  animationDelay: index % 2 === 0 ? "0.05s" : "0.05s",
                }}
              >
                <Image
                  src={item.image}
                  alt={item.imageAlt || item.title}
                  width={400}
                  height={300}
                  className={styles.timelineImage}
                />
              </div>
            </div>
          );
        })}

        <div
          className={styles.timeline_line}
          ref={lineRef}
          style={{ height: `${smoothLineHeight}%` }}
        ></div>
      </div>
    </section>
  );
};

export default TimelineSliderV2;
