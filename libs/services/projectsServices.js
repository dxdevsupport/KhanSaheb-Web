import useAxiosPublic from "@/libs/hooks/useAxiosPublic";

const useProjectsServices = () => {
  const axios = useAxiosPublic();

  /**
   * Fetch all projects from WordPress REST API
   * @param {number} perPage - Number of projects to fetch per page (default: 100)
   * @returns {Promise<Array>} Array of project objects
   */
  const getAllProjects = async (perPage = 100) => {
    try {
      const response = await axios.get(
        `/project?acf_format=standard&_embed=1&per_page=${perPage}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all projects:", error);
      return null;
    }
  };

  /**
   * Fetch a single project by slug
   * @param {string} slug - Project slug
   * @returns {Promise<Object>} Project object
   */
  const getProjectBySlug = async (slug) => {
    try {
      const response = await axios.get(
        `/project?slug=${slug}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching project with slug ${slug}:`, error);
      return null;
    }
  };

  /**
   * Fetch a single project by ID
   * @param {number} id - Project ID
   * @returns {Promise<Object>} Project object
   */
  const getProjectById = async (id) => {
    try {
      const response = await axios.get(
        `/project/${id}?acf_format=standard&_embed=1`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      return null;
    }
  };

  /**
   * Fetch projects by category
   * @param {number} categoryId - Category ID
   * @param {number} perPage - Number of projects to fetch per page (default: 100)
   * @returns {Promise<Array>} Array of project objects
   */
  const getProjectsByCategory = async (categoryId, perPage = 100) => {
    try {
      const response = await axios.get(
        `/project?project-category=${categoryId}&acf_format=standard&per_page=${perPage}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching projects for category ${categoryId}:`, error);
      return null;
    }
  };

  /**
   * Fetch projects by sector
   * @param {number} sectorId - Sector ID
   * @param {number} perPage - Number of projects to fetch per page (default: 100)
   * @returns {Promise<Array>} Array of project objects
   */
  const getProjectsBySector = async (sectorId, perPage = 100) => {
    try {
      const response = await axios.get(
        `/project?sector=${sectorId}&acf_format=standard&per_page=${perPage}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching projects for sector ${sectorId}:`, error);
      return null;
    }
  };

  /**
   * Fetch all project categories
   * @returns {Promise<Array>} Array of category objects
   */
  const getProjectCategories = async () => {
    try {
      const response = await axios.get(`/project-category?acf_format=standard&per_page=100`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project categories:", error);
      return null;
    }
  };

  /**
   * Fetch multiple projects by their IDs
   * @param {Array<number>} ids - Array of project IDs
   * @returns {Promise<Array>} Array of project objects
   */
  const getProjectsByIds = async (ids) => {
    try {
      if (!ids || ids.length === 0) {
        return [];
      }

      // Fetch all projects in parallel
      const projectPromises = ids.map(id => getProjectById(id));
      const projects = await Promise.all(projectPromises);

      // Filter out any null results from failed requests
      return projects.filter(project => project !== null);
    } catch (error) {
      console.error("Error fetching projects by IDs:", error);
      return [];
    }
  };

  return {
    getAllProjects,
    getProjectBySlug,
    getProjectById,
    getProjectsByCategory,
    getProjectCategories,
    getProjectsBySector,
    getProjectsByIds,
  };
};

export default useProjectsServices;

