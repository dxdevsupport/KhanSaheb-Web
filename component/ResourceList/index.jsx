import React from "react";
import style from "./resources.module.scss";
import OptimizedImage from "../OptimizedImage";
import { extractTextFromObject } from "@/libs/utils/helpers";

// Fallback data in case API data is not available
const defaultResourcesData = [
  {
    id: 1,
    icon: "/images/icons/operatives.svg",
    count: "4500",
    title: "Operatives",
    alt: "Operatives",
    description: "Cared for, rewarded & committed",
  },
  {
    id: 2,
    icon: "/images/icons/buses.svg",
    count: "118",
    title: "Buses",
    alt: "Buses",
    description: "Minibuses and large buses",
  },
  {
    id: 3,
    icon: "/images/icons/trucks.svg",
    count: "147",
    title: "Trucks",
    alt: "Trucks",
    description: "Tippers, low loaders, tankers",
  },
  {
    id: 4,
    icon: "/images/icons/stafs.svg",
    count: "1000",
    title: "staff",
    alt: "Staff",
    description: "Motivated, committed and enthusiastic",
  },
  {
    id: 5,
    icon: "/images/icons/pavers.svg",
    count: "48",
    title: "Pavers",
    alt: "Pavers",
    description: "Cared for, rewarded & committed",
  },
  {
    id: 6,
    icon: "/images/icons/cranes.svg",
    count: "117",
    title: "Cranes",
    alt: "Cranes",
    description: "Tower cranes, mobiles, hiabs",
  },
];

function ResourcesList({ data }) {
  // Transform API data to match component structure
  const resourcesData =
    data?.acf?.our_resources?.map((resource, index) => {
      const title = extractTextFromObject(resource.title);
      const description = extractTextFromObject(resource.description);
      return {
        id: index + 1,
        icon: resource.icon?.url
          ? resource.icon.url
          : resource.icon?.sizes?.["1536x1536"]
          ? resource.icon.sizes["1536x1536"]
          : "/images/icons/default.svg",
        title: title || "",
        alt:
          extractTextFromObject(resource.or_feature_icon?.alt) ||
          title ||
          "",
        description: description?.trim() || "",
      };
    }) || defaultResourcesData;
  return (
    <div className={`${style.resources_section} pt_80 pb_80`}>
      <div className="container">
        <div className={style.resources_grid}>
          {resourcesData.map((resource) => (
            <div key={resource.id} data-aos="fade-up" data-aos-delay="600">
              <div className={style.resource_card}>
                <div className={style.corner_accent}></div>
                <div className={style.card_content}>
                  <div className={style.icon_wrapper}>
                    <OptimizedImage
                      src={resource.icon}
                      alt={resource.alt}
                      fill
                      quality={100}
                    />
                  </div>
                  <h3 className={style.count}>
                    {resource.count
                      ? `${resource.count} ${resource.title}`
                      : resource.title}
                  </h3>
                  <p className={style.description}>{resource.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResourcesList;
