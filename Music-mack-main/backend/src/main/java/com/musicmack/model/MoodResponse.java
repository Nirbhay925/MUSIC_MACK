package com.musicmack.model;

import java.util.List;

public class MoodResponse {
    private String mood;
    private int count;
    private List<Song> songs;

    public MoodResponse() {}

    public MoodResponse(String mood, int count, List<Song> songs) {
        this.mood = mood;
        this.count = count;
        this.songs = songs;
    }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public List<Song> getSongs() { return songs; }
    public void setSongs(List<Song> songs) { this.songs = songs; }
}
