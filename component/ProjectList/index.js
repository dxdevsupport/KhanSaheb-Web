import React, { useEffect, useState } from "react";
import styles from "./projectList.module.scss";
import ProjectCard from "./projectCard";
import AOS from "aos";
import "aos/dist/aos.css";
import useProjectsServices from "@/libs/services/projectsServices";
import parse from "html-react-parser";
import { getProjectImage, getProjectTags, extractTextFromObject } from "@/libs/utils/helpers";

const ProjectList = ({ title = "Our Projects", projects, initialDisplayCount = 9, isInView = false, data }) => {
  const [visibleCount, setVisibleCount] = useState(initialDisplayCount);
  const [fetchedProjects, setFetchedProjects] = useState([]);
  const [processedProjects, setProcessedProjects] = useState([]);
  const { getAllProjects, getProjectCategories, getProjectsByIds } = useProjectsServices();

  const finalTitle = data?.acf?.title || title; 
  useEffect(() => {
    const fetchProjects = async () => {
      // Fetch categories for mapping tags
      const categories = await getProjectCategories();
      
      const categoryMap = categories ? categories.reduce((acc, cat) => {
          acc[cat.id] = cat.name;
          return acc;
      }, {}) : {};
      
      // Case 1: Projects provided via props
      if (projects && projects.length > 0) {
        // Check if already formatted (has path)
        if (projects[0].path) {
           return; // Already formatted, will use prop directly
        }

        // If not formatted (e.g. raw ACF objects or IDs), fetch full details
        const ids = projects.map(p => {
            // Handle object { ID: 123 } or direct ID
            return (typeof p === 'object' && p.ID) ? p.ID : (p.id || p);
        });

        if (ids.length > 0) {
           const fullProjects = await getProjectsByIds(ids);
           if (fullProjects) {
              const formatted = fullProjects.map(p => {
                let finalSlug = p.slug;
                return {
                  id: p.id,
                  title: extractTextFromObject(p.title?.rendered) || "",
                  categories: getProjectTags(p, {}, categoryMap),
                  image: getProjectImage(p),
                  path: `/ourprojects/${finalSlug}`
                };
              });
              setProcessedProjects(formatted);
           }
        }
      } 
      // Case 2: No projects provided (undefined or null), fetch all
      // If projects is [] (empty array), we do nothing and show empty list
      else if (!projects) {
        const data = await getAllProjects(100);
        if (data) {
           const formatted = data.map(p => {
             let finalSlug = p.slug;
             return {
              id: p.id,
              title: extractTextFromObject(p.title?.rendered) || "",
              categories: getProjectTags(p, {}, categoryMap),
              image: getProjectImage(p),
              path: `/ourprojects/${finalSlug}`
            };
          });
          setFetchedProjects(formatted);
        }
      }
    };
    fetchProjects();
  }, [projects]);

  const projectsList = (projects && projects[0]?.path) ? projects : (processedProjects.length > 0 ? processedProjects : fetchedProjects);


  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  const handleLoadMore = () => {
    // Load 3 more projects each time
    setVisibleCount((prevCount) => Math.min(prevCount + 3, projectsList.length));
  };

  const visibleProjects = projectsList.slice(0, visibleCount);
  const hasMoreProjects = visibleCount < projectsList.length;

  return (
    <section className={`${styles.projectsSection} ${isInView ? styles.inView : ""} pb_80 pt_80`}>
      <div className="container">
        <div className= {`${styles.projectsHeader} hp_space_mb main_title_up`} >
          <h2 className="main_title ">{extractTextFromObject(finalTitle)}</h2>
        </div>
      </div>
      <div className="container">
        <div className={styles.projectsList}>
          {visibleProjects.map((project, index) => (
            <div key={index} >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
        {hasMoreProjects && (
          <div className={styles.button_container}>
            <button onClick={handleLoadMore} className="view_all_btn">
              LOAD MORE
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectList;
