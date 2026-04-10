import React, { useEffect } from "react";
import style from "../../detail.module.scss";
import Breadcrumb from "@/component/Breadcrumb";

import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import { axiosServer } from "@/libs/axios/axios";
import constants from "@/common/constants";
import { safeParse } from "@/libs/utils/helpers";

import { getGlobalScripts } from "@/libs/services/headerAndFooterServices";

function InsightDetails({ breadcrumbs, globalScripts }) {
  const breadcrumbItems = breadcrumbs || [
    { label: "Home", href: "/" },
    { label: "What's New", href: "/whatsnew/awards" },
    { label: "Insights", href: "/whatsnew/insights" },
    { label: "Insight Details", href: null },
  ];

  const socialMedia = [
    { name: "Facebook", icon: "/images/icons/fb-1.svg", path: "/" },
    { name: "X", icon: "/images/icons/x-1.svg", path: "/" },
    { name: "Instagram", icon: "/images/icons/insta-1.svg", path: "/" },
    { name: "LinkedIn", icon: "/images/icons/in-1.svg", path: "/" },
  ];

  const relatedNews = [
    {
      id: 1,
      title: "Khansaheb Managing Director Named Among Top Industry Leaders",
      date: "May 14, 2025",
    },
    {
      id: 2,
      title:
        "Khansaheb is named the main contractor for flagship project 'Serenia Living' on Palm Jumeirah",
      date: "May 14, 2025",
    },
    {
      id: 3,
      title: "Khansaheb wins at the Excellence and Creative Engineering Awards",
      date: "May 14, 2025",
    },
    {
      id: 4,
      title: "Khansaheb Managing Director Named Among Top Industry Leaders",
      date: "May 14, 2025",
    },
    {
      id: 5,
      title: "Khansaheb wins at the Excellence and Creative Engineering Awards",
      date: "May 14, 2025",
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <>

      <div className={style.header_container}>
        <div className="container">
          <Breadcrumb items={breadcrumbItems} detailpage={true} />
          <div className={style.detail_container}>
            <div className={style.social_media_containers}>
              <span>Share</span>
              <div className={style.social_media_list}>
                {socialMedia.map((item, index) => (
                  <div
                    key={index}
                    data-aos="fade-up"
                    data-aos-delay={index * 300}
                  >
                    <a href={item.path}>
                      <img src={item.icon} alt={item.name || "Social media icon"} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className={style.new_details_container} data-aos="fade-up">
              <h3>
                Khansaheb Civil Engineering Appointed Main Contractor for Dubai
                Exhibition Centre Expansion
              </h3>
              <span>October 11, 2018</span>
              <div className={style.desc_container}>
                <p>
                  Khansaheb Civil Engineering LLC has been named the main
                  contractor for Phase One of the Dubai Exhibition Centre (DEC)
                  expansion at Expo City Dubai.
                </p>
                <p>
                  This phase, set for completion by 2026, will expand the DEC's
                  capacity to 140,000 square metres, nearly 2.5 times its
                  current size of 58,000 square metres. Khansaheb’s scope covers
                  a 34,000m² South Hall and 30,000m² North Hall expansion,
                  including steel frame superstructures, composite cladding, MEP
                  installations, and seamless integration with the existing
                  exhibition space and systems. Movable partitions, meeting
                  rooms, and back-of-house areas will provide functional,
                  flexible event spaces.
                </p>
              </div>
              <div className={style.news_img_box}>
                <Image
                  src="/images/insight-2.png"
                  alt="Dubai Exhibition Centre expansion project"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className={style.desc_container}>
                <p>
                  The project follows a pre-construction period during which
                  Khansaheb collaborated with DWTC to ensure effective planning,
                  buildability, and cost management. This project underscores
                  Khansaheb’s longstanding relationship with DWTC, based on the
                  successful completion of numerous previous projects, and
                  provides a platform for future growth within the region’s
                  construction industry. Site works are now well underway with
                  the substructure works and first elements of structural steel
                  to the North and South Halls progressing well.
                </p>
                <p>
                  Amer Al Farsi, Vice President of Real Estate Development at
                  Dubai World Trade Centre said: "The expansion of Dubai
                  Exhibition Centre marks a significant milestone in
                  strengthening Dubai’s global leadership in the events and
                  exhibitions industry. This landmark development reflects our
                  commitment to creating an exceptional venue that will elevate
                  the city’s standing as a world-class destination for business
                  and events. We are pleased to appoint Khansaheb Civil
                  Engineering, a key partner in delivering a state-of-the-art
                  facility that aligns with Dubai’s ambitious vision. By
                  delivering a venue of this scale and excellence, we are
                  shaping the future of global events and driving sustainable
                  economic growth.”
                </p>
              </div>
            </div>

            <div className={style.related_news_container}>
              <h3>Related News</h3>
              <div className={style.related_news_list}>
                {relatedNews.map((news, index) => (
                  <div
                    key={news.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 300}
                    className={style.news_item}
                  >
                    <h4>{news.title}</h4>
                    <p>{news.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const pageResponse = await axiosServer.get(
      `/pages?slug=${constants.INSIGHTS}&acf_format=standard`
    );
    const parentPageData =
      Array.isArray(pageResponse.data) && pageResponse.data.length > 0
        ? pageResponse.data[0]
        : null;

    // Check if "Awards" (What's New) page has content
    let awardsHasContent = true;
    try {
      const awardsRes = await axiosServer.get(
        `/pages?slug=${constants.AWARDS.replace("/", "")}&_fields=id,acf&acf_format=standard`
      );
      if (awardsRes.data && awardsRes.data.length > 0) {
        const awardsPage = awardsRes.data[0];
        awardsHasContent =
          awardsPage.acf?.flexible_components &&
          awardsPage.acf.flexible_components.length > 0;
      } else {
        awardsHasContent = false;
      }
    } catch (e) {
      console.error("Error fetching Awards page:", e);
      awardsHasContent = false;
    }

    // Check if parent page (Insights) has content
    const parentHasContent =
      parentPageData?.acf?.flexible_components &&
      parentPageData.acf.flexible_components.length > 0;

    const breadcrumbs = [
      { label: "Home", href: "/" },
      { label: "What's New", href: awardsHasContent ? "/whatsnew/awards" : null },
      { 
        label: parentPageData?.title?.rendered ? safeParse(parentPageData.title.rendered) : "Insights", 
        href: parentHasContent ? "/whatsnew/insights" : null 
      },
      { label: "Insight Details", href: null },
    ];

    // Fetch Global Scripts
    const globalScripts = await getGlobalScripts();

    return {
      props: {
        breadcrumbs,
        globalScripts,
      },
    };
  } catch (error) {
    console.error("Error fetching Insight Details data (SSR):", error);
    return {
      props: {
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "What's New", href: "/whatsnew/awards" },
          { label: "Insights", href: "/whatsnew/insights" },
          { label: "Insight Details", href: null },
        ],
      },
    };
  }
}

export default InsightDetails;
