import React, { useEffect, useMemo, useState } from "react";
import OptimizedImage from "../OptimizedImage";
import Link from "next/link";
import styles from "./OurSectors.module.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import parse from "html-react-parser";
import useSectorsServices from "@/libs/services/sectorsServices";
import { extractTextFromObject } from "@/libs/utils/helpers";

const OurSectors = ({
	title = "Our Sectors",
	sectors = [],
	onSectorSelect,
	selectedSector,
    data
}) => {
	const [activeSector, setActiveSector] = useState(selectedSector);
    const [fetchedSectors, setFetchedSectors] = useState([]);
    const { getSectors } = useSectorsServices();

    const finalTitle = data?.acf?.title || title;

    // Sync internal state with external prop if provided
    useEffect(() => {
        if (selectedSector !== undefined) {
            setActiveSector(selectedSector);
        }
    }, [selectedSector]);

    useEffect(() => {
        if (sectors.length === 0) {
            const fetchSectors = async () => {
                const data = await getSectors();
                if (data) setFetchedSectors(data);
            };
            fetchSectors();
        }
    }, [sectors.length]);

    const sectorsList = useMemo(() => (sectors.length > 0 ? sectors : fetchedSectors), [sectors, fetchedSectors]);


	useEffect(() => {
		AOS.init({
			duration: 1000,
			easing: "ease-in-out",
			once: true,
			offset: 100,
		});
	}, []);
 
	return (
		<section className={` ${styles.sectorsSection} pt_50`}>
			<div className="container">
				<div className={styles.sectorsHeader}>
					<h2 className="main_title">{extractTextFromObject(finalTitle)}</h2>
				</div>

				<div className={styles.sectorsContainerWrapper}>
					<div className={styles.sectorsContainer}>
						{sectorsList.map((sector, index) => (
							<div
								key={index}
								className={`${styles.sectorItem} ${
									activeSector === index ? styles.active : ""
								}`}
								onClick={() => {
									const newSector = activeSector === index ? null : index;
									setActiveSector(newSector);
									if (onSectorSelect) onSectorSelect(newSector);
								}}
							>
								<div className={styles.sectorContent}>
									<div className={styles.sectorIcon}>
										<OptimizedImage
												src={sector.icon}
												alt={sector.iconAlt || `${extractTextFromObject(sector.name)} icon`}
												width={40}
												height={40}
												priority={true}
											/>
									</div>
									<div
										className={styles.sectorName}
										dangerouslySetInnerHTML={{ __html: extractTextFromObject(sector.name) }}
									></div>
									{activeSector === index && (
										<div
											className={styles.closeIcon}
											onClick={(e) => {
												e.stopPropagation();
												setActiveSector(null);
												if (onSectorSelect) onSectorSelect(null);
											}}
										>
											<OptimizedImage
												src="/images/icons/close.svg"
												alt="Close"
												width={8}
												height={8}
												priority={true}
											/>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Active Sector Content */}
				{activeSector !== null && sectorsList[activeSector] && (
					<div
						key={activeSector}
						// data-aos="fade-up"
						// data-aos-delay="200"
						className={`${styles.activeSectorContent} pt_80`}
					>
						<h3 className="main_title hp_space_mb">
							{sectorsList[activeSector].title
								? parse(extractTextFromObject(sectorsList[activeSector].title))
								: ""}
						</h3>
						<p className={`${styles.activeSectorDescription} pb_space_mb`}>
							{sectorsList[activeSector].description ? parse(extractTextFromObject(sectorsList[activeSector].description)) : ""}
						</p>
						{sectorsList[activeSector].exploreLink && (
							<Link
								href={sectorsList[activeSector].exploreLink}
								className="common_btn text_lift_up_second"
							>
								Explore{" "}
								{sectorsList[activeSector].name
									? parse(extractTextFromObject(sectorsList[activeSector].name))
									: ""}
							</Link>
						)}
					</div>
				)}
			</div>
		</section>
	);
};

export default OurSectors;
