import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import style from "./serviceList.module.scss";
import CapabilityCard from "../CapabilityCard";
import parse from "html-react-parser";
import useAxiosPublic from "@/libs/hooks/useAxiosPublic";
import { extractTextFromObject } from "@/libs/utils/helpers";

function ServicesList({ data }) {
  
  const axios = useAxiosPublic();
  const [servicesData, setServicesData] = useState([]);
  const swiperRef = useRef(null);

  // Default fallback data
  const defaultCapabilitiesData = [];

  // Helper to truncate text
  const limitWords = (text, limit) => {
    const safeText = extractTextFromObject(text);
    if (!safeText) return "";
    const words = safeText.split(/\s+/);
    if (words.length <= limit) return safeText;
    return words.slice(0, limit).join(" ") + "...";
  };

  // Fetch service details from API
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        let rawServices = [];

        // 1. Determine source: specific selection or ALL services
        if (
          data?.acf?.ok_os_our_services &&
          data.acf.ok_os_our_services.length > 0
        ) {
          // Fetch specific services
          // To avoid N+1, we could fetch all and filter, but for now let's use Promise.all 
          // to ensure we get exactly what's asked, or use the existing pattern if it works.
          // However, to be robust against ID vs Object, let's normalize.
          const promises = data.acf.ok_os_our_services.map(async (item) => {
            const id = item.ID || item; // Handle object or ID
            if (!id) return null;
            try {
              const res = await axios.get(
                `/service/${id}?acf_format=standard&_embed`
              );
              return res.data;
            } catch (err) {
              return null;
            }
          });
          const results = await Promise.all(promises);
          rawServices = results.filter((s) => s !== null);
        } else {
          // Fetch ALL services if none selected (Fallback/Default behavior)
          const res = await axios.get(
            "/service?per_page=100&acf_format=standard&_embed"
          );
          rawServices = res.data || [];
        }

        // 2. Map to component format
        const services = await Promise.all(rawServices.map(async (service) => {
          const slug = service.slug || "";
          
          // Image handling with fallbacks and ID resolution
          let image = "/images/capability_1.jpg"; // Default
          
          // Helper to get URL from varied sources
          const getUrl = (img) => img?.url || img?.sizes?.["1536x1536"];

          if (service.featured_media && service._embedded?.["wp:featuredmedia"]) {
             const media = service._embedded["wp:featuredmedia"][0];
             image = getUrl(media) || image;
          }
          
          // Override with service_image if available
          if (service.acf?.service_image) {
             image = getUrl(service.acf.service_image) || image;
          }

          // Override with hm_ser_image if available (Highest priority in previous tasks)
          // Note: hm_ser_image might be an ID or Object. 
          if (service.acf?.hm_ser_image) {
            const hmImg = service.acf.hm_ser_image;
            if (typeof hmImg === 'object') {
               image = getUrl(hmImg) || image;
            } else if (typeof hmImg === 'number' || /^\d+$/.test(hmImg)) {
               // If it's an ID, we might need to fetch it, but to avoid N+1 during mapping,
               // we usually rely on _embed or pre-fetching. 
               // For now, let's fallback to what we have or try to fetch if critical.
               // But usually 'acf_format=standard' returns objects for image fields.
               // If it returns ID, it's tricky without another call.
               // Let's assume standard format returns object.
            }
          }

          // Description with truncation
          const description = limitWords(
            service.excerpt?.rendered ||
            service.acf?.summary ||
            service.acf?.hm_intro || 
            "", 
            30
          );

          return {
            image,
            title: service.title?.rendered || "",
            description,
            link: `/services/${slug}`,
          };
        }));

        setServicesData(services);
      } catch (error) {
        console.error("Error fetching service details:", error);
        setServicesData(defaultCapabilitiesData);
      }
    };

    fetchServiceDetails();
  }, [data]);

  const capabilitiesData =
    servicesData.length > 0 ? servicesData : defaultCapabilitiesData;

  const goToPrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const goToNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  return (
    <section className={`${style.header_container} pb_80 pt_80`}>
      <div className="container">
        <div className={`${style.title_and_navigation} hp_space_mb`}>
          <h2 className="main_title">
            {extractTextFromObject(data?.ok_os_title) ? parse(extractTextFromObject(data?.ok_os_title)) : ""}
          </h2>
           {extractTextFromObject(data?.ok_os_description) ? parse(extractTextFromObject(data?.ok_os_description)) : ""}
          <div className={style.mob_button_container}>
            <button
              className={style.navButtonPrev}
              onClick={goToPrev}
              aria-label="Previous slide"
            >
              <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.62915 12.3672L0.700087 6.53385L6.62915 0.700521"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={style.navButtonNext}
              onClick={goToNext}
              aria-label="Next slide"
            >
              <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.37085 0.700521L7.29991 6.53385L1.37085 12.3672"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className={style.capabilitiesSwiper}>
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Navigation]}
            spaceBetween={80}
            slidesPerView={3}
            loop={capabilitiesData.length > 3}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1100: {
                slidesPerView: 3,
                spaceBetween: 80,
              },
            }}
            className={style.swiper}
          >
            {capabilitiesData.map((capability, index) => (
              <SwiperSlide key={index} className={style.swiperSlide}>
                <CapabilityCard
                  image={capability.image}
                  title={capability.title}
                  description={capability.description}
                  link={capability.link}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            className={style.navButtonPrev}
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <svg
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.62915 12.3672L0.700087 6.53385L6.62915 0.700521"
                stroke="white"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className={style.navButtonNext}
            onClick={goToNext}
            aria-label="Next slide"
          >
            <svg
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.37085 0.700521L7.29991 6.53385L1.37085 12.3672"
                stroke="white"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default ServicesList;
