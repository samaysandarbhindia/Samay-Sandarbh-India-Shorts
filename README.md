# SSI Shorts — Render version (all channel videos)

This project serves the channel's official YouTube **Uploads** playlist through a small Node.js API hosted on Render. It includes public Shorts and regular uploads, newest first, 50 per page. The Blogger page presents them in a vertical swipe/scroll feed and requests more pages as visitors scroll.

## 1. YouTube API key
1. Open https://console.cloud.google.com/ and select/create a Google Cloud project.
2. Enable **YouTube Data API v3**.
3. Create an API key. Restrict it to YouTube Data API v3 where possible.
4. Keep it private. Add it to Render as the `YOUTUBE_API_KEY` environment variable; never paste it into Blogger HTML or GitHub.

## 2. Deploy the API to Render
1. Upload the **contents of this folder** to a GitHub repository (the `package.json` and `server.js` must be at the repository root).
2. In Render, choose **New + → Web Service**, connect that repository, and select:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: Free (if available to your account)
3. Add environment variables:
   - `YOUTUBE_API_KEY` = your private YouTube API key
   - `YOUTUBE_CHANNEL_ID` = `UCEI7ng6gTbLJ-7qFIBVevRA` (already provided in `render.yaml`; optional if using the default)
4. Deploy. Your API endpoint will be `https://YOUR-RENDER-SERVICE.onrender.com/api/shorts`.
5. Test `https://YOUR-RENDER-SERVICE.onrender.com/health` (should return `{"ok":true,...}`), then test `/api/shorts` (should return JSON containing `items`).

## 3. Publish the Blogger page
1. Open Blogger → Pages → New Page, and switch to HTML view.
2. Paste the full contents of `blogger-shorts-page.html`.
3. In that HTML, replace `https://YOUR-RENDER-SERVICE.onrender.com/api/shorts` with your actual Render service URL plus `/api/shorts`.
4. Publish as `/p/shorts.html`.

## Notes
- This reads the channel's official Uploads playlist, not a manually curated playlist. Both Shorts and regular public uploads appear.
- YouTube returns up to 50 items per API page; the frontend loads further pages when scrolling.
- Videos are played through YouTube's embedded player; they are not downloaded or rehosted. Some videos may disallow embedding.
- YouTube Data API quota limits still apply.
- Render's free web services may spin down after inactivity and take some time to wake on the next request. Availability and free-plan terms can change; check Render's current pricing.
- Blogger theme is not modified. Only the standalone page is added.
