package com.learnSpringboot.GreatRobberyApp.services;

import com.learnSpringboot.GreatRobberyApp.model.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class HeistServices {

    // Session state (moved from static fields)
    private int heat = 0;
    private int streak = 0;
    private double totalEscapedLoot = 0.0;

    private final Random rng = new Random();

    private final City city = new City();
    private final Gang gang = new Gang();
    private final Police police = new Police();

    // Store planned heists in memory
    private final List<Heist> plannedHeists = new ArrayList<>();

    // ---------------------------
    // PUBLIC API METHODS
    // ---------------------------

    public List<Heist> getPlannedHeists() {
        return plannedHeists;
    }

    public void addPlannedHeist(Heist heist) {
        plannedHeists.add(heist);
    }

    public HeistResult simulateSingleHeist(Heist heist) {
        HeistOutcome outcome = resolveHeist(heist);
        applyOutcome(outcome);
        return toResult(outcome);
    }

    public List<HeistResult> simulateAllHeists() {
        List<HeistResult> results = new ArrayList<>();

        for (Heist heist : plannedHeists) {
            HeistOutcome outcome = resolveHeist(heist);
            applyOutcome(outcome);
            results.add(toResult(outcome));
        }

        plannedHeists.clear();
        return results;
    }

    // ----------------------------
    // CORE LOGIC (converted from old file)
    // ----------------------------

    private HeistOutcome resolveHeist(Heist heist) {
        List<String> eventsApplied = new ArrayList<>();
        int successMod = 0;
        int catchMod = 0;

        // ----- RANDOM EVENTS (20% chance) -----
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

        // ----- SUCCESS CHANCE (BASE + DIFFICULTY + MENTOR + EVENT BONUS) -----
        int successChance = Balance.BASE_SUCCESS; // 30%
        successChance += Balance.DIFF_BONUS.get(heist.getDifficulty());

        String mentorFirstName = heist.getMentorName().split(" ")[0];
        successChance += Balance.MENTOR_SUCCESS_BONUS.get(mentorFirstName);

        successChance += successMod;
        successChance = clamp(successChance, 5, 95);

        int successRoll = rng.nextInt(1, 101);
        boolean success = successRoll <= successChance;

        // ----- LOOT CALCULATION -----
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

            // Bonus 10% for gun + knife
            boolean hasGun = heist.getTools().stream()
                    .anyMatch(i -> i.getName().equals("gun"));

            boolean hasKnife = heist.getTools().stream()
                    .anyMatch(i -> i.getName().equals("knife"));

            if (hasGun && hasKnife) {
                lootValue *= 1.10;
            }
        }

        // ----- POLICE CATCH CALCULATION -----
        int catchChance = Balance.POLICE_BASE_CATCH;
        catchChance += Balance.ESCAPE_CATCH_MOD.get(heist.getEscape());
        catchChance += heat / 10;
        catchChance += catchMod;

        catchChance = clamp(catchChance, 5, 95);

        int chaseRoll = rng.nextInt(1, 101);
        boolean caughtByPolice = success && chaseRoll <= catchChance;

        // ----- OUTCOME NARRATIVE -----
        String narrative;
        if (success) {
            if (caughtByPolice) {
                narrative = "Blue lights flood the alley; bags recovered.";
            } else {
                narrative = "The crew slips away with the goods.";
            }
        } else {
            narrative = "A misstep at the skylight forces a retreat.";
        }

        return new HeistOutcome(success, caughtByPolice, lootValue,
                successRoll, chaseRoll, successChance, catchChance,
                eventsApplied, narrative);
    }

    // ----------------------------
    // APPLY OUTCOME TO SESSION STATE
    // ----------------------------

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

    // ---------------------------
    // HELPERS
    // ---------------------------

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

}