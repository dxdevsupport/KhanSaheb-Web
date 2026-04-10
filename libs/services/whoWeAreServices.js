import constants from "@/common/constants";
import useAxiosPublic from "@/libs/hooks/useAxiosPublic";

const useWhoWeAreServices = () => {
  const axios = useAxiosPublic();

  const getOurHistory = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.OUR_HISTORY}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching our history:", error);
      return null;
    }
  };

  const getOurTimeline = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.OUR_TIMELINE}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching our timeline:", error);
      return null;
    }
  }

  const getOurLegacy = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.OUR_LEGACY}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching our legacy:", error);
      return null;
    }
  }

  const getOurLeadershipTeam = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.OUR_LEADERSHIP_TEAM}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching our leadership team:", error);
      return null;
    }
  }

  const getOurTeamMembers = async () => {
    try {
      // Include _embed parameter to fetch featured media images
      const response = await axios.get(`/our-team?acf_format=standard&per_page=100&_embed`);
      return response.data;
    } catch (error) {
      console.error("Error fetching our team members:", error);
      return null;
    }
  }

  return {
    getOurHistory,
    getOurTimeline,
    getOurLegacy,
    getOurLeadershipTeam,
    getOurTeamMembers,
  };
};

export default useWhoWeAreServices;
