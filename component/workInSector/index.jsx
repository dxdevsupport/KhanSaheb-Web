import React, { useEffect } from "react";
import style from "./workInSector.module.scss";
import OptimizedImage from "@/component/OptimizedImage";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

function WorkInSector({ title = "Sectors we work in", sectors = [], activeSector = "" }) {
	const defaultSectors = [
		{
			id: 1,
			name: "Retail",
			icon: "/images/workIn.svg",
			link: "/our-sector/retail",
		},
		{
			id: 2,
			name: "Hospitality",
			icon: "/images/workIn.svg",
			link: "/our-sector/hospitality",
		},
		{
			id: 3,
			name: "Commercial",
			icon: "/images/workIn.svg",
			link: "/our-sector/commercial",
		},
		{
			id: 4,
			name: "Residential",
			icon: "/images/workIn.svg",
			link: "/our-sector/residential",
		},
		{
			id: 5,
			name: "Infrastructure & Government",
			icon: "/images/workIn.svg",
			link: "/our-sector/infrastructure",
		},
		{
			id: 6,
			name: "Manufacturing & Industrial",
			icon: "/images/workIn.svg",
			link: "/our-sector/manufacturing",
		},
		{
			id: 7,
			name: "Education & Healthcare",
			icon: "/images/workIn.svg",
			link: "/our-sector/education",
		},
		{
			id: 8,
			name: "Sports & Leisure",
			icon: "/images/workIn.svg",
			link: "/our-sector/sports",
		},
	];

	const sectorsToDisplay = sectors.length > 0 ? sectors : [];

	useEffect(() => {
		AOS.init({
			duration: 1000,
			easing: "ease-in-out",
			once: true,
			offset: 100,
		});
	}, []);

	return (
		<div className={`${style.work_sectors_section} pb_80 pt_80`}>
			<div className="container">
				<h2 className="main_title hp_space_mb">{title}</h2>
				<div className={style.sectors_grid}>
					<Swiper
						modules={[Autoplay]}
						loop={true}
						autoplay={{
							delay: 2000,
							disableOnInteraction: false,
						}}
						speed={600}
						spaceBetween={20}
						slidesPerView={8}
						breakpoints={{
							0: {
								slidesPerView: 1,
								spaceBetween: 20,
							},
							540: {
								slidesPerView: 2,
								spaceBetween: 20,
							},
							768: {
								slidesPerView: 4,
								spaceBetween: 20,
							},
							1100: {
								slidesPerView: 6,
								spaceBetween: 20,
							},
              1400: {
								slidesPerView: 7,
								spaceBetween: 20,
							},
							1600: {
								slidesPerView: 8,
								spaceBetween: 20,
							},
						}}
						className={style.swiper}
					>
						{sectorsToDisplay.map((sector, index) => {
							const isActive = activeSector && sector.name && 
								activeSector.toLowerCase().trim() === sector.name.toLowerCase().trim();
							
							return (
								<SwiperSlide key={sector.id} className={style.swiper_slide}>
									<div>
										<div className={`${style.sector_card} ${isActive ? style.active : ""}`}>
											<OptimizedImage
										src={sector.icon}
										alt={sector.iconAlt || `${sector.name} icon`}
										width={64}
										height={64}
											/>
											<div className={style.sector_name_container}>
											<h3 className={style.sector_name}>{sector.name}</h3>
											</div>
											<Link
												href={sector.link}
												className="common_btn"
												style={{ whiteSpace: "nowrap" }}
											>
												LEARN MORE
											</Link>
										</div>
									</div>
								</SwiperSlide>
							);
						})}
					</Swiper>
				</div>
				<div className={style.decorative_triangle_left}></div>
				<div className={style.decorative_triangle_right}></div>
			</div>
		</div>
	);
}

export default WorkInSector;
