import React, { useRef, useEffect, useState } from "react";
import style from "../SuccessStories/successStories.module.scss";
import OptimizedImage from "../OptimizedImage";

function SupportStories({
  title = "Supporting Success Stories",
  imageAlt = "Success story image",
  story = [
    "After graduating from UAE University with a Bachelor's degree in Electrical Engineering, UAE National Fatema Al Hebsi joined Khansaheb Civil Engineering's MEP Division in 2022 as a Trainee Engineer. With a strong commitment to continuous learning, together with guidance from our expert team, she progressed to Electrical Engineer in just two years.",
    "At Khansaheb Civil Engineering, we're proud to offer a structured growth programme that enables talented young Emiratis to progress and thrive in the industry.",
  ],
  imgUrl = "/images/ameera.png",
}) {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);


  return (
    <div
      ref={sectionRef}
      className={`${style.support_container} pt_80 pb_80`}
    >
      <div className={`container ${style.support_content}`} data-aos="fade-up">
        <div className={style.swiperContainer}>
          <div className={style.swiper}>
            <div className={style.slide} style={{ background: "#222423" }}>
              <div className={style.imageSection}>
                <OptimizedImage
                  src={imgUrl}
                  alt={imageAlt}
                  className={style.image}
                  fill
                />
              </div>
              <div
                className={style.contentSection}
                style={{ justifyContent: "center" }}
              >
                <div>
                  <h3 className={style.headline}>{title}</h3>
                  <div>
                    {story.map((item, index) => (
                      <div key={index} className={style.story}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={style.accentTriangle}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportStories;
