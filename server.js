// SSI Shorts API — Render web service
// Required environment variable: YOUTUBE_API_KEY
// Optional: YOUTUBE_CHANNEL_ID (defaults to the SSI channel ID)
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCEI7ng6gTbLJ-7qFIBVevRA';
const API_KEY = process.env.YOUTUBE_API_KEY;

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

async function youtube(path, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries({ ...params, key: API_KEY }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'YouTube API request failed');
  return data;
}

app.get('/', (_req, res) => res.type('text').send('Samay Sandarbh India Shorts API is running.'));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'ssi-shorts-api' }));

app.get('/api/shorts', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300');
  if (!API_KEY) {
    return res.status(500).json({ error: 'Render environment variable YOUTUBE_API_KEY is missing' });
  }

  try {
    // Discover the channel's official uploads playlist; includes Shorts and regular videos.
    const channelData = await youtube('channels', {
      part: 'contentDetails', id: CHANNEL_ID, maxResults: 1
    });
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      return res.status(404).json({ error: 'Channel or uploads playlist not found. Check YOUTUBE_CHANNEL_ID.' });
    }

    const playlistData = await youtube('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken: req.query.pageToken || undefined
    });

    const items = (playlistData.items || []).map(item => {
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      return {
        videoId,
        title: item.snippet?.title || 'समय संदर्भ इंडिया',
        description: item.snippet?.description || '',
        publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || null,
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || null
      };
    }).filter(item => item.videoId && item.title !== 'Private video' && item.title !== 'Deleted video');

    return res.json({
      channelId: CHANNEL_ID,
      items,
      nextPageToken: playlistData.nextPageToken || null,
      totalResults: playlistData.pageInfo?.totalResults || null
    });
  } catch (error) {
    console.error('YouTube API error:', error.message);
    return res.status(502).json({ error: error.message || 'Unable to fetch channel videos' });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`SSI Shorts API listening on ${PORT}`));
