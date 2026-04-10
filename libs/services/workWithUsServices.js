import constants from "@/common/constants";
import useAxiosPublic from "@/libs/hooks/useAxiosPublic";

const useWorkWithUsServices = () => {
  const axios = useAxiosPublic();

  const getEmiratization = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.EMIRATIZATION}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching emiratization:", error);
      return null;
    }
  }

  const getCareerDevelopment = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.CAREER_DEVELOPMENT}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching career development:", error);
      return null;
    }
  }

  const getTrainingAndSkillDevelopment = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.TRAINING_AND_SKILL_DEVELOPMENT}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching training and skill development:", error);
      return null;
    }
  }

  const getEmployeeWelfare = async () => {
    try {   
      const response = await axios.get(`/pages?slug=${constants.EMPLOYEE_WELFARE}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching employee welfare:", error);
      return null;
    }
  }

  return {
    getEmiratization,
    getCareerDevelopment,
    getTrainingAndSkillDevelopment,
    getEmployeeWelfare,
  };
};

export default useWorkWithUsServices;
