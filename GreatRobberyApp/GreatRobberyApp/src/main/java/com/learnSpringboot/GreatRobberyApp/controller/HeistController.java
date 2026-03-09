package com.learnSpringboot.GreatRobberyApp.controller;

import com.learnSpringboot.GreatRobberyApp.model.Heist;
import com.learnSpringboot.GreatRobberyApp.model.HeistResult;
import com.learnSpringboot.GreatRobberyApp.services.HeistServices;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/heists")
public class HeistController {

    private final HeistServices service;

    public HeistController(HeistServices service) {
        this.service = service;
    }

    // -------------------------------------------
    // PLAN A HEIST
    // -------------------------------------------
    @PostMapping("/plan")
    public String planHeist(@RequestBody Heist heist) {
        service.addPlannedHeist(heist);
        return "Heist planned successfully!";
    }

    // -------------------------------------------
    // VIEW PLANNED HEISTS
    // -------------------------------------------
    @GetMapping("/planned")
    public List<Heist> getPlannedHeists() {
        return service.getPlannedHeists();
    }

    // -------------------------------------------
    // SIMULATE A SINGLE HEIST
    // -------------------------------------------
    @PostMapping("/simulate")
    public HeistResult simulateSingleHeist(@RequestBody Heist heist) {
        return service.simulateSingleHeist(heist);
    }

    // -------------------------------------------
    // SIMULATE ALL HEISTS
    // -------------------------------------------
    @PostMapping("/simulate-all")
    public List<HeistResult> simulateAll() {
        return service.simulateAllHeists();
    }
}