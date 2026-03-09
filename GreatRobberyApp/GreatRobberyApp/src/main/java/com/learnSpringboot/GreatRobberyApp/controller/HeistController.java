package com.learnSpringboot.GreatRobberyApp.controller;

import com.learnSpringboot.GreatRobberyApp.model.Heist;
import com.learnSpringboot.GreatRobberyApp.model.HeistResult;
import com.learnSpringboot.GreatRobberyApp.services.HeistServices;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
   /* @PostMapping("/plan")
    public String planHeist(@RequestBody Heist heist) {
        service.addPlannedHeist(heist);
        return "Heist planned successfully!";
    }*/

    @PostMapping("/plan")
    public Map<String, Object> planHeist(@RequestBody Heist heist) {
    service.addPlannedHeist(heist);
    return Map.of("message", "Heist planned successfully!", "id", heist.getId());
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

    @PostMapping("/{id}/simulate")
public HeistResult simulateById(@PathVariable int id) {
    Heist heist = service.getPlannedHeistById(id);
    return service.simulateSingleHeist(heist);
}

    
}