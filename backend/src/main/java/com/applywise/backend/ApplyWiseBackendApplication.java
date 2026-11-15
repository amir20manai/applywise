package com.applywise.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ApplyWiseBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApplyWiseBackendApplication.class, args);
    }
}