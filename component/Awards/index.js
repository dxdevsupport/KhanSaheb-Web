import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Awards.module.scss";
import AOS from "aos";
import "aos/dist/aos.css";

const Awards = ({
	title,
	description,
	awards = [],
	defaultImage = "/images/award_placeholder.jpg",
}) => {
	const [activeIndex, setActiveIndex] = useState(0);

	// Don't render if no content provided
	if (!title || !awards || awards.length === 0) {
		return null;
	}

	const currentAward = awards[activeIndex];

	useEffect(() => {
		AOS.init({
			duration: 1000,
			easing: "ease-in-out",
			once: true,
			offset: 100,
		});
	}, []);

	useEffect(() => {
		// console.log("Active index changed to:", activeIndex);
		// console.log("Current award:", currentAward);
	}, [activeIndex, currentAward]);

	return (
		<section className={styles.awardsSection}>
			<div className="container">
				{/* Header Content */}
				<div className={styles.headerContent} data-aos="fade-up">
					<h2 className="main_title">{title}</h2>
					<p>{description}</p>
				</div>

				<div className={styles.awardsContent}>
					{/* Left Column - Image and Content */}
					<div className={styles.leftColumn} data-aos="fade-up">
						<div className={styles.imageContainer}>
							<Image
								src={currentAward.image || defaultImage}
								alt={currentAward.alt || currentAward.title}
								width={900}
								height={605}
								className={styles.awardImage}
								onLoad={() => console.log("Image loaded:", currentAward.image)}
							/>
						</div>
						<div className={styles.imageCaption}>
							<h5
								dangerouslySetInnerHTML={{ __html: currentAward.caption }}
							></h5>
							<p
								dangerouslySetInnerHTML={{ __html: currentAward.caption_text }}
							></p>
						</div>
					</div>

					{/* Right Column - Awards List */}
					<div className={styles.rightColumn} data-aos="fade-up">
						<div className={styles.awardsList}>
							{awards.map((award, index) => (
								<div
									key={index}
									className={`${styles.awardItem} ${
										activeIndex === index ? styles.active : ""
									}`}
									onMouseEnter={() => {
										//console.log("Hovering over award:", index, award.title);
										setActiveIndex(index);
									}}
									onMouseLeave={() => {
										// Keep the current active state, don't reset
									}}
								>
									<div className={styles.awardContent}>
										<h3 className={styles.awardTitle}>{award.title}</h3>
										{award.year && (
											<div
												className={styles.awardYear}
												dangerouslySetInnerHTML={{ __html: award.year }}
											></div>
										)}
									</div>
									<div className={styles.arrowIcon}>
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M9 18L15 12L9 6"
												stroke="#fff"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Awards;
