import React, { useState, useEffect, useRef } from "react";
import styles from "./safetySystem.module.scss";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

function SafetySystem({ data }) {
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

	useEffect(() => {
		const handleScroll = () => {
			if (sectionRef.current) {
				const scrollY =
					window.pageYOffset || document.documentElement.scrollTop;

				// True parallax effect: background moves slower than scroll
				// When user scrolls down, background moves up at 50% speed
				const parallaxSpeed = 0.5; // Background moves at 50% of scroll speed
				const sectionTop = sectionRef.current.offsetTop;
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
		<div className={styles.safetySystemContainer} ref={sectionRef}>
			<div
				ref={backgroundRef}
				className={styles.backgroundImage}
				style={{
					backgroundImage: `url('${
						isMobile
							? data?.acf?.hs_fw_image_mob?.url || "/images/safety-system.png"
							: data?.acf?.hs_fw_image?.url || "/images/safety-system.png"
					}')`,
				}}
			></div>

			{/* Triangular overlays */}
			<div className={styles.redTriangle}></div>
			<div className={styles.greenTriangle}></div>

			{/* Content box */}
			<div className="container">
				<div data-aos="fade-up" className={styles.contentBox}>
					<h2 className={styles.title}>
						{data?.acf?.hs_fw_title ? parse(extractTextFromObject(data.acf.hs_fw_title)) : ""}
					</h2>
					<p className={styles.description}>
						{data?.acf?.hs_fw_short_description
							? parse(extractTextFromObject(data.acf.hs_fw_short_description))
							: ""}
					</p>
				</div>
			</div>
		</div>
	);
}

export default SafetySystem;
