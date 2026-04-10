import React, { isValidElement } from "react";
import style from "./healthSafety.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";
import parse from "html-react-parser";

function HealthAndSafety({ bgImg, title, description }) {
	return (
		<div
			className={style.health_safety_section}
			style={{
				backgroundImage: `url(${bgImg})`,
			}}
		>
			<div className={style.green_triangle}></div>
			<div className={style.bg_overlay}></div>
			<div className="container">
				<div className={style.content_wrapper}>
					<h2 className={style.heading}>
						{isValidElement(title) ? title : extractTextFromObject(title)}
					</h2>
					<div className={style.description}>
						{/* Our supplier management framework includes compliance with Khansaheb's stringent health, safety, and environmental requirements. Subcontractors and suppliers are expected to maintain safe working environments and meet all relevant project and legal standards. */}
						{isValidElement(description) || Array.isArray(description)
							? description
							: parse(extractTextFromObject(description))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default HealthAndSafety;
