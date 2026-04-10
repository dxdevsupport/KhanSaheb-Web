import constants from "@/common/constants";
import useAxiosPublic from "@/libs/hooks/useAxiosPublic";

const useWhatWeDoServices = () => {
  const axios = useAxiosPublic();
  const getOneKhansaheb = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.ONE_KHANSAHEB}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching one khansaheb:", error);
      return null;
    }
  };

  const getOurServices = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.OUR_SERVICES}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching our services:", error);
      return null;
    }
  };

  const getOurResources = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.OUR_RESOURCES}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching our resources:", error);
      return null;
    }
  };

  const getOurProjects = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.OUR_PROJECTS}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching our projects:", error);
      return null;
    }
  };

  const getWhatWeDo = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.WHAT_WE_DO}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching what we do:", error);
      return null;
    }
  };

  const getSupplyChainManagement = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.SUPPLY_CHAIN_MANAGEMENT}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching supply chain management:", error);
      return null;
    }
  };

  const getServiceBySlug = async (slug) => {
    try {
      const response = await axios.get(
        `/service?slug=${slug}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching service ${slug}:`, error);
      return null;
    }
  };

  const getAllServices = async () => {
    try {
      const response = await axios.get(
        `/service?acf_format=standard&per_page=100`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all services:", error);
      return null;
    }
  };

  return {
    getOneKhansaheb,
    getOurServices,
    getOurResources,
    getOurProjects,
    getWhatWeDo,
    getSupplyChainManagement,
    getServiceBySlug,
    getAllServices,
  };
};

export default useWhatWeDoServices;
