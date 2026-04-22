package com.musicmack.model;

public class Song {
    private long trackId;
    private String trackName;
    private String artistName;
    private String collectionName;
    private String artworkUrl100;
    private String previewUrl;
    private String primaryGenreName;
    private long trackTimeMillis;
    private String releaseDate;

    public Song() {}

    public Song(long trackId, String trackName, String artistName, String collectionName,
                String artworkUrl100, String previewUrl, String primaryGenreName,
                long trackTimeMillis, String releaseDate) {
        this.trackId = trackId;
        this.trackName = trackName;
        this.artistName = artistName;
        this.collectionName = collectionName;
        this.artworkUrl100 = artworkUrl100;
        this.previewUrl = previewUrl;
        this.primaryGenreName = primaryGenreName;
        this.trackTimeMillis = trackTimeMillis;
        this.releaseDate = releaseDate;
    }

    // Getters and Setters
    public long getTrackId() { return trackId; }
    public void setTrackId(long trackId) { this.trackId = trackId; }

    public String getTrackName() { return trackName; }
    public void setTrackName(String trackName) { this.trackName = trackName; }

    public String getArtistName() { return artistName; }
    public void setArtistName(String artistName) { this.artistName = artistName; }

    public String getCollectionName() { return collectionName; }
    public void setCollectionName(String collectionName) { this.collectionName = collectionName; }

    public String getArtworkUrl100() { return artworkUrl100; }
    public void setArtworkUrl100(String artworkUrl100) { this.artworkUrl100 = artworkUrl100; }

    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }

    public String getPrimaryGenreName() { return primaryGenreName; }
    public void setPrimaryGenreName(String primaryGenreName) { this.primaryGenreName = primaryGenreName; }

    public long getTrackTimeMillis() { return trackTimeMillis; }
    public void setTrackTimeMillis(long trackTimeMillis) { this.trackTimeMillis = trackTimeMillis; }

    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }
}
