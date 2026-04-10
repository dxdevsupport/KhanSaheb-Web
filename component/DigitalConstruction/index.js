import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./DigitalConstruction.module.scss";
import parse from "html-react-parser";
import { getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";

const DigitalConstruction = ({ data, onInViewChange }) => {
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

	// Get background image from WordPress featured_media (featured image)
	// Priority: featured_media > ACF field (hm_bb_background_image) > fallback
	// const backgroundImage = data?.featured_media_details?.source_url
	// 	? data.featured_media_details.source_url
	// 	: data?.featured_media_details?.media_details?.sizes?.["1536x1536"]
	// 			?.source_url
	// 	? data.featured_media_details.media_details.sizes["1536x1536"].source_url
	// 	: data?.acf?.hm_bb_background_image?.url
	// 	? data.acf.hm_bb_background_image.url
	// 	: data?.acf?.hm_bb_background_image?.sizes?.["1536x1536"]
	// 	? data.acf.hm_bb_background_image.sizes["1536x1536"]
	// 	: "/images/construction_pic.jpg";
	const backgroundImage = isMobile
		? data?.acf?.hm_bb_main_image_mob?.url
		: data?.acf?.hm_bb_main_image?.url;
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
	// IntersectionObserver to detect when section is in viewport
	useEffect(() => {
		if (!sectionRef.current || !onInViewChange) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				onInViewChange(entry.isIntersecting);
			},
			{
				threshold: 0.4, // Trigger when 20% of the section is visible
				rootMargin: "0px",
			}
		);
		const currentRef = sectionRef.current;
		observer.observe(currentRef);
		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [onInViewChange]);
	return (
		<section ref={sectionRef} className={styles.digitalConstructionSection} 
		style={{
			backgroundImage: `url('${backgroundImage}')`,
			
		}}>
			<div className={`${styles.container} container`}>
				<div className={styles.contentLeft}>
					<span className="tag">{data?.acf?.hm_bb_sub_caption ? parse(extractTextFromObject(data.acf.hm_bb_sub_caption)) : ""}</span>
					<h2 className="main_title">
						{parse(extractTextFromObject(data?.acf?.hm_bb_main_caption))}
					</h2>
					{parse(extractTextFromObject(data?.acf?.hm_bb_description))}
					<Link
						href={getCleanLink(data?.acf?.hm_bb_button?.url)}
						className="common_btn text_lift_up_second"
					>
						{data?.acf?.hm_bb_button?.title ? parse(extractTextFromObject(data.acf.hm_bb_button.title)) : ""}
					</Link>
				</div>
			</div>
			<div className="greenTriangle"></div>
			<div className="redTriangle"></div>
			<div className="blackTriangle"></div>
		</section>
	);
};
export default DigitalConstruction;
