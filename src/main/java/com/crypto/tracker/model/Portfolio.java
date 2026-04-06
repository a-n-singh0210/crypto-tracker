package com.crypto.tracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "portfolio")
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cryptoName;
    private double quantity;
    private double buyPrice;

    private String username; // simple mapping (no relations for now)

    // Getters & Setters
    public Long getId() { return id; }

    public String getCryptoName() { return cryptoName; }
    public void setCryptoName(String cryptoName) { this.cryptoName = cryptoName; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }

    public double getBuyPrice() { return buyPrice; }
    public void setBuyPrice(double buyPrice) { this.buyPrice = buyPrice; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}