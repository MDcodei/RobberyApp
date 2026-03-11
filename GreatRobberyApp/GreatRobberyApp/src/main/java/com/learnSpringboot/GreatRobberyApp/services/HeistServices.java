package com.learnSpringboot.GreatRobberyApp.services;

import com.learnSpringboot.GreatRobberyApp.model.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class HeistServices {

 
    private int heat = 0;
    private int streak = 0;
    private double totalEscapedLoot = 0.0;

    private final Random rng = new Random();

    private final City city = new City();
    private final Gang gang = new Gang();
    private final Police police = new Police();


    private final AtomicInteger seq = new AtomicInteger(1);


    private final List<Heist> plannedHeists = new ArrayList<>();


    public synchronized void addPlannedHeist(Heist heist) {
        if (heist.getId() == null) {
            heist.setId(seq.getAndIncrement()); 
        }
        plannedHeists.add(heist);

        
        System.out.println("[HeistServices] Planned heist id=" + heist.getId()
                + " target=" + (heist.getTarget() != null ? heist.getTarget().name() : "null")
                + " difficulty=" + (heist.getDifficulty() != null ? heist.getDifficulty().name() : "null")
                + " escape=" + (heist.getEscape() != null ? heist.getEscape().name() : "null"));
    }

 
    public synchronized List<Heist> getPlannedHeists() {
        return new ArrayList<>(plannedHeists);
    }

    
    public synchronized Heist getPlannedHeistById(int id) {
        return plannedHeists.stream()
                .filter(h -> Objects.equals(h.getId(), id))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Heist not found: " + id));
    }

    public HeistResult simulateSingleHeist(Heist heist) {
        HeistOutcome outcome = resolveHeist(heist);
        applyOutcome(outcome);
        return toResult(outcome);
    }

    public synchronized List<HeistResult> simulateAllHeists() {
        List<HeistResult> results = new ArrayList<>();
        for (Heist heist : plannedHeists) {
            HeistOutcome outcome = resolveHeist(heist);
            applyOutcome(outcome);
            results.add(toResult(outcome));
        }
        
        plannedHeists.clear();
        return results;
    }

    

    private HeistOutcome resolveHeist(Heist heist) {
        List<String> eventsApplied = new ArrayList<>();
        int successMod = 0;
        int catchMod = 0;

        
        if (rng.nextInt(100) < 20) {
            int eventRoll = rng.nextInt(3);

            switch (eventRoll) {
                case 0:
                    eventsApplied.add("Guard yawned");
                    successMod += 5;
                    break;
                case 1:
                    eventsApplied.add("Camera rebooted");
                    successMod += 5;
                    break;
                case 2:
                    eventsApplied.add("Rainstorm");
                    catchMod += 10;
                    break;
            }
        }

        
        int successChance = Balance.BASE_SUCCESS; 
        successChance += Balance.DIFF_BONUS.get(heist.getDifficulty());

        String mentorFirstName = heist.getMentorName().split(" ")[0];
        successChance += Balance.MENTOR_SUCCESS_BONUS.get(mentorFirstName);

        successChance += successMod;
        successChance = clamp(successChance, 5, 95);

        int successRoll = rng.nextInt(1, 101);
        boolean success = successRoll <= successChance;

        
        double lootValue = 0.0;

        if (success) {
            Building targetBuilding = null;
            for (Building b : city.getBuildings()) {
                if (b.getName().equals(heist.getTarget().getName())) {
                    targetBuilding = b;
                    break;
                }
            }

            if (targetBuilding != null) {
                for (Item item : targetBuilding.getItems()) {
                    lootValue += item.getValue();
                }
            }

            
            boolean hasGun = heist.getTools().stream().anyMatch(i -> "gun".equals(i.getName()));
            boolean hasKnife = heist.getTools().stream().anyMatch(i -> "knife".equals(i.getName()));

            if (hasGun && hasKnife) {
                lootValue *= 1.10;
            }
        }

        
        int catchChance = Balance.POLICE_BASE_CATCH;
        catchChance += Balance.ESCAPE_CATCH_MOD.get(heist.getEscape());
        catchChance += heat / 10;
        catchChance += catchMod;

        catchChance = clamp(catchChance, 5, 95);

        int chaseRoll = rng.nextInt(1, 101);
        boolean caughtByPolice = success && chaseRoll <= catchChance;

       
        String narrative;
        if (success) {
            narrative = caughtByPolice
                    ? "Blue lights flood the alley; bags recovered."
                    : "The crew slips away with the goods.";
        } else {
            narrative = "A misstep at the skylight forces a retreat.";
        }

        return new HeistOutcome(
                success,
                caughtByPolice,
                lootValue,
                successRoll,
                chaseRoll,
                successChance,
                catchChance,
                eventsApplied,
                narrative
        );
    }

    

    private void applyOutcome(HeistOutcome out) {
        if (out.isSuccess() && !out.isCaughtByPolice()) {
            streak++;
            heat = Math.max(0, heat - 5);
            totalEscapedLoot += out.getLootValue();
        } else if (out.isSuccess() && out.isCaughtByPolice()) {
            streak = 0;
            heat = Math.min(100, heat + 10);
        } else {
            streak = 0;
            heat = Math.min(100, heat + 5);
        }
    }

   

    private int clamp(int val, int min, int max) {
        return Math.max(min, Math.min(max, val));
    }

    private HeistResult toResult(HeistOutcome o) {
        return new HeistResult(
                o.isSuccess(),
                o.getLootValue(),
                o.getEventsApplied()
        );
    }

    public void deleteHeist(int id) {
    plannedHeists.removeIf(h -> h.getId() == id);
}

public Heist updateHeist(int id, Heist updated) {
    for (Heist h : plannedHeists) {
        if (h.getId() == id) {
            h.setTarget(updated.getTarget());
            h.setDifficulty(updated.getDifficulty());
            h.setEscape(updated.getEscape());
            h.setMentorName(updated.getMentorName());
            return h;
        }
    }
    throw new RuntimeException("Heist not found");
}
}