package com.learnSpringboot.GreatRobberyApp.controller;

import com.learnSpringboot.GreatRobberyApp.model.Criminal;
import com.learnSpringboot.GreatRobberyApp.model.Gang;
import com.learnSpringboot.GreatRobberyApp.model.Item;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000") // Allow React frontend to access this API
@RestController
@RequestMapping("/api/mentors")
public class MentorController {

    private final Gang gang = new Gang();  // Gang containing Rob + Bobby

    @GetMapping("/{name}/tools")
    public Item[] getMentorTools(@PathVariable String name) {
        Criminal criminal = gang.getCriminalByName(name);

        if (criminal == null) {
            return new Item[0]; // return empty array instead of error
        }

        return criminal.getItems(); // Item[]
    }
}