package com.learnSpringboot.GreatRobberyApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;


@SpringBootApplication
public class GreatRobberyAppApplication {

	@Value("${spring.data.mongodb.uri:NOT_FOUND}")
String uri;

@PostConstruct
public void debugUri() {
    System.out.println(">>> DEBUG MONGO URI = " + uri);
}

	public static void main(String[] args) {
		SpringApplication.run(GreatRobberyAppApplication.class, args);
	}

}
