package com.learnSpringboot.GreatRobberyApp.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.learnSpringboot.GreatRobberyApp.model.Heist;

public interface HeistRepository extends MongoRepository<Heist, String> {
    Heist findByHeistNumber(long heistNumber);
}