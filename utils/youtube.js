// In server/utils/youtube.js
const axios = require("axios");

async function getYouTubeSuggestions(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&key=${process.env.YOUTUBE_API_KEY}&maxResults=3&type=video`;

  const response = await axios.get(url);

  // This part now creates an object with title, url, AND the thumbnail image.
  return response.data.items.map((item) => ({
    title: item.snippet.title,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    thumbnail: item.snippet.thumbnails.medium.url, // <-- THIS IS THE LINE THAT GETS THE PICTURE URL
  }));
}

module.exports = getYouTubeSuggestions;
