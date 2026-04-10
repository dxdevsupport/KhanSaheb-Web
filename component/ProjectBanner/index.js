import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./ProjectBanner.module.scss";
import { safeParseDeep, safeParse, getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";

const ProjectBanner = ({ data, onInViewChange }) => {
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

  // Parallax effect for background image
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

  // IntersectionObserver to detect when section is in viewport
  useEffect(() => {
    if (!containerRef.current || !onInViewChange) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onInViewChange(entry.isIntersecting);
      },
      {
        threshold: 0.7, // Trigger when 50% of the section is visible
        rootMargin: "0px",
      },
    );

    const currentRef = containerRef.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onInViewChange]);

  const imageUrl = isMobile
    ? data?.acf?.main_image_mob_ex?.url
    : data?.acf?.main_image_ex?.url;

  return (
    <section
      ref={containerRef}
      className={styles.projectBanner}
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
    >
      <div className={styles.overlay}></div>

      <div className="container">
        <div className={styles.content}>
          <div className={styles.textContent}>
            <h2
              className={styles.title}
              dangerouslySetInnerHTML={{ __html: extractTextFromObject(data?.acf?.ex_title) }}
            ></h2>
            <div
              dangerouslySetInnerHTML={{
                __html: extractTextFromObject(data?.acf?.ex_short_description),
              }}
            ></div>
            <Link
              href={getCleanLink(data?.acf?.ex_button?.url)}
              className="common_btn text_lift_up_second"
            >
              {data?.acf?.ex_button?.title}
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Triangles */}
      <div className={`${styles.redTriangle} redTriangle`}></div>
    </section>
  );
};

export default ProjectBanner;
