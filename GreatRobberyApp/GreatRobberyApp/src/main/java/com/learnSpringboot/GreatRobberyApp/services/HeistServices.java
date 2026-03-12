package com.learnSpringboot.GreatRobberyApp.services;

import com.learnSpringboot.GreatRobberyApp.model.*;

import com.learnSpringboot.GreatRobberyApp.repository.HeistRepository;
import org.springframework.beans.factory.annotation.Autowired;

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

    
    @Autowired
    private HeistRepository repo;

    @Autowired
    private SequenceGeneratorService sequenceGenerator;
 
    private int heat = 0;
    private int streak = 0;
    private double totalEscapedLoot = 0.0;

    private final Random rng = new Random();

    private final City city = new City();
    private final Gang gang = new Gang();
    private final Police police = new Police();


    //private final AtomicInteger seq = new AtomicInteger(1);


    //private final List<Heist> plannedHeists = new ArrayList<>();


    public synchronized Heist addPlannedHeist(Heist heist) {
        if (heist.getHeistNumber() == 0) {
            long next = sequenceGenerator.generateSequence(Heist.SEQUENCE_NAME);
            heist.setHeistNumber(next);
            //heist.setId(seq.getAndIncrement()); 
        }
        Heist saved = repo.save(heist);

        
        System.out.println("[HeistServices] Planned heist heistNumber=" + heist.getHeistNumber()
                + " target=" + (saved.getTarget() != null ? saved.getTarget().name() : "null")
                + " difficulty=" + (saved.getDifficulty() != null ? saved.getDifficulty().name() : "null")
                + " escape=" + (saved.getEscape() != null ? saved.getEscape().name() : "null"));
        return saved;
    }

 
    public synchronized List<Heist> getPlannedHeists() {
        return repo.findAll();
    }

    
    public synchronized Heist getPlannedHeistbyHeistNumber(long heistNumber) {
        Heist h = repo.findByHeistNumber(heistNumber);
        if (h == null) {
            throw new NoSuchElementException("Heist with heistNumber " + heistNumber + " not found");
        }
        return h;
    }

    public HeistResult simulateSingleHeist(Heist heist) {
        HeistOutcome outcome = resolveHeist(heist);
        applyOutcome(outcome);
        return toResult(outcome);
    }

    
public synchronized List<HeistResult> simulateAllHeists() {
        List<Heist> all = repo.findAll();
        List<HeistResult> results = new ArrayList<>();
        for (Heist heist : all) {
            HeistOutcome outcome = resolveHeist(heist);
            applyOutcome(outcome);
            results.add(toResult(outcome));
        }
        repo.deleteAll(); // same behavior as clearing the list
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

    public synchronized void deleteHeist(long heistNumber) {
        Heist h = repo.findByHeistNumber(heistNumber);
        if (h != null) repo.delete(h);
    }


 public synchronized Heist updateHeist(long heistNumber, Heist updated) {
        Heist existing = repo.findByHeistNumber(heistNumber);
        if (existing == null) throw new NoSuchElementException("Heist not found: " + heistNumber);

        existing.setTarget(updated.getTarget());
        existing.setDifficulty(updated.getDifficulty());
        existing.setEscape(updated.getEscape());
        existing.setMentorName(updated.getMentorName());
        existing.setTools(updated.getTools());
        existing.setNote(updated.getNote());

        return repo.save(existing);
    }
}