import constants from "@/common/constants";
import useAxiosPublic from "@/libs/hooks/useAxiosPublic";
import useProjectsServices from "@/libs/services/projectsServices";

const useHomeServices = () => {
  const axios = useAxiosPublic();
  const { getProjectsByIds } = useProjectsServices();

  const getHome = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.HOME}&acf_format=standard`);
      const pageData = response.data;

      if (pageData && pageData.length > 0) {
        // Fetch featured_media details if available
        if (pageData[0].featured_media) {
          try {
            const mediaResponse = await axios.get(`/media/${pageData[0].featured_media}`);
            pageData[0].featured_media_details = mediaResponse.data;
          } catch (mediaError) {
            console.error("Error fetching featured media:", mediaError);
            pageData[0].featured_media_details = null;
          }
        }

        // Fetch service details including images for each service in hm_oc_our_services
        if (pageData[0].acf?.hm_oc_our_services?.length > 0) {
          try {
            // Fetch all services in parallel
            const servicePromises = pageData[0].acf.hm_oc_our_services.map(async (service) => {
              try {
                const serviceResponse = await axios.get(`/service/${service.ID}`);
                const serviceData = serviceResponse.data;

                // If service has hm_ser_image ACF field, fetch the media details
                if (serviceData.acf?.hm_ser_image) {
                  try {
                    const mediaId = serviceData.acf.hm_ser_image.ID || serviceData.acf.hm_ser_image;
                    if (mediaId && (typeof mediaId === "number" || /^\d+$/.test(mediaId))) {
                        const imageResponse = await axios.get(`/media/${mediaId}`);
                        serviceData.image_details = imageResponse.data;
                    } else {
                        serviceData.image_details = serviceData.acf.hm_ser_image;
                    }
                  } catch (imageError) {
                    console.error(`Error fetching image for service ${service.ID}:`, imageError);
                    serviceData.image_details = null;
                  }
                }

                return serviceData;
              } catch (serviceError) {
                console.error(`Error fetching service ${service.ID}:`, serviceError);
                return service; // Return original service data if fetch fails
              }
            });

            // Wait for all service fetches to complete
            const servicesWithDetails = await Promise.all(servicePromises);

            // Replace the services array with the detailed version
            pageData[0].acf.hm_oc_our_services = servicesWithDetails;
          } catch (servicesError) {
            console.error("Error fetching services:", servicesError);
            // Continue with original services data
          }
        }

        // Fetch complete project details for hm_projects_list
        if (pageData[0].acf?.hm_projects_list?.length > 0) {
          try {
            // Extract project IDs from the projects list
            const projectIds = pageData[0].acf.hm_projects_list.map(p => p.ID);
            //console.log('Home page project IDs:', projectIds); // Debug log

            // Fetch complete project details including slugs
            const projectsWithDetails = await getProjectsByIds(projectIds);
            //console.log('Fetched home page projects:', projectsWithDetails); // Debug log

            // Replace the projects array with the detailed version
            pageData[0].acf.hm_projects_list = projectsWithDetails;
          } catch (projectsError) {
            console.error("Error fetching projects:", projectsError);
            // Continue with original projects data
          }
        }
      }

      return pageData;
    } catch (error) {
      console.error("Error fetching home:", error);
      return null;
    }
  }
  return {
    getHome,
  };
};

export default useHomeServices;
