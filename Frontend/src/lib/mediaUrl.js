const getMediaUrl = (path = "", baseUrl = "") => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path}`;
};

export default getMediaUrl;
