import useAxiosPublic from "@/libs/hooks/useAxiosPublic";

const useSectorsServices = () => {
  const axios = useAxiosPublic();

  const getSectors = async () => {
    try {
      const response = await axios.get(`/sector?acf_format=standard`);
      const sectors = response.data || [];

      const mappedSectors = await Promise.all(
        sectors.map(async (sector) => {
          let iconUrl = "/images/sec_icon_1.svg";

          // Check sec_icon_2 first, then fallback to sec_icon
          const iconField = sector.acf?.sec_icon || '';

          if (iconField) {
            if (
              typeof iconField === "object" &&
              iconField.url
            ) {
              iconUrl = iconField.url;
            } else if (typeof iconField === "number") {
              try {
                const mediaRes = await axios.get(
                  `/media/${iconField}`
                );
                iconUrl = mediaRes.data?.source_url || iconUrl;
              } catch (err) {
                console.error(
                  `Error fetching icon for sector ${sector.id}:`,
                  err
                );
              }
            }
          }

          return {
            id: sector.id,
            name: sector.name || "",
            title: sector.name || "",
            description: sector.description || "",
            icon: iconUrl,
            link: `/our-sector/${sector.slug}`,
            exploreLink: `/our-sector/${sector.slug}`,
            acf: sector.acf,
          };
        })
      );

      return mappedSectors;
    } catch (error) {
      console.error("Error fetching sectors:", error);
      return null;
    }
  };

  const getSectorBySlug = async (slug) => {
    try {
      const response = await axios.get(`/sector?slug=${slug}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sector with slug ${slug}:`, error);
      return null;
    }
  };

  return {
    getSectors,
    getSectorBySlug,
  };
};

export default useSectorsServices;

