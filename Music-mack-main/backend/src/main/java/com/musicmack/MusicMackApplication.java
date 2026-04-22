package com.musicmack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MusicMackApplication {
    public static void main(String[] args) {
        SpringApplication.run(MusicMackApplication.class, args);
    }
}
