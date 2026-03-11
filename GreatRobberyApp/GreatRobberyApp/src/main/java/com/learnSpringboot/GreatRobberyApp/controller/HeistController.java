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

   /* @PostMapping("/plan")
    public String planHeist(@RequestBody Heist heist) {
        service.addPlannedHeist(heist);
        return "Heist planned successfully!";
    }*/

    @DeleteMapping("/{id}")
public Map<String, String> deleteHeist(@PathVariable int id) {
    service.deleteHeist(id);
    return Map.of("message", "Heist deleted");
}

@PutMapping("/{id}")
public Heist updateHeist(@PathVariable int id, @RequestBody Heist updated) {
    return service.updateHeist(id, updated);
}

    @PostMapping("/plan")
    public Map<String, Object> planHeist(@RequestBody Heist heist) {
    service.addPlannedHeist(heist);
    return Map.of("message", "Heist planned successfully!", "id", heist.getId());
}


    @GetMapping("/planned")
    public List<Heist> getPlannedHeists() {
        return service.getPlannedHeists();
    }


    @PostMapping("/simulate")
    public HeistResult simulateSingleHeist(@RequestBody Heist heist) {
        return service.simulateSingleHeist(heist);
    }


    @PostMapping("/simulate-all")
    public List<HeistResult> simulateAll() {
        return service.simulateAllHeists();
    }

//     @PostMapping("/{id}/simulate")
// public HeistResult simulateById(@PathVariable int id) {
//     Heist heist = service.getPlannedHeistById(id);
//     return service.simulateSingleHeist(heist);
// }

@PostMapping("/{id}/simulate")
public Map<String, Object> simulateById(@PathVariable int id) {

    System.out.println(">>> HIT SIMULATE BY ID");  // DEBUG

    Heist heist = service.getPlannedHeistById(id);
    HeistResult result = service.simulateSingleHeist(heist);

    String summary =
            (result.isSuccess() ? "SUCCESS" : "FAILED") +
            " | Target: " + heist.getTarget() +
            " | Difficulty: " + heist.getDifficulty() +
            " | Escape: " + heist.getEscape() +
            " | Loot: $" + result.getLootValue() +
            " | Mentor: " + heist.getMentorName();

    return Map.of(
            "summary", summary,
            "success", result.isSuccess(),
            "lootValue", result.getLootValue(),
            "events", result.getEvents(),
            "id", heist.getId()
    );
}

}