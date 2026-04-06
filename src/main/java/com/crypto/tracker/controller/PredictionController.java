package com.crypto.tracker.controller;

import com.crypto.tracker.model.Portfolio;
import com.crypto.tracker.model.PredictionResponse;
import com.crypto.tracker.repository.PortfolioRepository;
import com.crypto.tracker.service.PriceService;
import com.crypto.tracker.service.PredictionService;
import com.crypto.tracker.service.RecommendationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/predict")
@CrossOrigin
public class PredictionController {

    @Autowired
    private PortfolioRepository repo;

    @Autowired
    private PriceService priceService;

    @Autowired
    private PredictionService predictionService;

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/{username}")
    public List<PredictionResponse> predict(@PathVariable String username) {

        List<Portfolio> portfolio = repo.findByUsername(username);

        // Get all unique crypto names from portfolio (case-insensitive)
        List<String> assetNames = portfolio.stream()
                .map(p -> p.getCryptoName().toUpperCase().trim())
                .distinct()
                .collect(Collectors.toList());

        // Batch fetch current prices
        Map<String, Double> currentPrices = priceService.getPrices(assetNames);

        return assetNames.parallelStream().map(assetName -> {
            double currentPrice = currentPrices.getOrDefault(assetName, 0.0);
            
            // Secondary Fallback: Use average buy price from portfolio if still 0
            if (currentPrice == 0) {
                currentPrice = portfolio.stream()
                        .filter(p -> p.getCryptoName().equalsIgnoreCase(assetName))
                        .mapToDouble(Portfolio::getBuyPrice)
                        .average()
                        .orElse(0.0);
            }
            
            List<Double> historicalPrices = priceService.getHistoricalPrices(assetName, 7);

            double paprikaPrice = priceService.getPriceFromCoinPaprika(assetName);
            double dexPrice = priceService.getPriceFromDexScreener(assetName);
            double cmcPrice = priceService.getPriceFromCoinMarketCap(assetName);

            Map<String, Double> sourcePredictions = predictionService.getSourcePredictions(historicalPrices, currentPrice, paprikaPrice, dexPrice, cmcPrice);
            double predicted = predictionService.aggregatePredictions(sourcePredictions);

            String recommendation = recommendationService.getRecommendation(currentPrice, predicted);

            return new PredictionResponse(
                    assetName,
                    currentPrice,
                    predicted,
                    recommendation,
                    historicalPrices,
                    sourcePredictions
            );
        }).collect(Collectors.toList());
    }
}