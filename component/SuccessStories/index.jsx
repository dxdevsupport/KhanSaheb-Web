import React, { useEffect, useState } from "react";
import style from "./successStories.module.scss";
import OptimizedImage from "../OptimizedImage";
import parse from "html-react-parser";
import AOS from "aos";
import "aos/dist/aos.css";
import { extractTextFromObject } from "@/libs/utils/helpers";

// Default fallback data for success stories
const defaultSuccessStoriesData = [
  {
    id: 1,
    name: "Moh'd Arif",
    title: "Senior Site Agent",
    headline: "A 48-Year Career With Khansaheb",
    story:
      "I worked in Pakistan after completing my diploma before coming to Dubai. I joined Khansaheb in 1971 as an Electrical Chargehand with my first project being Air BP.",
    image: "/images/arif.png",
  },
  {
    id: 2,
    name: "Sarah Ahmed",
    title: "Project Manager",
    headline: "Leading Innovation in Construction",
    story:
      "Starting as a junior engineer, I've grown with Khansaheb for over 15 years, leading major infrastructure projects across the UAE and contributing to the company's digital transformation.",
    image: "/images/arif.png",
  },
  {
    id: 3,
    name: "Ahmed Hassan",
    title: "Senior Engineer",
    headline: "Building Tomorrow's Infrastructure",
    story:
      "From my first day at Khansaheb, I knew this was where I wanted to build my career. The company's commitment to excellence and innovation has allowed me to work on groundbreaking projects.",
    image: "/images/arif.png",
  },
  {
    id: 4,
    name: "Fatima Al-Zahra",
    title: "Operations Director",
    headline: "Empowering Teams, Delivering Excellence",
    story:
      "Khansaheb has provided me with opportunities to lead diverse teams and implement sustainable practices that have made a real difference in our community and industry.",
    image: "/images/arif.png",
  },
];

function SuccessStories({ data }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Transform API data to match component structure
  const successStoriesData =
    data?.acf?.cd_ss_stories?.map((story, index) => ({
      id: index + 1,
      name: extractTextFromObject(story.cd_ss_name) || "",
      title: extractTextFromObject(story.cd_ss_position) || "",
      headline: extractTextFromObject(story.cd_ss_title) || "",
      story: extractTextFromObject(story.cd_ss_short_description) || "",
      image:
        story.cd_ss_image?.url ||
        story.cd_ss_image?.sizes?.large ||
        "/images/avatar.png",
    })) || defaultSuccessStoriesData;

  const nextSlide = () => {
    const next = (currentSlide + 1) % successStoriesData.length;
    setCurrentSlide(next);
  };

  const prevSlide = () => {
    const prev =
      currentSlide === 0 ? successStoriesData.length - 1 : currentSlide - 1;
    setCurrentSlide(prev);
  };

  const currentStory = successStoriesData[currentSlide];

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <div className={style.container}>
      <div className={`container pt_80 pb_80`}>
        <div className= {`${style.header} hp_space_mb`}>
          <h2 className= {`${style.title} main_title`}>
            {data?.acf?.cd_ss_title ? parse(extractTextFromObject(data.acf.cd_ss_title)) : ""}
          </h2>
          <div className={style.navigation}>
            <button
              className={style.navButton}
              onClick={prevSlide}
              aria-label="Previous story"
            >
              <OptimizedImage
                src={"/images/icons/prev.svg"}
                alt="prev"
                width={12}
                height={6}
              />
            </button>
            <button
              className={style.navButton}
              onClick={nextSlide}
              aria-label="Next story"
            >
              <OptimizedImage
                src={"/images/icons/next.svg"}
                alt="next"
                width={12}
                height={6}
              />
            </button>
          </div>
        </div>

        <div className={style.swiperContainer}>
          <div className={style.swiper}>
            <div data-aos="fade-up" data-aos-delay="600">
              <div className={style.slide}>
                <div className={style.imageSection}>
                  <img
                    src={currentStory.image}
                    alt={currentStory.imageAlt || `Image of ${currentStory.name}`}
                    className={style.image}
                  />
                </div>
                <div className={style.contentSection}>
                  <div>
                    <h3 className={style.headline}>{currentStory.headline}</h3>
                    <p className={style.story}>{currentStory.story}</p>
                  </div>
                  <div className={style.nameTitle}>
                    <span className={`${style.name} ${style.boldText}`}>{currentStory.name}</span>
                    <div className={style.divider}></div>
                    <span className={`${style.name}`}>{currentStory.title}</span>
                  </div>
                </div>
                <div className={style.accentTriangle}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessStories;
