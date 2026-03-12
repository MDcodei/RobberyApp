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

    // ================== PLAN HEIST ==================
    @PostMapping("/plan")
    public Map<String, Object> planHeist(@RequestBody Heist heist) {

        Heist saved = service.addPlannedHeist(heist);

        return Map.of(
                "message", "Heist planned successfully!",
                "mongoId", saved.getId(),          // MongoDB _id
                "heistNumber", saved.getHeistNumber() // your numeric auto-increment
        );
    }

    // ================== GET ALL ==================
    @GetMapping("/planned")
    public List<Heist> getPlannedHeists() {
        return service.getPlannedHeists();
    }

    // ================== GET BY HEIST NUMBER ==================
    @GetMapping("/{heistNumber}")
    public Heist getByHeistNumber(@PathVariable long heistNumber) {
        return service.getPlannedHeistbyHeistNumber(heistNumber);
    }

    // ================== UPDATE ==================
    @PutMapping("/{heistNumber}")
    public Heist updateHeist(@PathVariable long heistNumber, @RequestBody Heist updated) {
        return service.updateHeist(heistNumber, updated);
    }

    // ================== DELETE ==================
    @DeleteMapping("/{heistNumber}")
    public Map<String, String> deleteHeist(@PathVariable long heistNumber) {
        service.deleteHeist(heistNumber);
        return Map.of("message", "Heist deleted");
    }

    // ================== SIMULATE SINGLE (RAW HEIST PAYLOAD) ==================
    @PostMapping("/simulate")
    public HeistResult simulateSingleHeist(@RequestBody Heist heist) {
        return service.simulateSingleHeist(heist);
    }

    // ================== SIMULATE ALL ==================
    @PostMapping("/simulate-all")
    public List<HeistResult> simulateAll() {
        return service.simulateAllHeists();
    }

    // ================== SIMULATE BY HEIST NUMBER ==================
    @PostMapping("/{heistNumber}/simulate")
    public Map<String, Object> simulateByNumber(@PathVariable long heistNumber) {

        Heist heist = service.getPlannedHeistbyHeistNumber(heistNumber);
        HeistResult result = service.simulateSingleHeist(heist);

        String summary = (result.isSuccess() ? "SUCCESS" : "FAILED")
                + " | Target: " + heist.getTarget()
                + " | Difficulty: " + heist.getDifficulty()
                + " | Escape: " + heist.getEscape()
                + " | Loot: $" + result.getLootValue()
                + " | Mentor: " + heist.getMentorName();

        return Map.of(
                "summary", summary,
                "success", result.isSuccess(),
                "lootValue", result.getLootValue(),
                "events", result.getEvents(),
                "heistNumber", heist.getHeistNumber(),
                "mongoId", heist.getId()
        );
    }
}