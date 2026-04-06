package com.crypto.tracker.service;

import org.springframework.stereotype.Service;

@Service
public class RecommendationService {

    public String getRecommendation(double currentPrice, double predictedPrice) {

        if (predictedPrice > currentPrice) {
            return "BUY";
        } else if (predictedPrice < currentPrice) {
            return "SELL";
        } else {
            return "HOLD";
        }
    }
}