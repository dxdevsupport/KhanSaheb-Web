import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import InnerBanner from "@/component/InnerBanner";
import Breadcrumb from "@/component/Breadcrumb";
import { useMobileView } from "@/hooks/useMobileView";
import style from "./projectDetails.module.scss";
import ProjectData from "@/component/ProjectData";
import EnquireBox from "@/component/EnquireBox";
import VideoContainer from "@/component/VideoContainer";
import OtherProjects from "@/component/OtherProjects";
import useProjectsServices from "@/libs/services/projectsServices";
import parse from "html-react-parser";
import AOS from "aos";
import "aos/dist/aos.css";

// Components from Home
import HomeBanner from "@/component/HomeBanner";
import BuildingShowcase from "@/component/BuildingShowcase";
import Capabilities from "@/component/Capabilities";
import DigitalConstruction from "@/component/DigitalConstruction";
import CareerSection from "@/component/CareerSection";
import WhatsNew from "@/component/WhatsNew";

// Components from Our History
import ProjectBanner from "@/component/ProjectBanner";
import Foundation from "@/component/Foundation";
import LegacyFuture from "@/component/LegacyFuture";
import ExcellenceSection from "@/component/ExcellenceSection";
import GenericOverview from "@/component/GenericOverview";
import TimelineSliderV2 from "@/component/TimelineSlider";
import QuoteSection from "@/component/QuoteSection";
import LeadershipIntro from "@/component/LeadershipIntro";

// One Khansaheb Components
import BusinessUnits from "@/component/BusinessUnits";
import ServicesList from "@/component/ServicesList";
import OurPromise from "@/component/OurPromise";
import DarkOverview from "@/component/DarkOverview";
import ResourcesList from "@/component/ResourceList";
import JoinoryFactory from "@/component/JoinoryFactory";
import InvestTraining from "@/component/InvestTraining";
import IndustryStandards from "@/component/IndustryStandards";
import DescriptionSection from "@/component/DescriptionSection";
import StrongSupplierRelation from "@/component/StrongSupplierRelation";
import DigitalCordination from "@/component/DigitalCordination";
import WelfareAssurence from "@/component/WelfareAssurence";
import HealthAndSafety from "@/component/HealthAndsafety";
import ServiceList from "@/component/ServiceList";
import DigitalWorkflows from "@/component/DigitalWorkflows";
import AwardWinning from "@/component/AwardWinningExcellence";
import ProjectsShowcase from "@/component/ProjectsShowcase";
import OurSectors from "@/component/OurSectors";
import ProjectList from "@/component/ProjectList";
import SafetySystem from "@/component/SafetySystem";
import Klearing from "@/component/KLeraning";
import MissionVision from "@/component/MissionVision";
import GroupValue from "@/component/GroupValue";
import QualityImprove from "@/component/QualityImprove";
import DarkContentBox from "@/component/DarkContentBox";
import QualityPolicy from "@/component/QualityPolicy";
import QualitySafety from "@/component/QualitySafety";
import FutureDelivery from "@/component/FutureDelivery";
import WorkForce from "@/component/WorkForce";
import SupportStories from "@/component/SupportStories";
import JoinUs from "@/component/JoinUs";
import ReachOutTeam from "@/component/ReachOutTeam";
import LocationMap from "@/component/LocationMap";
import FaqCarousel from "@/component/faqCarousel";
import SuccessStories from "@/component/SuccessStories";
import BuildYourCareer from "@/component/BuildYourCareer";
import WelfareList from "@/component/WelfareList";
import CyberSecurity from "@/component/CyberSecurity";
import WorkInSector from "@/component/workInSector";
import TeamSection from "@/component/TeamSection";
import ContentEditor from "@/component/ContentEditor";

import useSectorsServices from "@/libs/services/sectorsServices";
import {
  safeParse,
  safeParseDeep,
  getProjectImage,
  getProjectTags,
  limitWords,
} from "@/libs/utils/helpers";
import { axiosServer } from "@/libs/axios/axios";

// Helper function to parse description and objectives from HTML (for OurPromise)
const parseDescriptionAndObjectives = (htmlString) => {
  if (!htmlString) return { description: "", objectives: [] };

  const paragraphMatches = htmlString.match(/<p>(.*?)<\/p>/gs);
  if (!paragraphMatches || paragraphMatches.length === 0) {
    return { description: "", objectives: [] };
  }

  const description = paragraphMatches[0].replace(/<\/?p>/g, "").trim();

  const objectives = [];
  for (let i = 1; i < paragraphMatches.length; i++) {
    const para = paragraphMatches[i].replace(/<\/?p>/g, "").trim();

    const strongMatches = para.match(
      /<strong>(.*?)<\/strong><br\s*\/?>\s*(.*?)(?=<strong>|$)/gs,
    );

    if (strongMatches) {
      strongMatches.forEach((match) => {
        const titleMatch = match.match(/<strong>(.*?)<\/strong>/);
        const descMatch = match.match(/<\/strong><br\s*\/?>\s*([^<]*)/);

        if (titleMatch && descMatch) {
          objectives.push({
            title: titleMatch[1].trim(),
            desc: descMatch[1].trim(),
          });
        }
      });
    }
  }

  return { description, objectives };
};

const parsePolicyList = (htmlString) => {
  if (!htmlString) return [];

  // Extract all <li> items
  const liMatches = htmlString.match(/<li[^>]*>(.*?)<\/li>/g);
  if (!liMatches) return [];

  const items = liMatches.map((li) => {
    let text = li.replace(/<li[^>]*>/, "").replace(/<\/li>/, "");
    // Decode HTML entities
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/\//g, "/")
      .trim();
    return text;
  });

  return items;
};

const LazyLandmarksSlider = dynamic(
  () => import("@/component/LandmarksSlider"),
  {
    ssr: false,
    loading: () => <div style={{ height: 480 }} />,
  },
);

// Combined Component Map
const COMPONENT_MAP = {
  // Standard ACF names
  content_editor: ContentEditor,
  home_banner: HomeBanner,
  building_showcase: BuildingShowcase,
  capabilities: Capabilities,
  projects_showcase: LazyLandmarksSlider,
  digital_construction: DigitalConstruction,
  career_section: CareerSection,
  video_section: VideoContainer,
  whats_new: WhatsNew,

  // Our History Layouts
  years_of_excellence: ExcellenceSection,
  legacy_future: LegacyFuture,
  foundation: Foundation,
  project_banner: ProjectBanner,
  inner_banner: InnerBanner,
  breadcrumb: Breadcrumb,
  generic_overview: GenericOverview,
  timeline_slider: TimelineSliderV2,
  quote_section: QuoteSection,
  team_section: LeadershipIntro,
  meet_our_team: TeamSection,

  // One Khansaheb Layouts
  business_units: BusinessUnits,
  services_list: ServicesList,
  video_overview: OurPromise,
  dark_overview: DarkOverview,
  resource_list: ResourcesList,
  joinery_factory: JoinoryFactory,
  invest_training: InvestTraining,
  industry_standards: IndustryStandards,
  description_section: DescriptionSection,
  supplier_relation: StrongSupplierRelation,
  digital_cordination: DigitalCordination,
  welfare_assurence: WelfareAssurence,
  health_and_safety: HealthAndSafety,
  services_list_with_dark_background: ServiceList,
  red_feature_block: DigitalWorkflows,
  award_section: AwardWinning,
  projects_section: ProjectsShowcase,
  our_sectors: OurSectors,
  selected_projects: ProjectList,
  our_projects: ProjectList,
  project_data: ProjectData,
  enquire_box: EnquireBox,
  other_projects: OtherProjects,
  invest_training_scm: InvestTraining,
  safety_system: SafetySystem,
  k_learning: Klearing,
  mission_vision: MissionVision,
  group_value: GroupValue,
  digital_work_flows: DigitalWorkflows,
  quality_improve: QualityImprove,
  dark_content_box: DarkContentBox,
  quality_policy: QualityPolicy,
  quality_safety: QualitySafety,
  future_delivery: FutureDelivery,
  work_force: WorkForce,
  support_stories: SupportStories,
  join_us: JoinUs,
  success_stories: SuccessStories,
  build_your_career: BuildYourCareer,
  welfare_list: WelfareList,
  resources_list: ResourcesList,
  cyber_security: CyberSecurity,
  reach_out_team: ReachOutTeam,
  location_map: LocationMap,
  faq: FaqCarousel,
  selected_sectors: WorkInSector,
};

import { getGlobalScripts } from "@/libs/services/headerAndFooterServices";

function ProjectDetails({
  initialProjectData,
  breadcrumbs,
  pageScripts,
  globalScripts,
}) {
  const isMobileView = useMobileView();
  const router = useRouter();
  const { slug } = router.query;
  const { getProjectBySlug, getAllProjects, getProjectsByIds } =
    useProjectsServices();
  const { getSectors } = useSectorsServices();
  const [projectData, setProjectData] = useState(initialProjectData || null);
  const [loading, setLoading] = useState(!initialProjectData);

  // State trackers
  const [isDigitalConstructionInView, setIsDigitalConstructionInView] =
    useState(false);
  const [isProjectBannerInView, setIsProjectBannerInView] = useState(false);
  const landmarksMountRef = useRef(null);
  const [mountLandmarks, setMountLandmarks] = useState(false);

  // Projects & Sectors Filter State
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [sectorProjectsMap, setSectorProjectsMap] = useState({});

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  useEffect(() => {
    // If we have initial data, don't fetch again unless slug changes and mismatches
    if (initialProjectData && initialProjectData.slug === slug) {
      setProjectData(initialProjectData);
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const response = await getProjectBySlug(slug);
        if (response && response.length > 0) {
          setProjectData(response[0]);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [slug, initialProjectData]);

  // Flexible Components Logic
  const flexibleComponents = projectData?.acf?.flexible_components || [];

  // Fetch Projects/Sectors Data if components are present
  useEffect(() => {
    const hasSectorsOrProjects = flexibleComponents?.some(
      (item) =>
        item.acf_fc_layout === "our_sectors" ||
        item.acf_fc_layout === "our_projects" ||
        item.acf_fc_layout === "selected_sectors",
    );

    if (hasSectorsOrProjects) {
      const fetchData = async () => {
        try {
          // Fetch sectors, categories and initial batch of projects for "All" view
          const [fetchedSectors, fetchedCategories, fetchedProjects] = await Promise.all([
            getSectors(),
            axiosServer.get("/project-category?per_page=100").then(res => res.data).catch(() => []),
            getAllProjects(100),
          ]);

          // Create sector map
          const sectorMap = {};
          if (fetchedSectors) {
            fetchedSectors.forEach((sec) => (sectorMap[sec.id] = sec.name));
          }
          if (fetchedCategories) {
            fetchedCategories.forEach((cat) => (sectorMap[cat.id] = cat.name));
          }

          // Helper to map project data
          const mapProject = (p) => {
            const categories = getProjectTags(p, sectorMap);

            return {
              id: p.id,
              title: p.title?.rendered
                ? safeParse(String(p.title.rendered))
                : "",
              categories: categories,
              image: getProjectImage(p),
              path: `/ourprojects/${p.slug || `project-${p.id}`}`,
              raw: p,
            };
          };

          if (fetchedProjects) {
            const mappedProjects = fetchedProjects.map(mapProject);
            setAllProjects(mappedProjects);
            setFilteredProjects(mappedProjects);
          }

          if (fetchedSectors) {
            setSectors(fetchedSectors);
            const newMap = {};

            // Fetch related projects for each sector specifically to ensure accuracy
            await Promise.all(
              fetchedSectors.map(async (sector, index) => {
                const relatedIds =
                  sector.acf?.os_rp_related_projects?.map((p) =>
                    typeof p === "object" ? p.ID : p,
                  ) || [];

                if (relatedIds.length > 0) {
                  try {
                    const relatedProjectsRaw =
                      await getProjectsByIds(relatedIds);
                    if (relatedProjectsRaw && relatedProjectsRaw.length > 0) {
                      const relatedProjectsMapped = relatedProjectsRaw.map(
                        (p) => ({
                          id: p.id,
                          title: p.title?.rendered || "",
                          categories: getProjectTags(p, sectorMap),
                          image: getProjectImage(p),
                          path: `/ourprojects/${p.slug}`,
                          raw: p,
                        }),
                      );
                      newMap[index] = relatedProjectsMapped;
                    } else {
                      newMap[index] = [];
                    }
                  } catch (err) {
                    newMap[index] = [];
                  }
                } else {
                  newMap[index] = [];
                }
              }),
            );

            setSectorProjectsMap(newMap);
          }
        } catch (error) {
          console.error("Error fetching filter data:", error);
        }
      };
      fetchData();
    }
  }, [flexibleComponents]);

  // Filter Logic
  useEffect(() => {
    if (selectedSector !== null) {
      setFilteredProjects(sectorProjectsMap[selectedSector] || []);
    } else {
      setFilteredProjects(allProjects);
    }
  }, [selectedSector, allProjects, sectorProjectsMap]);

  useEffect(() => {
    const el = landmarksMountRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMountLandmarks(true);
          io.disconnect();
        }
      },
      { root: null, threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const breadcrumbItems = breadcrumbs || [
    { label: "Home", href: "/" },
    { label: "Our Projects & Sectors", href: "/whatwedo/ourprojects" },
    {
      label: "Project Details",
      href: `/ourprojects/${slug}`,
    },
  ];

  const activeSectorName = (() => {
    const map = sectors.reduce((acc, sec) => {
      acc[sec.id] = sec.name;
      return acc;
    }, {});
    const tags = projectData ? getProjectTags(projectData, map) : [];
    return tags && tags.length > 0 ? tags[0] : "";
  })();

  // Helper function to strip HTML tags for meta content
  const stripHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  // Helper function to strip <p> tags
  const stripPTags = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/<\/?p>/g, "").trim();
  };

  // Get banner image from ACF fields
  const bannerImage =
    projectData?.acf?.im_in_hm_image?.url || projectData?.acf?.image?.url;

  // Get video URL from ACF fields
  const videoUrl =
    projectData?.acf?.ps_vs_video?.url ||
    projectData?.acf?.ps_vs_video ||
    "/videos/banner_video.mp4";

  // Get video background image
  const videoBackgroundImage =
    projectData?.acf?.ps_vs_background_image?.url ||
    projectData?.acf?.ps_vs_background_image ||
    null;

  const renderComponent = (item, index) => {
    const Component = COMPONENT_MAP[item.acf_fc_layout];

    if (!Component) {
      return null;
    }

    const Wrapper = ({ children }) => (
      <>
        <div id={item.acf_fc_layout} className={"component-wrapper mb-5"}>
          {children}
        </div>
      </>
    );

    // 1. Home Banner / Video / Standard Components
    if (item.acf_fc_layout === "video_section") {
      return (
        <Wrapper key={index}>
          <VideoContainer
            videoUrl={item.videoUrl?.url || ""}
            thumbImg={item.thumbnail?.url || ""}
            leftTriangle={true}
            fullHeight={true}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "digital_construction") {
      return (
        <Wrapper key={index}>
          <DigitalConstruction
            data={{ acf: item }}
            onInViewChange={setIsDigitalConstructionInView}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "career_section") {
      return (
        <Wrapper key={index}>
          <div>
            <CareerSection data={{ acf: item }} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "projects_showcase") {
      return (
        <Wrapper key={index}>
          <div
            ref={landmarksMountRef}
            className={`${isDigitalConstructionInView ? "darkModeSection" : ""} pt_80 pb_80`}
          >
            {mountLandmarks ? (
              <LazyLandmarksSlider data={{ acf: item }} />
            ) : (
              <div style={{ height: 480 }} />
            )}
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "our_sectors") {
      return (
        <Wrapper key={index}>
          <OurSectors
            title={item.ok_os_title}
            onSectorSelect={setSelectedSector}
            selectedSector={selectedSector}
            sectors={sectors}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "our_projects") {
      return (
        <Wrapper key={index}>
          <ProjectList
            title={item.ok_op_title}
            projects={filteredProjects.length > 0 ? filteredProjects : []}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "selected_projects") {
      const filteredProjects = item.related_projects || [];
      return (
        <Wrapper key={index}>
          <ProjectList
            title={item.op_title}
            projects={filteredProjects.length > 0 ? filteredProjects : []}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "project_data") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <ProjectData data={{ acf: item }} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "enquire_box") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <EnquireBox data={{ acf: item }} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "other_projects") {
      return (
        <Wrapper key={index}>
          <OtherProjects
            relatedProjects={item.related_projects}
            currentProjectId={projectData?.id}
          />
        </Wrapper>
      );
    }

    // 2. Our History Components
    if (item.acf_fc_layout === "years_of_excellence") {
      return (
        <Wrapper key={index}>
          <ExcellenceSection
            title={safeParse(item.oh_title)}
            description={safeParse(item.oh_description)}
            leftImage={item.oh_left_image}
            rightImage={item.oh_right_image}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "legacy_future") {
      return (
        <Wrapper key={index}>
          <LegacyFuture
            title={safeParse(item.oh_lm_main_title)}
            subHeading={safeParse(item.oh_lm_sub_title)}
            image={item.oh_lm_image?.url}
            description={[
              item.oh_lm_content ? parse(safeParse(item.oh_lm_content)) : "",
            ]}
            greenTriangle={item.oh_lm_green_triangle}
            bgColor={item.oh_lm_bgColor}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "foundation") {
      return (
        <Wrapper key={index}>
          <div className={isProjectBannerInView ? "darkModeSection" : ""}>
            <Foundation data={{ acf: safeParseDeep(item) }} />
          </div>
        </Wrapper>
      );
    }

    // Special handling: Selected Sectors (WorkInSector as flexible component)
    // DUPLICATE BLOCK REMOVED - using the improved logic below at line ~1100

    if (item.acf_fc_layout === "project_banner") {
      return (
        <Wrapper key={index}>
          <div className={isProjectBannerInView ? "darkModeSection" : ""}>
            <ProjectBanner
              data={{ acf: safeParseDeep(item) }}
              onInViewChange={setIsProjectBannerInView}
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "inner_banner") {
      return (
        <Wrapper key={index}>
          <InnerBanner
            title={safeParse(item.pcm_banner_title)}
            subtitle={safeParse(item.pcm_banner_subtitle)}
            backgroundImage={
              isMobileView && item?.pcm_banner_image_mob?.url
                ? item?.pcm_banner_image_mob.url
                : item?.pcm_banner_image?.url ||
                  item?.pcm_banner_image?.sizes?.["1536x1536"]
            }
            bgOverlay={item.pcm_banner_bgOverlay}
            viewHeightBg={item.pcm_banner_viewHeightBg}
            backgroundVideo={item.pcm_banner_backgroundVideo?.url}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "breadcrumb") {
      if (item.show_breadcrumb == 1) {
        return (
          <Wrapper key={index}>
            <Breadcrumb
              items={breadcrumbItems}
              background={item.dark_background}
            />
          </Wrapper>
        );
      }
      return null;
    }

    if (item.acf_fc_layout === "generic_overview") {
      return (
        <Wrapper key={index}>
          <GenericOverview
            maintitle={safeParse(item.maintitle)}
            subtitle={safeParse(item.subtitle)}
            content={item.content}
            bottom_black_box={safeParse(item.bottom_black_box) || false}
            title_black={safeParse(item.bottom_black_box_title) || ""}
            description_black={
              safeParse(item.bottom_black_box_description) || ""
            }
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "timeline_slider") {
      return (
        <Wrapper key={index}>
          <TimelineSliderV2 data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "quote_section") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600" className="pt_80">
            <QuoteSection
              quote={safeParse(item.quote)}
              authorName={safeParse(item.authorName)}
              authorTitle={safeParse(item.authorTitle)}
              authorImage={item.authorImage?.url}
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "team_section") {
      // Note: teamMembers prop is not currently passed to ProjectDetails,
      // so this will default to empty if not fetched.
      const displayTeamMembers = [];
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-duration="1000">
            <LeadershipIntro
              teamMembers={displayTeamMembers}
              showTeamMembers={item.show_team_members}
              meetOurTeamTitle={item.title}
              teamOverview={item.description}
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "video_overview") {
      const parsedData = parseDescriptionAndObjectives(item.content);

      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <OurPromise
              title={item.title ? parse(String(item.title)) : ""}
              desc={parsedData.content}
              objectives={parsedData.objectives}
              videoUrl={
                item.video?.url
                  ? item.video.url
                  : item.video?.sizes?.["1536x1536"]
                    ? item.video.sizes["1536x1536"]
                    : ""
              }
              thumbnail={item.background_image?.url}
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "business_units") {
      return (
        <Wrapper key={index}>
          <BusinessUnits data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "services_list") {
      return (
        <Wrapper key={index}>
          <ServicesList
            title={item.ok_os_title}
            description={item.ok_os_description}
            services={[]}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "dark_overview") {
      return (
        <Wrapper key={index}>
          <DarkOverview
            title={item.ok_title}
            description={item.ok_description}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "home_banner") {
      return (
        <Wrapper key={index}>
          <HomeBanner data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "building_showcase") {
      return (
        <Wrapper key={index}>
          <BuildingShowcase data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "capabilities") {
      return (
        <Wrapper key={index}>
          <Capabilities data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "joinery_factory") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <JoinoryFactory data={{ acf: item }} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "resources_list") {
      return (
        <Wrapper key={index}>
          <ResourcesList data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "invest_training") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <InvestTraining
              title={item.mep_title ? parse(String(item.mep_title)) : ""}
              description={stripPTags(item.mep_description) || ""}
              imageSrc={
                item.mep_image?.url
                  ? item.mep_image.url
                  : item.mep_image?.sizes?.["1536x1536"]
                    ? item.mep_image.sizes["1536x1536"]
                    : "/images/res_4.jpg"
              }
              imageAlt={
                item.mep_image?.alt || item.mep_title || "MEP project image"
              }
              buttonOne={item.scm_bt_button_1?.title || ""}
              buttonTwo={item.scm_bt_button_2?.title || ""}
              buttonOneLink={item.scm_bt_button_1?.url || "#."}
              buttonTwoLink={item.scm_bt_button_2?.url || "#."}
              greenTriangle={item.mep_green_triangle ? false : true}
              redTriangle={item.mep_red_triangle ? false : true}
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "industry_standards") {
      return (
        <Wrapper key={index}>
          <IndustryStandards
            title={
              item.interiors_title ? parse(String(item.interiors_title)) : ""
            }
            bgImg={
              isMobileView
                ? item.interiors_image_mob?.url
                : item.interiors_image?.url
            }
            desc={[stripPTags(item.interiors_description) || ""]}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "description_section") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <DescriptionSection
              desc={[
                item.or_description ? parse(String(item.or_description)) : "",
              ]}
              image={
                item.or_image?.url
                  ? item.or_image.url
                  : item.or_image?.sizes?.["1536x1536"]
                    ? item.or_image.sizes["1536x1536"]
                    : "/images/res_1.jpg"
              }
              title={item.or_sub_title}
              isHeaderMoreThan50Visible={true}
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "supplier_relation") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <StrongSupplierRelation
              title={item.scm_bx_title ? parse(String(item.scm_bx_title)) : ""}
              description={
                item.scm_bx_description
                  ? parse(String(item.scm_bx_description))
                  : ""
              }
              bgImg={item.scm_bx_image?.url || "/images/supply_1.jpg"}
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "digital_cordination") {
      return (
        <Wrapper key={index}>
          <div>
            <DigitalCordination
              title={item.scm_de_title ? parse(String(item.scm_de_title)) : ""}
              description={
                item.scm_de_description
                  ? parse(String(item.scm_de_description))
                  : ""
              }
              bgImg={
                isMobileView
                  ? item.scm_de_image_mob?.url || "/images/supply_2.jpg"
                  : item.scm_de_image?.url || "/images/supply_2.jpg"
              }
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "welfare_assurence") {
      return (
        <Wrapper key={index}>
          <WelfareAssurence
            title={item.scm_se_title ? parse(String(item.scm_se_title)) : ""}
            description={
              item.scm_se_description
                ? parse(String(item.scm_se_description))
                : ""
            }
            image={item.scm_se_image?.url || "/images/supply_3.jpg"}
            imgRedTri={item.scm_se_red_triangle === "true" ? false : true}
            isDarkMode={item.scm_se_darkmode === "true" ? true : false}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "health_and_safety") {
      return (
        <Wrapper key={index}>
          <HealthAndSafety
            title={item.scm_hs_title ? parse(String(item.scm_hs_title)) : ""}
            description={
              item.scm_hs_description
                ? parse(String(item.scm_hs_description))
                : ""
            }
            bgImg={
              isMobileView
                ? item.scm_hs_image_mob?.url || "/images/supply_4.jpg"
                : item.scm_hs_image?.url || "/images/supply_4.jpg"
            }
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "invest_training_scm") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <InvestTraining
              title={item.scm_bt_title ? parse(String(item.scm_bt_title)) : ""}
              description={
                item.scm_bt_description
                  ? parse(String(item.scm_bt_description))
                  : ""
              }
              imageSrc={item.scm_bt_image?.url || "/images/supply_5.jpg"}
              buttonOne={item.scm_bt_button_1?.title || ""}
              buttonTwo={item.scm_bt_button_2?.title || ""}
              buttonOneLink={item.scm_bt_button_1?.url || ""}
              buttonTwoLink={item.scm_bt_button_2?.url || ""}
              greenTriangle={true}
              redTriangle={false}
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "services_list_with_dark_background") {
      return (
        <Wrapper key={index}>
          <ServiceList
            title={item.ok_os_title}
            description={item.ok_os_description}
            services={item.hm_oc_our_services}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "red_feature_block") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <DigitalWorkflows
              title={item.os_rb_title ? parse(String(item.os_rb_title)) : ""}
              subtitle={
                item.os_rb_sub_title ? parse(String(item.os_rb_sub_title)) : ""
              }
              workflows={
                item.os_rb_features?.map((feature, index) => ({
                  icon:
                    feature.os_rb_f_icon?.url ||
                    feature.os_rb_f_icon ||
                    feature.os_rb_f_icon?.sizes?.["1536x1536"] ||
                    `/images/cn_icon_${index + 1}.svg`,
                  title: feature.os_rb_f_property || "",
                })) || []
              }
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "award_section") {
      const data = {
        acf: {
          dc_aw_title: item.sd_aw_title || "",
          dc_aw_description: item.sd_aw_description || "",
          dc_aw_image: item.sd_aw_image || {
            url: "/images/award_1.jpg",
            sizes: { "1536x1536": "/images/award_1.jpg" },
          },
        },
      };
      return (
        <Wrapper key={index}>
          <div className="pt_80">
            <AwardWinning data={data} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "projects_section") {
      return (
        <Wrapper key={index}>
          <section className="projectsSection" data-aos="fade-up">
            <ProjectsShowcase
              title={item.sd_op_title ? parse(String(item.sd_op_title)) : ""}
              description={
                item.sd_aw_description ? String(item.sd_aw_description) : ""
              }
              buttonText={item.sd_op_aw_button?.title || "VIEW OUR PROJECTS"}
              buttonLink={item.sd_op_aw_button?.url || "/whatwedo/ourprojects"}
              projects={item.sd_aw_related_projects_hydrated || []}
              bgImg={"/images/Vector.png"}
            />
          </section>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "reach_out_team") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <ReachOutTeam data={{ acf: item }} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "location_map") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <LocationMap location={{ acf: item }} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "faq") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <FaqCarousel faqData={item.faq_items || []} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "safety_system") {
      return (
        <Wrapper key={index}>
          <SafetySystem data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "k_learning") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up">
            <Klearing
              title={item.hs_li_title ? parse(String(item.hs_li_title)) : ""}
              description={[
                item.hs_li_description
                  ? parse(String(item.hs_li_description))
                  : "",
              ]}
              image={item.hs_li_image?.url || "/images/leadership.png"}
              bgColor="#F5F4F1"
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "mission_vision") {
      return (
        <Wrapper key={index}>
          <MissionVision data={item.ci_mission_and_vision} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "group_value") {
      return (
        <Wrapper key={index}>
          <div className="pb_80 pt_80">
            <GroupValue data={{ acf: item }} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "invest_training_scm") {
      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <InvestTraining
              title={item.scm_bt_title ? parse(String(item.scm_bt_title)) : ""}
              description={
                item.scm_bt_description
                  ? parse(String(item.scm_bt_description))
                  : ""
              }
              imageSrc={item.scm_bt_image?.url || "/images/supply_5.jpg"}
              buttonOne={item.scm_bt_button_1?.title || ""}
              buttonTwo={item.scm_bt_button_2?.title || ""}
              buttonOneLink={item.scm_bt_button_1?.url || ""}
              buttonTwoLink={item.scm_bt_button_2?.url || ""}
              greenTriangle={true}
              redTriangle={false}
            />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "services_list_with_dark_background") {
      return (
        <Wrapper key={index}>
          <ServiceList
            title={item.ok_os_title}
            description={item.ok_os_description}
            services={item.hm_oc_our_services}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "quality_improve") {
      return (
        <Wrapper key={index}>
          <QualityImprove
            title={item.title ? parse(String(item.title)) : ""}
            content={
              item.content
                ? parse(String(item.content))
                : item.description
                  ? parse(String(item.description))
                  : ""
            }
            objectives={
              item.objectives && item.objectives.length > 0
                ? item.objectives.map((o) => o.text)
                : null
            }
            imgUrl={item.image?.url || "/images/quality-improve.png"}
            videoUrl={item.video?.url || ""}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "dark_content_box") {
      return (
        <Wrapper key={index}>
          <DarkContentBox
            ImgUrl={item.es_bb_image?.url || "/images/social-resp.png"}
            title={item.es_bb_title ? parse(String(item.es_bb_title)) : ""}
            description={[
              item.es_bb_description
                ? parse(String(item.es_bb_description))
                : "",
            ]}
            backgroundImage={item.es_bb_background_image === 1 ? true : false}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "quality_policy") {
      return (
        <Wrapper key={index}>
          <QualityPolicy
            title={item.qp_wdb_title ? parse(String(item.qp_wdb_title)) : ""}
            dataList={
              parsePolicyList(item.qp_wdb_description).length > 0
                ? parsePolicyList(item.qp_wdb_description)
                : []
            }
            imgUrl={
              isMobileView
                ? item.qp_wdb_image_mob?.url
                : item.qp_wdb_image?.url || "/images/quality-policy.png"
            }
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "cyber_security") {
      return (
        <Wrapper key={index}>
          <CyberSecurity
            ImgUrl={item.dc_ri_image?.url || "/images/cyberSecurity.png"}
            title={item.dc_ri_title ? parse(String(item.dc_ri_title)) : ""}
            description={
              item.dc_ri_description
                ? parse(String(item.dc_ri_description))
                : ""
            }
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "quality_safety") {
      return (
        <Wrapper key={index}>
          <QualitySafety data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "future_delivery") {
      return (
        <Wrapper key={index}>
          <FutureDelivery data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "work_force") {
      return (
        <Wrapper key={index}>
          <WorkForce
            title={item.title ? parse(String(item.title)) : ""}
            description={[item.content ? parse(String(item.content)) : ""]}
            poster={item.poster?.url || "/images/workforce-thumbnail.png"}
            video={item.video?.url || "/videos/banner_video.mp4"}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "support_stories") {
      return (
        <Wrapper key={index}>
          <SupportStories
            title={item.es_bb_title ? parse(String(item.es_bb_title)) : ""}
            story={[
              item.es_bb_description
                ? parse(String(item.es_bb_description))
                : "",
            ]}
            imgUrl={item.es_bb_image?.url || "/images/ameera.png"}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "selected_sectors") {
      const title = item.title || item.swin_title || "Sectors we work in";
      const sectorMap = sectors.reduce((acc, sec) => {
        acc[sec.id] = sec.name;
        return acc;
      }, {});
      const sectorIconMap = sectors.reduce((acc, sec) => {
        acc[sec.id] =
          sec.icon || sec.acf?.sec_icon_2?.url || "/images/workIn.svg";
        return acc;
      }, {});

      const activeSect = (() => {
        const tags = getProjectTags(projectData, sectorMap);
        return tags && tags.length > 0 ? tags[0] : "";
      })();

      let selectedSectors = [];
      if (item?.select_sectors && item.select_sectors.length > 0) {
        selectedSectors = item.select_sectors.map((sector) => ({
          id: sector.term_id || sector.id || sector.ID || sector,
          name: sector.name || "",
          icon:
            sector.acf?.sec_icon_2?.url ||
            sectorIconMap[sector.term_id || sector.id] ||
            "/images/workIn.svg",
          link: sector.slug ? `/our-sector/${sector.slug}` : "#",
        }));
      } else if (
        item?.swin_other_sectors &&
        item.swin_other_sectors.length > 0
      ) {
        selectedSectors = item.swin_other_sectors.map((sector) => ({
          id: sector.term_id || sector.id || sector.ID || sector,
          name: sector.name || "",
          icon:
            sectorIconMap[sector.term_id || sector.id] || "/images/workIn.svg",
          link: sector.slug ? `/our-sector/${sector.slug}` : "#",
        }));
      } else {
        selectedSectors = sectors.map((sec) => ({
          id: sec.id,
          name: sec.name,
          icon: sec.icon || "/images/workIn.svg",
          link: sec.link || "#",
        }));
      }

      return (
        <Wrapper key={index}>
          <WorkInSector
            title={title}
            sectors={selectedSectors}
            activeSector={activeSect}
          />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "join_us") {
      return (
        <Wrapper key={index}>
          <JoinUs data={{ acf: item }} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "success_stories") {
      const formattedStories = item.cd_ss_stories?.map((story) => ({
        cd_ss_title: story.title,
        cd_ss_short_description: story.description,
        cd_ss_image: story.image,
        cd_ss_name: story.name,
        cd_ss_position: story.position,
      }));

      const data = {
        acf: {
          cd_ss_title: item.cd_ss_title,
          cd_ss_stories: formattedStories,
        },
      };

      return (
        <Wrapper key={index}>
          <div data-aos="fade-up" data-aos-delay="600">
            <SuccessStories data={data} />
          </div>
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "build_your_career") {
      const transformedDetails = item.ts_career_details?.map((detail) => ({
        ts_tab_name: detail.title,
        ts_description: detail.description,
        ts_image: detail.icon,
      }));

      const data = {
        acf: {
          ts_title: item.ts_title,
          ts_career_details: transformedDetails,
        },
      };

      return (
        <Wrapper key={index}>
          <BuildYourCareer data={data} />
        </Wrapper>
      );
    }

    if (item.acf_fc_layout === "welfare_list") {
      const transformedWelfare = item.list_item?.map((welfare) => ({
        ew_wd_title: welfare.wl_title,
        ew_wd_facilities: welfare.wl_description,
        ew_wd_image: welfare.wl_image,
      }));

      const data = {
        acf: {
          welfare_details: transformedWelfare,
        },
      };

      return (
        <Wrapper key={index}>
          <WelfareList data={data} />
        </Wrapper>
      );
    }

    // Default Generic Render
    if (Component) {
      return (
        <Wrapper key={index}>
          <Component data={{ acf: item }} />
        </Wrapper>
      );
    }

    return null;
  };

  return (
    <>
      {flexibleComponents && flexibleComponents.length > 0 ? (
        <div id={slug}>
          {flexibleComponents.map((item, index) =>
            renderComponent(item, index),
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export async function getStaticPaths() {
  // Fetch all projects to generate paths
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/project?per_page=100`,
    );
    const projects = await response.json();

    const paths = projects.map((project) => ({
      params: { slug: project.slug },
    }));

    return {
      paths,
      fallback: "blocking", // Generate pages on-demand for new projects
    };
  } catch (error) {
    console.error("Error fetching projects for static paths:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}

export async function getStaticProps({ params }) {
  // Fetch project data at build time
  try {
    let projectData = null;
    const slug = params.slug;

    // Check if slug is in "project-{id}" format
    const idMatch = slug.match(/^project-(\d+)$/);

    if (idMatch) {
      // Fetch by ID
      const id = idMatch[1];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/project/${id}?acf_format=standard`,
      );
      if (response.ok) {
        const data = await response.json();
        projectData = [data]; // Normalize to array to match slug response structure
      }
    } else {
      // Fetch by Slug
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/project?slug=${slug}&acf_format=standard`,
      );
      projectData = await response.json();
    }

    if (!projectData || projectData.length === 0) {
      return {
        notFound: true,
      };
    }

    const flexibleComponents = projectData[0].acf?.flexible_components || [];

    // Hydrate flexible_components data
    if (flexibleComponents && flexibleComponents.length > 0) {
      for (const component of flexibleComponents) {
        // Special handling for Service List with Dark Background (Always fetch all services)
        if (
          component.acf_fc_layout === "services_list_with_dark_background" ||
          component.acf_fc_layout ===
            "layout_services_list_with_dark_background"
        ) {
          try {
            const servicesRes = await axiosServer.get(
              "/service?per_page=100&acf_format=standard&_embed",
            );
            const services = servicesRes.data || [];

            // Collect media IDs to fetch in batch
            const mediaIds = services
              .map((s) => s.acf?.hm_ser_image)
              .filter(
                (img) =>
                  typeof img === "number" ||
                  (typeof img === "string" && /^\d+$/.test(img)),
              )
              .map((id) => parseInt(id, 10));

            const uniqueMediaIds = [...new Set(mediaIds)];
            const mediaMap = {};

            if (uniqueMediaIds.length > 0) {
              try {
                // Fetch in chunks of 50
                const chunkSize = 50;
                for (let i = 0; i < uniqueMediaIds.length; i += chunkSize) {
                  const chunk = uniqueMediaIds.slice(i, i + chunkSize);
                  const mediaRes = await axiosServer.get(
                    `/media?include=${chunk.join(",")}&per_page=100&_fields=id,source_url`,
                  );
                  mediaRes.data?.forEach((media) => {
                    mediaMap[media.id] = media.source_url;
                  });
                }
              } catch (mediaErr) {
                console.error("Error batch fetching media:", mediaErr);
              }
            }

            const mappedServices = services.map((s) => {
              const featured = s?._embedded?.["wp:featuredmedia"]?.[0];

              let image =
                featured?.source_url ||
                featured?.media_details?.sizes?.medium?.source_url ||
                featured?.media_details?.sizes?.full?.source_url ||
                s?.acf?.service_image?.url;

              // Fallback to hm_ser_image if user's preferred fields are missing
              if (!image && s.acf?.hm_ser_image) {
                if (s.acf.hm_ser_image.url) {
                  image = s.acf.hm_ser_image.url;
                } else if (s.acf.hm_ser_image.sizes?.["1536x1536"]) {
                  image = s.acf.hm_ser_image.sizes["1536x1536"];
                } else {
                  const id = parseInt(s.acf.hm_ser_image, 10);
                  if (mediaMap[id]) image = mediaMap[id];
                }
              }

              if (!image) image = "/images/placeholder.png";

              const title = s?.title?.rendered || s?.title || "";
              const description = limitWords(
                s?.excerpt?.rendered ||
                  s?.acf?.summary ||
                  s?.acf?.hm_intro ||
                  "",
                30,
              );
              const slug = s?.slug || "";

              return {
                image,
                title,
                description,
                buttonText: "View Details",
                link: slug ? `/services/${slug}` : "#",
              };
            });

            component.hm_oc_our_services = mappedServices.reverse();
          } catch (err) {
            console.error("Error fetching all services for dark list:", err);
          }
        }

        // A. Hydrate Capabilities (Services) and Service List
        if (
          (component.acf_fc_layout === "layout_capabilities" ||
            component.acf_fc_layout === "capabilities" ||
            component.acf_fc_layout === "service_list") &&
          component.hm_oc_our_services?.length > 0
        ) {
          try {
            const servicePromises = component.hm_oc_our_services.map(
              async (service) => {
                try {
                  // If service is just an ID, handle it (though usually object from ACF)
                  const serviceId = service.ID || service;
                  const serviceResponse = await axiosServer.get(
                    `/service/${serviceId}?acf_format=standard&_fields=id,slug,title,acf,post_title,post_content,post_name`,
                  );
                  const serviceData = serviceResponse.data;

                  if (serviceData.acf?.hm_ser_image) {
                    try {
                      const mediaId =
                        serviceData.acf.hm_ser_image.ID ||
                        serviceData.acf.hm_ser_image;
                      if (
                        mediaId &&
                        (typeof mediaId === "number" || /^\d+$/.test(mediaId))
                      ) {
                        const imageResponse = await axiosServer.get(
                          `/media/${mediaId}?_fields=id,source_url,media_details`,
                        );
                        serviceData.image_details = imageResponse.data;
                      } else {
                        // It might be a full object already if format is standard
                        serviceData.image_details =
                          serviceData.acf.hm_ser_image;
                      }
                    } catch (imageError) {
                      console.error(
                        `Error fetching image for service ${serviceId}:`,
                        imageError,
                      );
                      serviceData.image_details = null;
                    }
                  }
                  return serviceData;
                } catch (serviceError) {
                  console.error(
                    `Error fetching service ${service.ID}:`,
                    serviceError,
                  );
                  return service;
                }
              },
            );
            component.hm_oc_our_services = await Promise.all(servicePromises);
          } catch (err) {
            console.error("Error hydrating capabilities:", err);
          }
        }

        // B. Hydrate Projects Showcase (Landmarks)
        if (
          component.acf_fc_layout === "projects_showcase" &&
          component.hm_projects_list?.length > 0
        ) {
          try {
            // Fetch sectors and categories for mapping
            let sectorMap = {};
            try {
              const [sectorsRes, categoriesRes] = await Promise.all([
                axiosServer
                  .get("/sector?per_page=100&_fields=id,name")
                  .catch(() => ({ data: [] })),
                axiosServer
                  .get("/project-category?per_page=100&_fields=id,name")
                  .catch(() => ({ data: [] })),
              ]);

              if (sectorsRes.data) {
                sectorsRes.data.forEach((s) => (sectorMap[s.id] = s.name));
              }
              if (categoriesRes.data) {
                categoriesRes.data.forEach((c) => (sectorMap[c.id] = c.name));
              }
            } catch (secErr) {
              console.warn(
                "Error fetching sectors/categories for project tags:",
                secErr,
              );
            }

            const projectPromises = component.hm_projects_list.map(
              async (project) => {
                try {
                  const projectId = project.ID || project;
                  // Fetch project with ACF fields
                  const projectResponse = await axiosServer.get(
                    `/project/${projectId}?acf_format=standard&_fields=id,slug,title,acf,post_title,post_content,post_name,sector,project-category`,
                  );
                  const projectData = projectResponse.data;

                  // Fetch featured image for the project
                  if (projectData.acf?.hm_ps_image) {
                    try {
                      const mediaId =
                        projectData.acf.hm_ps_image.ID ||
                        projectData.acf.hm_ps_image;
                      if (
                        mediaId &&
                        (typeof mediaId === "number" || /^\d+$/.test(mediaId))
                      ) {
                        const imageResponse = await axiosServer.get(
                          `/media/${mediaId}?_fields=id,source_url,media_details`,
                        );
                        projectData.image_details = imageResponse.data;
                      } else {
                        projectData.image_details = projectData.acf.hm_ps_image;
                      }
                    } catch (imageError) {
                      console.error(
                        `Error fetching image for project ${projectId}:`,
                        imageError,
                      );
                      projectData.image_details = null;
                    }
                  }
                  
                  // Add tags
                  projectData.tags = getProjectTags(projectData, sectorMap);
                  
                  return projectData;
                } catch (projectError) {
                  console.error(
                    `Error fetching project ${project.ID}:`,
                    projectError,
                  );
                  return project;
                }
              },
            );
            component.hm_projects_list = await Promise.all(projectPromises);
          } catch (err) {
            console.error("Error hydrating projects showcase:", err);
          }
        }

        // B2. Hydrate Projects Section (New Layout)
        if (
          component.acf_fc_layout === "projects_section" &&
          component.sd_aw_related_projects?.length > 0
        ) {
          try {
            // Fetch sectors and categories for mapping
            let sectorMap = {};
            try {
              const [sectorsRes, categoriesRes] = await Promise.all([
                axiosServer
                  .get("/sector?per_page=100&_fields=id,name")
                  .catch(() => ({ data: [] })),
                axiosServer
                  .get("/project-category?per_page=100&_fields=id,name")
                  .catch(() => ({ data: [] })),
              ]);

              if (sectorsRes.data) {
                sectorsRes.data.forEach((s) => (sectorMap[s.id] = s.name));
              }
              if (categoriesRes.data) {
                categoriesRes.data.forEach((c) => (sectorMap[c.id] = c.name));
              }
            } catch (secErr) {
              console.warn(
                "Error fetching sectors/categories for project tags:",
                secErr,
              );
            }

            const ids = component.sd_aw_related_projects.map((p) =>
              typeof p === "object" && p.ID ? p.ID : p,
            );

            if (ids.length > 0) {
              const projectPromises = ids.map((id) =>
                axiosServer
                  .get(
                    `/project/${id}?acf_format=standard&_fields=id,slug,title,acf,post_title,post_content,post_name,sector,project-category`,
                  )
                  .catch(() => null),
              );
              const projects = (await Promise.all(projectPromises))
                .filter(Boolean)
                .map((r) => r.data);

              component.sd_aw_related_projects_hydrated = projects.map(
                (project) => ({
                  image: getProjectImage(project),
                  title: project?.title?.rendered || "",
                  tags: getProjectTags(project, sectorMap),
                  slug: project.slug,
                }),
              );
            }
          } catch (err) {
            console.error("Error hydrating projects section:", err);
            component.sd_aw_related_projects_hydrated = [];
          }
        }

        // C. Hydrate What's New (News)
        if (
          component.acf_fc_layout === "whats_new" &&
          component.hm_wn_latest_news?.length > 0
        ) {
          try {
            const newsPromises = component.hm_wn_latest_news.map(
              async (news) => {
                try {
                  const newsId = news.ID || news;
                  const newsResponse = await axiosServer.get(
                    `/posts/${newsId}?acf_format=standard&_fields=id,slug,title,acf,post_title,post_content,post_name,date,featured_media`,
                  );
                  const newsData = newsResponse.data;

                  // Determine media source
                  let rawMedia = newsData.acf?.hm_wn_image;
                  if (!rawMedia && newsData.featured_media) {
                    rawMedia = newsData.featured_media;
                  }

                  if (rawMedia) {
                    const mediaId = rawMedia.ID || rawMedia;
                    if (
                      mediaId &&
                      (typeof mediaId === "number" || /^\d+$/.test(mediaId))
                    ) {
                      try {
                        const imageResponse = await axiosServer.get(
                          `/media/${mediaId}?_fields=id,source_url,media_details`,
                        );
                        newsData.image_details = imageResponse.data;
                      } catch (imageError) {
                        console.error(
                          `Error fetching image for news ${newsId}:`,
                          imageError,
                        );
                        newsData.image_details = null;
                      }
                    } else {
                      newsData.image_details = rawMedia;
                    }
                  }
                  return newsData;
                } catch (newsError) {
                  console.error(`Error fetching news ${news.ID}:`, newsError);
                  return news;
                }
              },
            );
            component.hm_wn_latest_news = await Promise.all(newsPromises);
          } catch (err) {
            console.error("Error hydrating whats new:", err);
          }
        }

        // D. Hydrate Selected Sectors
        if (
          component.acf_fc_layout === "selected_sectors" &&
          component.select_sectors?.length > 0
        ) {
          try {
            const sectorPromises = component.select_sectors.map(async (s) => {
              const sectorId =
                typeof s === "object" ? s.term_id || s.ID || s.id : s;
              if (!sectorId) return s;

              try {
                const sectorRes = await axiosServer.get(
                  `/sector/${sectorId}?acf_format=standard`,
                );
                const sectorData = sectorRes.data;

                if (sectorData.acf?.sec_icon_2) {
                  if (typeof sectorData.acf.sec_icon_2 === "number") {
                    try {
                      const mediaRes = await axiosServer.get(
                        `/media/${sectorData.acf.sec_icon_2}`,
                      );
                      sectorData.acf.sec_icon_2 = {
                        url: mediaRes.data?.source_url,
                      };
                    } catch (err) {
                      console.error(
                        `Error fetching sec_icon_2 for sector ${sectorId}:`,
                        err,
                      );
                    }
                  }
                }

                return {
                  term_id: sectorData.id,
                  name: sectorData.name,
                  slug: sectorData.slug,
                  acf: sectorData.acf,
                };
              } catch (e) {
                console.error(`Error fetching sector ${sectorId}:`, e);
                return s;
              }
            });

            component.select_sectors = await Promise.all(sectorPromises);
          } catch (err) {
            console.error("Error hydrating selected sectors:", err);
          }
        }
      }
    }

    const title = projectData[0].title?.rendered
      ? safeParse(projectData[0].title.rendered)
      : "Project Details";

    // Check if "Our Projects & Sectors" page has content
    let ourProjectsHasContent = true;
    try {
      const ourProjectsRes = await axiosServer.get(
        "/pages?slug=ourprojects&_fields=id,acf&acf_format=standard"
      );
      if (ourProjectsRes.data && ourProjectsRes.data.length > 0) {
        const ourProjectsPage = ourProjectsRes.data[0];
        ourProjectsHasContent =
          ourProjectsPage.acf?.flexible_components &&
          ourProjectsPage.acf.flexible_components.length > 0;
      } else {
        ourProjectsHasContent = false;
      }
    } catch (e) {
      console.error("Error fetching Our Projects page:", e);
      ourProjectsHasContent = false;
    }

    const breadcrumbs = [
      { label: "Home", href: "/" },
      { 
        label: "Our Projects & Sectors", 
        href: ourProjectsHasContent ? "/whatwedo/ourprojects" : null 
      },
      {
        label: "Project Details",
        href: `/ourprojects/${slug}`,
      },
    ];

    // Extract Page Specific Scripts
    const pageScripts = {
      header_scripts: projectData[0].meta?._hfs_header_scripts || "",
      body_scripts: projectData[0].meta?._hfs_body_scripts || "",
      footer_scripts: projectData[0].meta?._hfs_footer_scripts || "",
    };

    // Fetch Global Scripts
    const globalScripts = await getGlobalScripts();

    return {
      props: {
        initialProjectData: projectData[0],
        data: projectData[0],
        breadcrumbs,
        pageScripts,
        globalScripts,
      },
      revalidate: 1, // Revalidate every 1 second
    };
  } catch (error) {
    console.error("Error fetching project data:", error);
    return {
      notFound: true,
    };
  }
}

export default ProjectDetails;
