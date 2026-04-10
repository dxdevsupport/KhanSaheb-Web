import constants from "@/common/constants";
import useAxiosPublic from "@/libs/hooks/useAxiosPublic";

const useWhyKhansahebServices = () => {
  const axios = useAxiosPublic();
  const getHealthAndSafety = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.HEALTH_AND_SAFETY}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health and safety:", error);
      return null;
    }
  };

  const getEsg = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.ESG}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching ESG:", error);
      return null;
    }
  };

  const getQuality = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.QUALITY}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching quality:", error);
      return null;
    }
  };

  const getCultureAndIntegrity = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.CULTURE_AND_INTEGRITY}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching culture and integrity:", error);
      return null;
    }
  };

  const getDigitalConstruction = async () => {
    try {
      const response = await axios.get(
        `/pages?slug=${constants.DIGITAL_CONSTRUCTION}&acf_format=standard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching digital construction:", error);
      return null;
    }
  };

  return {
    getHealthAndSafety,
    getEsg,
    getQuality,
    getCultureAndIntegrity,
    getDigitalConstruction,
  };
};

export default useWhyKhansahebServices;
