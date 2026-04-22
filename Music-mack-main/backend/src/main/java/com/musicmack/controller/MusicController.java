package com.musicmack.controller;

import com.musicmack.model.MoodResponse;
import com.musicmack.service.MusicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MusicController {

    private final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    /**
     * GET /api/moods
     * Returns list of available moods.
     */
    @GetMapping("/moods")
    public ResponseEntity<Map<String, List<String>>> getMoods() {
        List<String> moods = musicService.getAvailableMoods();
        return ResponseEntity.ok(Map.of("moods", moods));
    }

    /**
     * GET /api/songs/{mood}
     * Returns 30-40 songs for a given mood.
     * Example: /api/songs/happy, /api/songs/sad, /api/songs/chill
     */
    @GetMapping("/songs/{mood}")
    public ResponseEntity<MoodResponse> getSongsByMood(@PathVariable String mood) {
        MoodResponse response = musicService.getSongsByMood(mood);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/search?q=query
     * Search songs by query string.
     */
    @GetMapping("/search")
    public ResponseEntity<MoodResponse> searchSongs(@RequestParam("q") String query) {
        MoodResponse response = musicService.searchSongs(query);
        return ResponseEntity.ok(response);
    }
}
