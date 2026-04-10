import React, { useRef, useState } from "react";
import Image from "next/image";
import OptimizedImage from "../OptimizedImage";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import styles from "./foundation.module.scss";
import parse from "html-react-parser";
import { getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";



// Foundation timeline data
const foundationData = [];

function Foundation({ data }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const swiperRef = useRef(null);

	// Transform API data to component format
	const getTimelineSections = () => {
		if (
			!data?.acf?.ts_timeline_sections ||
			data.acf.ts_timeline_sections.length === 0
		) {
			return foundationData;
		}

		return data.acf.ts_timeline_sections.map((section, index) => ({
			id: index + 1,
			year: extractTextFromObject(section.year) || "",
			title: extractTextFromObject(section.title) || "",
			description: extractTextFromObject(section.description) || "",
			image: section.image?.url
				? section.image.sizes["1536x1536"] || section.ts_b_image.url
				: foundationData[index]?.image || "/images/foundation-1.png",
			imageAlt: section.image?.alt || "Timeline"
		}));
	};

	const timelineSections = getTimelineSections();

	const handlePeriodClick = (periodIndex) => {
		if (swiperRef.current) {
			swiperRef.current.slideTo(periodIndex);
		}
	};

	const handlePrev = () => {
		if (swiperRef.current) {
			swiperRef.current.slidePrev();
		}
	};

	const handleNext = () => {
		if (swiperRef.current) {
			swiperRef.current.slideNext();
		}
	};

	// Get the selected period data
	const currentPeriod = timelineSections[activeIndex];
 
	return (
		<section className={styles.foundationSection}>
			<div className="container" >
				<div className={`${styles.introText} hp_space_mb`}>
					<div>
						{data?.acf?.ts_short_description
							? parse(extractTextFromObject(data.acf.ts_short_description))
							: ""}
					</div>
					<div className={styles.next_prev_btns}>
						<button onClick={handlePrev} aria-label="Previous period">
							<OptimizedImage
								src={"/images/icons/prev.svg"}
								alt="prev"
								width={12}
								height={6}
							/>
						</button>
						<button onClick={handleNext} aria-label="Next period">
							<OptimizedImage
								src={"/images/icons/next.svg"}
								alt="next"
								width={12}
								height={6}
							/>
						</button>
					</div>
				</div>

				<div className={styles.slideContent}>
					{/* Left side - Image with Swiper */}
					<div className={styles.imageSection}>
						<div className={styles.mainImage}>
							<Swiper
								onSwiper={(swiper) => {
									swiperRef.current = swiper;
								}}
								onTransitionStart={(swiper) => {
									// Update immediately when transition starts to hide/show correct thumbnails
									setActiveIndex(swiper.activeIndex);
								}}
								effect="fade"
								modules={[EffectFade]}
								fadeEffect={{
									crossFade: true,
								}}
								speed={600}
								allowTouchMove={false}
								className={styles.foundationSwiper}
							>
								{timelineSections.map((period) => (
									<SwiperSlide key={period.id} className={styles.swiperSlide}>
										<Image
										src={period.image}
										alt={period.imageAlt || period.title}
										width={600}
										height={500}
										className={styles.image}
									/>
									</SwiperSlide>
								))}
							</Swiper>
						</div>
					</div>

					{/* Right side - Content */}
					<div className={styles.content_right_section}>
						<div className={styles.contentSection}>
							<div className={styles.yearTitle}>
								<h2>{currentPeriod.year}</h2>
								<h3>{currentPeriod.title}</h3>
							</div>
							<p className={styles.description}>{currentPeriod.description}</p>

							<Link
								href={getCleanLink(data?.acf?.ts_link?.url)}
								className={`${styles.timelineBtn} common_btn text_lift_up_second`}
							>
								VIEW OUR TIMELINE
							</Link>
						</div>

						{/* Period thumbnails - showing all periods, hiding active one */}
						<div className={styles.periodThumbnails}>
							{timelineSections.map((period, index) => {
								const isActive = index === activeIndex;
								return (
									<div
										key={period.id}
										className={`${styles.thumbnail} ${
											isActive ? styles.thumbnailHidden : ""
										}`}
										onClick={() => !isActive && handlePeriodClick(index)}
									>
										<div className={styles.thumbnailImage}>
											<Image
												src={period.image}
												alt={period.year}
												width={200}
												height={150}
												className={styles.thumbImg}
											/>
										</div>
										<span className={styles.periodLabel}>{period.year}</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Foundation;
