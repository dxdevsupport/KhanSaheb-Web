import React, { useEffect, useRef, useState } from "react";
import style from "./joinUs.module.scss";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

function JoinUs({ data }) {
  const sectionRef = useRef(null);
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

  // Get background image URL
  const backgroundImage = isMobile ? data?.acf?.cd_js_image_mob?.url : data?.acf?.cd_js_image?.url
	
	return (
		<section className={style.joinUsSection} ref={sectionRef} 
		style={{
			backgroundImage: `url('${backgroundImage}')`,
		}}
		>
			<div className={style.container}>
				<div className={style.backgroundOverlay}></div>
				{/* <div ref={backgroundRef} className={style.backgroundImage} /> */}
				<div className={style.contentWrapper}>
					<div className={`container ${style.textSection}`}>
						<div className={style.textContent}>
							<span className={style.joinUsLabel}>
								{data?.acf?.cd_js_small_caption
									? parse(extractTextFromObject(data.acf.cd_js_small_caption))
									: ""}
							</span>
							<h1 className={style.mainHeading}>
								{data?.acf?.cd_js_main_caption
									? parse(extractTextFromObject(data.acf.cd_js_main_caption))
									: ""}
							</h1>
							<div className={style.subHeading}>
								{data?.acf?.cd_js_short_description
									? parse(extractTextFromObject(data.acf.cd_js_short_description))
									: ""}
							</div>
							<button className="white_bg_btn" onClick={() => window.location.href = data?.acf?.cd_js_button?.url || "/contact-us"}>
								{extractTextFromObject(data?.acf?.cd_js_button?.title)}
							</button>
						</div>
					</div>
				</div>
				{/* Corner Triangles */}
				<div className={style.cornerTriangleRed}></div>
				<div className={style.cornerTriangleGreen}></div>
			</div>
		</section>
	);
}

export default JoinUs;
