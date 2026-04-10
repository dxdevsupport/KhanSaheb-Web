import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./CapabilityCard.module.scss";
import { getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";

const CapabilityCard = ({ image, imageAlt, title, description, link }) => {
	const contentRef = useRef(null);
	const buttonRef = useRef(null);
	const textContentRef = useRef(null);
	const [buttonHeight, setButtonHeight] = useState(60);

	return (
		<div className={styles.capabilityCard}>
			<div className={styles.imageWrapper}>
				<Image src={image} alt={imageAlt || extractTextFromObject(title)} fill className={styles.cardImage} />
				<div className={styles.greenAccent}></div>
			</div>
			<div className={styles.content} ref={contentRef}>
				<div className={styles.textContent} ref={textContentRef}>
					<h3 className={styles.title}>{extractTextFromObject(title)}</h3>
					<p>{extractTextFromObject(description)}</p>
				</div>
				<Link
					href={getCleanLink(link)}
					className={`${styles.exploreButton} common_white_btn text_lift_up_second`}
					ref={buttonRef}
				>
					Explore {extractTextFromObject(title)}
				</Link>
			</div>
		</div>
	);
};

export default CapabilityCard;
