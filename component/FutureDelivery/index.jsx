import React, { useEffect } from "react";
import style from "./futureDelivery.module.scss";
import OptimizedImage from "@/component/OptimizedImage";
import AOS from 'aos';
import 'aos/dist/aos.css';
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";


function FutureDelivery({data}) {
  // Default features data as fallback
  const defaultFeaturesData = [
    {
      id: 1,
      icon: "/images/icons/BIM.svg",
      title: "BIM-integrated asset data",
    },
    {
      id: 2,
      icon: "/images/icons/BIM.svg",
      title: "Digital twin development",
    },
    {
      id: 3,
      icon: "/images/icons/BIM.svg",
      title: "IoT device integration",
    },
  ];

  // Use API data if available, otherwise use default data
  const featuresData = data?.acf?.dc_fc_properties && data.acf.dc_fc_properties.length > 0
    ? data.acf.dc_fc_properties
    : defaultFeaturesData;

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  return (
    <div className={`${style.header_container} pt_80 pb_80`}>
      <div className="container">
        <div className={style.content_container}>
          <h2 className="main_title hp_space_mb">
            {data?.acf?.dc_fc_title ? parse(extractTextFromObject(data.acf.dc_fc_title)) : ""}
          </h2>
          <div className={style.feature_text_p}>
            {data?.acf?.dc_fc_sub_title
              ? parse(extractTextFromObject(data.acf.dc_fc_sub_title))
              : ""}
          </div>

          <div className={style.features_container}>
            {featuresData.map((feature, index) => (
                <div key={feature.id || index} data-aos="fade-up" data-aos-delay={index * 200} className={style.feature_box}>
                  <OptimizedImage
                    src={
                      feature.icon?.url || feature.icon || defaultFeaturesData[index]?.icon || "/images/icons/BIM.svg"
                    }
                    alt={feature.text || feature.title}
                    width={57}
                    height={57}
                  />
                <p className={style.feature_text}>
                  {feature.text
                    ? parse(extractTextFromObject(feature.text))
                    : feature.text
                    ? feature.text
                    : ""}
                </p>
                </div>
            ))}
          </div>

          <div className={style.conclusion_desc}>
            {data?.acf?.dc_fc_bottom_description
              ? parse(extractTextFromObject(data.acf.dc_fc_bottom_description))
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}


export default FutureDelivery;
