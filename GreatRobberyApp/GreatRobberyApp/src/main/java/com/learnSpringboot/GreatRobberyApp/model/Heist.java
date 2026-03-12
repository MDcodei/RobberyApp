package com.learnSpringboot.GreatRobberyApp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "plannedHeists")
public class Heist {

    // MongoDB primary key
    @Id
    private String id;   // MongoDB ObjectId stored as String

    // Auto-increment numeric ID
    @Transient
    public static final String SEQUENCE_NAME = "heist_sequence";

    @Indexed(unique = true)
    private long heistNumber;   // <-- This replaces your old Integer id

    private Target target;            
    private Difficulty difficulty;    
    private EscapeMethod escape;      
    private List<Item> tools;
    private String note;
    private String mentorName;

    // Default ctor
    public Heist() {
        this.tools = new ArrayList<>();
        this.note = "";
    }

    // Your constructor kept exactly the same
    public Heist(Target target, Difficulty difficulty, EscapeMethod escape, String mentorName) {
        this.target = target;
        this.difficulty = difficulty;
        this.escape = escape;
        this.tools = new ArrayList<>();
        this.note = "";
        this.mentorName = mentorName;
    }

    // ===== GETTERS =====
    public String getId() { return id; }
    public long getHeistNumber() { return heistNumber; }
    public Target getTarget() { return target; }
    public Difficulty getDifficulty() { return difficulty; }
    public EscapeMethod getEscape() { return escape; }
    public List<Item> getTools() { return tools; }
    public String getNote() { return note; }
    public String getMentorName() { return mentorName; }

    // ===== SETTERS =====
    public void setId(String id) { this.id = id; }
    public void setHeistNumber(long heistNumber) { this.heistNumber = heistNumber; }
    public void setTarget(Target target) { this.target = target; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public void setEscape(EscapeMethod escape) { this.escape = escape; }

    public void setTools(List<Item> tools) {
        this.tools = (tools == null) ? new ArrayList<>() : new ArrayList<>(tools);
    }

    public void setNote(String note) { this.note = note; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    // ===== Additional helpers you had =====
    public void addTool(Item tool) {
        if (tool != null) {
            tools.add(tool);
        }
    }

    public double calculateSubtotal() {
        double subtotal = 0;
        for (Item tool : tools) {
            subtotal += tool.getValue();
        }
        return subtotal;
    }

    public void printSummary(int heistNumber) {
        StringBuilder summary = new StringBuilder();
        summary.append("\n========================================\n");
        summary.append("          HEIST SUMMARY (").append(heistNumber).append(")\n");
        summary.append("========================================\n");
        summary.append("Target: ").append(target.getName()).append("\n");
        summary.append("Difficulty: ").append(difficulty.getName()).append("\n");
        summary.append("Escape: ").append(escape.getName()).append("\n");
        summary.append("Mentor: ").append(mentorName).append("\n");
        summary.append("Tools:\n");
        for (Item tool : tools) {
            summary.append(" - ").append(tool.getName())
                   .append(" ($").append(String.format("%.2f", tool.getValue())).append(")\n");
        }
        summary.append("Subtotal: $").append(String.format("%.2f", calculateSubtotal())).append("\n");
        if (note != null && !note.isEmpty()) {
            summary.append("Note: ").append(note).append("\n");
        }
        summary.append("----------------------------------------\n");
        System.out.print(summary.toString());
    }
}