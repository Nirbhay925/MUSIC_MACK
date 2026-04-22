package com.musicmack.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicmack.model.MoodResponse;
import com.musicmack.model.Song;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MusicService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    // Mood-to-search-terms mapping. Multiple search terms per mood for variety.
    private static final Map<String, List<String>> MOOD_SEARCH_TERMS = new LinkedHashMap<>();

    static {
        MOOD_SEARCH_TERMS.put("happy", List.of("happy songs", "feel good music", "upbeat pop"));
        MOOD_SEARCH_TERMS.put("sad", List.of("sad songs", "heartbreak ballad", "emotional songs"));
        MOOD_SEARCH_TERMS.put("chill", List.of("chill vibes", "lofi chill", "ambient relaxing"));
        MOOD_SEARCH_TERMS.put("energetic", List.of("energetic workout", "high energy music", "pump up songs"));
        MOOD_SEARCH_TERMS.put("party", List.of("party hits", "dance party songs", "club music"));
        MOOD_SEARCH_TERMS.put("romantic", List.of("romantic love songs", "love ballad", "romantic duet"));
        MOOD_SEARCH_TERMS.put("focus", List.of("focus study music", "concentration music", "instrumental focus"));
        MOOD_SEARCH_TERMS.put("angry", List.of("angry rock music", "rage songs", "heavy metal angry"));
    }

    public MusicService(WebClient webClient) {
        this.webClient = webClient;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get songs for a specific mood. Results are cached to avoid hitting iTunes API repeatedly.
     */
    @Cacheable(value = "moodSongs", key = "#mood")
    public MoodResponse getSongsByMood(String mood) {
        String moodLower = mood.toLowerCase();
        List<String> searchTerms = MOOD_SEARCH_TERMS.getOrDefault(moodLower,
                List.of(moodLower + " songs", moodLower + " music"));

        Set<Long> seenTrackIds = new HashSet<>();
        List<Song> allSongs = new ArrayList<>();

        for (String term : searchTerms) {
            if (allSongs.size() >= 40) break;

            int limit = Math.min(40, 50 - allSongs.size());
            List<Song> songs = fetchFromItunes(term, limit);

            for (Song song : songs) {
                if (song.getPreviewUrl() != null && !song.getPreviewUrl().isEmpty()
                        && !seenTrackIds.contains(song.getTrackId())) {
                    seenTrackIds.add(song.getTrackId());
                    allSongs.add(song);
                }
                if (allSongs.size() >= 40) break;
            }
        }

        return new MoodResponse(moodLower, allSongs.size(), allSongs);
    }

    /**
     * Search songs by a custom query.
     */
    public MoodResponse searchSongs(String query) {
        List<Song> songs = fetchFromItunes(query, 40);
        List<Song> withPreview = songs.stream()
                .filter(s -> s.getPreviewUrl() != null && !s.getPreviewUrl().isEmpty())
                .collect(Collectors.toList());
        return new MoodResponse("search", withPreview.size(), withPreview);
    }

    /**
     * Get all available moods.
     */
    public List<String> getAvailableMoods() {
        return new ArrayList<>(MOOD_SEARCH_TERMS.keySet());
    }

    /**
     * Fetch songs from iTunes Search API.
     */
    private List<Song> fetchFromItunes(String term, int limit) {
        try {
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("term", term)
                            .queryParam("media", "music")
                            .queryParam("limit", limit)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null) return Collections.emptyList();

            JsonNode root = objectMapper.readTree(response);
            JsonNode results = root.get("results");

            if (results == null || !results.isArray()) return Collections.emptyList();

            List<Song> songs = new ArrayList<>();
            for (JsonNode node : results) {
                if (!"song".equals(node.path("kind").asText())) continue;

                String previewUrl = node.path("previewUrl").asText(null);
                if (previewUrl == null || previewUrl.isEmpty()) continue;

                // Upgrade artwork to 300x300 for better quality
                String artworkUrl = node.path("artworkUrl100").asText("");
                artworkUrl = artworkUrl.replace("100x100bb", "300x300bb");

                Song song = new Song(
                        node.path("trackId").asLong(),
                        node.path("trackName").asText("Unknown"),
                        node.path("artistName").asText("Unknown"),
                        node.path("collectionName").asText(""),
                        artworkUrl,
                        previewUrl,
                        node.path("primaryGenreName").asText(""),
                        node.path("trackTimeMillis").asLong(0),
                        node.path("releaseDate").asText("")
                );
                songs.add(song);
            }
            return songs;

        } catch (Exception e) {
            System.err.println("Error fetching from iTunes: " + e.getMessage());
            return Collections.emptyList();
        }
    }
}
