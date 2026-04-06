package com.crypto.tracker.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PredictionService {

    public Map<String, Double> getSourcePredictions(List<Double> historicalPrices, double currentPrice, double paprikaPrice, double dexPrice, double cmcPrice) {
        Map<String, Double> sources = new HashMap<>();

        double oldPrice = historicalPrices.isEmpty() ? currentPrice * 0.98 : historicalPrices.get(0);
        double trend = currentPrice - oldPrice;
        double trendFactor = (currentPrice > 0) ? trend / currentPrice : 0;

        // Source 1: CoinGecko (Moving Average)
        double avg = historicalPrices.stream().mapToDouble(Double::doubleValue).average().orElse(currentPrice);
        sources.put("CoinGecko (MA)", (currentPrice + avg) / 2 + (trend * 0.3));

        // Source 2: CoinMarketCap (Market Trend)
        double cmcBase = (cmcPrice > 0) ? cmcPrice : currentPrice;
        sources.put("CoinMarketCap", cmcBase * (1 + trendFactor * 1.1));

        // Source 3: CoinPaprika (Price Analysis)
        double paprikaBase = (paprikaPrice > 0) ? paprikaPrice : currentPrice;
        sources.put("CoinPaprika", paprikaBase * (1 + trendFactor * 0.9));

        // Source 4: DexScreener (Momentum)
        double dexBase = (dexPrice > 0) ? dexPrice : currentPrice;
        sources.put("DexScreener", dexBase + (trend * 0.5));

        // Source 5: Linear Regression (Simple)
        sources.put("Linear Trend", currentPrice + trend);

        return sources;
    }

    public double aggregatePredictions(Map<String, Double> sourcePredictions) {
        return sourcePredictions.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }
}