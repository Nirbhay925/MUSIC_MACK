# MUSIC_MACK
mood based music recomendation system built using springboot


The backend in this project (built with Spring Boot and Java) acts as a crucial middle layer between your frontend web application and the external iTunes API.

Here are its main uses in this project:

1] Bypassing CORS Restrictions: Browsers often block frontend applications from making direct requests to external APIs (like iTunes) due to Cross-Origin Resource Sharing (CORS) security policies. The backend acts as a proxy—your frontend asks the backend for songs, and the backend safely makes the request to iTunes on its behalf.

2]Translating Moods to Search Terms: The frontend asks for a simple mood like "happy" or "chill". The backend takes this mood and maps it to multiple specific search terms (e.g., "happy" becomes "happy songs", "feel good music", "upbeat pop") to get a more diverse and accurate list of songs from iTunes.

3]Filtering Unplayable Songs: The iTunes API sometimes returns tracks that don't have an audio preview available. The backend automatically filters out any songs that lack a previewUrl, ensuring the frontend only receives playable tracks.

4]Data Enrichment (Better Images): The backend modifies the data before sending it to the frontend. For example, it intercepts the low-resolution 100x100 pixel album artwork returned by iTunes and upgrades the URL to fetch a higher-quality 300x300 pixel image.

5]Caching for Performance: It uses caching (@Cacheable) so that if multiple users ask for "chill" music, it only queries the iTunes API once. Subsequent requests are served instantly from the backend's memory, which makes the app much faster and prevents you from hitting rate limits on the iTunes API.
