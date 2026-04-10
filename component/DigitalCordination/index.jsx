import React, { useEffect, useState, useRef, isValidElement } from "react";
import style from "./digitalCordimnation.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";
import parse from "html-react-parser";

function DigitalCordination({ bgImg, title, description }) {
	const sectionRef = useRef(null);
	const backgroundRef = useRef(null);
	const [parallaxOffset, setParallaxOffset] = useState(0);

	return (
		<div className={style.digital_cordination_section} ref={sectionRef}
		style={{
			backgroundImage: `url('${bgImg}')`,
		}}
		>
			<div className="container">
				<div className={style.content_box}>
					<h2 className={style.title}>
						{isValidElement(title)
							? title
							: parse(extractTextFromObject(title))}
					</h2>
					<div className={style.description}>
						{isValidElement(description) || Array.isArray(description)
							? description
							: parse(extractTextFromObject(description))}
					</div>
				</div>
			</div>
			<div className={style.black_tringle}></div>
		</div>
	);
}

export default DigitalCordination;
