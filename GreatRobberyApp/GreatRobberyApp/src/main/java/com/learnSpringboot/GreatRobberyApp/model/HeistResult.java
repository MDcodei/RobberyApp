package com.learnSpringboot.GreatRobberyApp.model;

import java.util.List;

public class HeistResult {
    private boolean success;
    private double lootValue;
    private List<String> events;

    public HeistResult() {}

    public HeistResult(boolean success, double lootValue, List<String> events) {
        this.success = success;
        this.lootValue = lootValue;
        this.events = events;
    }

    public boolean isSuccess() { return success; }
    public double getLootValue() { return lootValue; }
    public List<String> getEvents() { return events; }

    public void setSuccess(boolean success) { this.success = success; }
    public void setLootValue(double lootValue) { this.lootValue = lootValue; }
    public void setEvents(List<String> events) { this.events = events; }
}