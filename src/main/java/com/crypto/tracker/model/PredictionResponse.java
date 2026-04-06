package com.crypto.tracker.model;

import java.util.List;
import java.util.Map;

public class PredictionResponse {

    private String crypto;
    private double currentPrice;
    private double predictedPrice;
    private String recommendation;
    private List<Double> historicalPrices;
    private Map<String, Double> sourcePredictions;

    public PredictionResponse(String crypto, double currentPrice, double predictedPrice, String recommendation, List<Double> historicalPrices, Map<String, Double> sourcePredictions) {
        this.crypto = crypto;
        this.currentPrice = currentPrice;
        this.predictedPrice = predictedPrice;
        this.recommendation = recommendation;
        this.historicalPrices = historicalPrices;
        this.sourcePredictions = sourcePredictions;
    }

    public String getCrypto() { return crypto; }
    public double getCurrentPrice() { return currentPrice; }
    public double getPredictedPrice() { return predictedPrice; }
    public String getRecommendation() { return recommendation; }
    public List<Double> getHistoricalPrices() { return historicalPrices; }
    public Map<String, Double> getSourcePredictions() { return sourcePredictions; }
}