import constants from "@/common/constants";
import useAxiosPublic from "@/libs/hooks/useAxiosPublic";

const useWhatsNewServices = () => {
  const axios = useAxiosPublic();

  const getAwards = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.AWARDS}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching awards:", error);
      return null;
    }
  }

  const getNews = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.NEWS}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching news:", error);
      return null;
    }
  }

  const getInsights = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.INSIGHTS}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching insights:", error);
      return null;
    }
  }

  const getAllAwards = async (perPage = 100) => {
    try {
      const response = await axios.get(`/award?acf_format=standard&per_page=${perPage}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all awards:", error);
      return null;
    }
  }

  const getAwardBySlug = async (slug) => {
    try {
      const response = await axios.get(`/award?slug=${slug}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching award with slug ${slug}:`, error);
      return null;
    }
  }

  const getAwardById = async (id) => {
    try {
      const response = await axios.get(`/award/${id}?acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching award with ID ${id}:`, error);
      return null;
    }
  }

  const getAwardMedia = async (awardId) => {
    try {
      const response = await axios.get(`/media?parent=${awardId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching media for award ${awardId}:`, error);
      return null;
    }
  }

  const getAllNewsPosts = async (perPage = 100) => {
    try {
      const response = await axios.get(`/posts?acf_format=standard&per_page=${perPage}&_embed`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all news posts:", error);
      return null;
    }
  }

  const getNewsPostById = async (id) => {
    try {
      const response = await axios.get(`/posts/${id}?acf_format=standard&_embed`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching news post with ID ${id}:`, error);
      return null;
    }
  }

  const getMediaById = async (mediaId) => {
    try {
      const response = await axios.get(`/media/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching media with ID ${mediaId}:`, error);
      return null;
    }
  }

  return {
    getAwards,
    getNews,
    getInsights,
    getAllAwards,
    getAwardBySlug,
    getAwardById,
    getAwardMedia,
    getAllNewsPosts,
    getNewsPostById,
    getMediaById,
  };
};

export default useWhatsNewServices;
