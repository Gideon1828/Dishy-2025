import { useEffect, useState } from "react";
import axios from "axios";

const YouTubeEmbed = ({ dishTitle }) => {
  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        const query = encodeURIComponent(dishTitle);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${apiKey}&maxResults=1`;

        const response = await axios.get(url);
        const firstVideoId = response.data.items[0]?.id?.videoId;
        setVideoId(firstVideoId);
      } catch (error) {
        console.error("YouTube API Error", error);
      }
    };

    if (dishTitle) fetchVideo();
  }, [dishTitle]);

  return videoId ? (
    <div style={{ marginBottom: "2rem" }}>
      <iframe
        width="100%"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  ) : (
    <p>Loading video...</p>
  );
};

export default YouTubeEmbed;
