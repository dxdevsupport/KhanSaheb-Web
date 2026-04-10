import React from "react";
import Image from "next/image";
import styles from "./InnerBanner.module.scss";

const InnerBanner = ({
	title,
	backgroundImage,
	subtitle,
	bgOverlay,
	viewHeightBg,
	backgroundVideo,
	titleTag = "h1",
}) => {
	return (
		<section
			className={`${styles.innerBanner} ${viewHeightBg && styles.view_height_banner}`}
		>
			{backgroundVideo ? (
				<video
					className={styles.backgroundVideo}
					poster={backgroundImage}
					autoPlay
					loop
					muted
					playsInline
				>
					<source src={backgroundVideo} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			) : (
				backgroundImage && (
					<Image
						src={backgroundImage}
						alt=""
						fill
						className={styles.backgroundImage}
						sizes="100vw"
						priority
						quality={60}
						style={{ objectFit: "cover", objectPosition: "center" }}
					/>
				)
			)}
			{bgOverlay && <div className={styles.overlay}></div>}
			 
			{(title || subtitle) && (
				<div className={`${styles.container} container`}>
					<div
						data-aos="fade-up"
						data-aos-delay="1200"
						className={styles.content}
					>
						{title && React.createElement(titleTag, { className: styles.title }, title)}
						{subtitle && <p className={styles.subtitle}>{subtitle}</p>}
					</div>
				</div>
			)}
			<div className={styles.greenTriangle}></div>
			<div className={styles.redTriangle}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 438 506"
					fill="none"
				>
					<foreignObject x="-20" y="-20">
						<div
							xmlns="http://www.w3.org/1999/xhtml"
							style={{
								backdropFilter: "blur(10px)",
								clipPath: "url(#bgblur_0_5619_7616_clip_path)",
								height: "100%",
								width: "100%",
							}}
						></div>
					</foreignObject>
					<g style={{ mixBlendMode: "overlay" }} data-figma-bg-blur-radius="20">
						<path d="M438 506V0H0L438 506Z" fill="#D1002E" />
					</g>
					<defs>
						<clipPath
							id="bgblur_0_5619_7616_clip_path"
							transform="translate(20 20)"
						>
							<path d="M438 506V0H0L438 506Z" />
						</clipPath>
					</defs>
				</svg>
			</div>
		</section>
	);
};

export default InnerBanner;
