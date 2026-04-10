import React, { useState } from "react";
import Image from "next/image";
import styles from "./ProgressSection.module.scss";

const ProgressSection = ({
	imageUrl,
	imageAlt = "Modern luxury interior space",
	imageOrder = "left", // 'left' or 'right' to control image position
	tag,
	title,
	paragraphs = [],
}) => {
	const [imageHeight, setImageHeight] = useState(635); // Default fallback height

	// Don't render if no content provided
	if (!imageUrl || !title || !paragraphs || paragraphs.length === 0) {
		return null;
	}

	const handleImageLoad = (event) => {
		const img = event.target;
		const naturalHeight = img.naturalHeight;
		setImageHeight(naturalHeight);
	};

	return (
		<section className={styles.progressSection}>
			<div className="container">
				<div
					className={`${styles.contentWrapper} ${
						imageOrder === "right" ? styles.imageRight : styles.imageLeft
					}`}
				>
					{/* Image Section */}
					<div
						className={styles.imageSection}
						style={{ height: `${imageHeight}px` }}
						data-aos={imageOrder === "left" ? "fade-up" : "fade-up"}
						data-aos-delay="200"
					>
						<Image
							src={imageUrl}
							alt={imageAlt}
							width={635}
							height={imageHeight}
							className={styles.progressImage}
							onLoad={handleImageLoad}
						/>
					</div>

					{/* Text Content Section */}
					<div
						className={styles.textSection}
						data-aos={imageOrder === "left" ? "fade-up" : "fade-up"}
						data-aos-delay="400"
					>
						<span
							className={`${styles.tag} tag`}
							data-aos="fade-up"
							data-aos-delay="600"
						>
							{tag}
						</span>
						<h2
							className="main_title"
							data-aos="fade-up"
							data-aos-delay="700"
							dangerouslySetInnerHTML={{ __html: title }}
						></h2>
						<div className={styles.paragraphs}>
							{paragraphs.map((paragraph, index) => (
								<p
									key={index}
									data-aos="fade-up"
									data-aos-delay={800 + index * 100}
									dangerouslySetInnerHTML={{ __html: paragraph }}
								></p>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ProgressSection;
