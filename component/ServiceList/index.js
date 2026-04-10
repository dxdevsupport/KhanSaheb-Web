import React, { useEffect, useState, useRef } from "react";
import CapabilityCard from "@/component/CapabilityCard";
import styles from "./ServiceList.module.scss";
import parse from "html-react-parser";
import AOS from "aos";
import "aos/dist/aos.css";
import useAxiosPublic from "@/libs/hooks/useAxiosPublic";
import { extractTextFromObject } from "@/libs/utils/helpers";

const ServiceList = ({ title, description, services: propServices }) => {
  const axios = useAxiosPublic();
  const [servicesData, setServicesData] = useState(propServices || []);
  const swiperRef = useRef(null);

  // Sync propServices if they change
  useEffect(() => {
    if (propServices && propServices.length > 0) {
      setServicesData(propServices);
    }
  }, [propServices]);

  // Helper to truncate text
  const limitWords = (text, limit) => {
    const safeText = extractTextFromObject(text);
    if (!safeText) return "";
    const words = safeText.split(/\s+/);
    if (words.length <= limit) return safeText;
    return words.slice(0, limit).join(" ") + "...";
  };

  // Fetch service details from API if no services available
  useEffect(() => {
    // If props are provided, don't fetch
    if (propServices && propServices.length > 0) return;
    
    // If we already have data (e.g. from previous fetch), don't fetch again
    if (servicesData.length > 0) return;

    const fetchServiceDetails = async () => {
      try {
        let rawServices = [];

        // Fetch ALL services
        const res = await axios.get(
          "/service?per_page=100&acf_format=standard&_embed&order=asc&orderby=menu_order",
        );
        rawServices = res.data || [];

        // Map to component format
        const services = await Promise.all(
          rawServices.map(async (service) => {
            const slug = service.slug || "";
            let image = "/images/capability_1.jpg";
            const getUrl = (img) => img?.url || img?.sizes?.["1536x1536"];

            if (service.featured_media && service._embedded?.["wp:featuredmedia"]) {
              const media = service._embedded["wp:featuredmedia"][0];
              image = getUrl(media) || image;
            }

            if (service.acf?.service_image) {
              image = getUrl(service.acf.service_image) || image;
            }

            if (service.acf?.hm_ser_image) {
               const hmImg = service.acf.hm_ser_image;
               if (typeof hmImg === "object") {
                 image = getUrl(hmImg) || image;
               }
            }

            const description = limitWords(
              service.excerpt?.rendered ||
              service.acf?.summary ||
              service.acf?.hm_intro ||
              "",
              30,
            );

            return {
              image,
              title: extractTextFromObject(service.title?.rendered) || "",
              description,
              link: `/services/${slug}`,
            };
          }),
        );

        setServicesData(services);
      } catch (error) {
        console.error("Error fetching service details:", error);
      }
    };

    fetchServiceDetails();
  }, [propServices, servicesData.length]);

  const displayServices = servicesData.length > 0 ? servicesData : [];

  return (
    <section className={styles.serviceListSection}>
      <div className="container">
        <div
          className={styles.capabilitiesHeader}
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="200"
        >
          <h2>{extractTextFromObject(title) ? parse(extractTextFromObject(title)) : ""}</h2>
          <div className="main_paragraph">
            {extractTextFromObject(description) ? parse(extractTextFromObject(description)) : ""}
          </div>
        </div>

        <div className={styles.capabilitiesGrid}>
          {displayServices.map((capability, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay={300 + index * 150}
            >
              <CapabilityCard
                image={capability.image}
                title={capability.title}
                description={capability.description}
                link={capability.link}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceList;
