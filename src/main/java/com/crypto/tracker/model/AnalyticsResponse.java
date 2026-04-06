package com.crypto.tracker.model;

import java.util.List;

public class AnalyticsResponse {

    private double totalInvestment;
    private double currentValue;
    private double profitLoss;
    private String topAsset;
    private List<AssetDetail> assetDetails;

    public static class AssetDetail {
        private String name;
        private double quantity;
        private double averageBuyPrice;
        private double currentPrice;
        private double profitLoss;

        public AssetDetail(String name, double quantity, double averageBuyPrice, double currentPrice, double profitLoss) {
            this.name = name;
            this.quantity = quantity;
            this.averageBuyPrice = averageBuyPrice;
            this.currentPrice = currentPrice;
            this.profitLoss = profitLoss;
        }

        // Getters
        public String getName() { return name; }
        public double getQuantity() { return quantity; }
        public double getAverageBuyPrice() { return averageBuyPrice; }
        public double getCurrentPrice() { return currentPrice; }
        public double getProfitLoss() { return profitLoss; }
    }

    public AnalyticsResponse(double totalInvestment, double currentValue, double profitLoss, String topAsset, List<AssetDetail> assetDetails) {
        this.totalInvestment = totalInvestment;
        this.currentValue = currentValue;
        this.profitLoss = profitLoss;
        this.topAsset = topAsset;
        this.assetDetails = assetDetails;
    }

    // Getters
    public double getTotalInvestment() { return totalInvestment; }
    public double getCurrentValue() { return currentValue; }
    public double getProfitLoss() { return profitLoss; }
    public String getTopAsset() { return topAsset; }
    public List<AssetDetail> getAssetDetails() { return assetDetails; }
}