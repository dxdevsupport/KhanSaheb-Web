"use client";
import { useEffect } from "react";
import { axiosClient } from "../axios/axios";

const useAxiosPublic= () => {

  useEffect(() => {
    const requestInterceptor = axiosClient.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosClient.interceptors.response.use(
      (response) => {
        // console.log("axios response",response.status)
        return response;
      },
      async (error) => {
        // const {
        //   NEXT_LOCALE,
        // } = getCookies()||'en';
        // if(error.response.status=="401"){
        //   router.push(`/${language}/unauthorized`)
        //   signOut()
        // }else if(error.response.status=="403"){
        //   router.push(`/${language}/forbidden`)
        // }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosClient.interceptors.request.eject(requestInterceptor);
      axiosClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);
  return axiosClient;
};

export default useAxiosPublic;