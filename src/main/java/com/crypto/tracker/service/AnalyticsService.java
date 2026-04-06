package com.crypto.tracker.service;


import com.crypto.tracker.model.Portfolio;
import com.crypto.tracker.model.AnalyticsResponse;
import com.crypto.tracker.repository.PortfolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private PortfolioRepository repo;

    @Autowired
    private PriceService priceService;

    public AnalyticsResponse getAnalytics(String username) {

        List<Portfolio> list = repo.findByUsername(username);

        // Group by unique crypto name
        Map<String, List<Portfolio>> groupedAssets = list.stream()
                .collect(Collectors.groupingBy(p -> p.getCryptoName().toUpperCase().trim()));

        List<String> assetNames = new ArrayList<>(groupedAssets.keySet());

        // Batch fetch current prices
        Map<String, Double> currentPrices = priceService.getPrices(assetNames);

        double totalInvestment = 0;
        double currentValue = 0;
        List<AnalyticsResponse.AssetDetail> assetDetails = new ArrayList<>();

        String topAsset = "N/A";
        double maxAssetValue = 0;

        for (Map.Entry<String, List<Portfolio>> entry : groupedAssets.entrySet()) {
            String assetName = entry.getKey();
            List<Portfolio> holdings = entry.getValue();
            double currentPrice = currentPrices.getOrDefault(assetName, 0.0);

            // Fallback for Analytics too
            if (currentPrice == 0) {
                currentPrice = priceService.getPrice(assetName);
            }
            if (currentPrice == 0) {
                currentPrice = holdings.stream().mapToDouble(Portfolio::getBuyPrice).average().orElse(0.0);
            }

            double totalQuantity = holdings.stream().mapToDouble(Portfolio::getQuantity).sum();
            double totalCost = holdings.stream().mapToDouble(p -> p.getBuyPrice() * p.getQuantity()).sum();
            double averageBuyPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
            
            double assetCurrentValue = totalQuantity * currentPrice;
            double assetProfitLoss = assetCurrentValue - totalCost;

            assetDetails.add(new AnalyticsResponse.AssetDetail(
                    assetName,
                    totalQuantity,
                    averageBuyPrice,
                    currentPrice,
                    assetProfitLoss
            ));

            totalInvestment += totalCost;
            currentValue += assetCurrentValue;

            if (assetCurrentValue >= maxAssetValue && assetCurrentValue > 0) {
                maxAssetValue = assetCurrentValue;
                topAsset = assetName;
            }
        }

        double totalProfitLoss = currentValue - totalInvestment;

        return new AnalyticsResponse(totalInvestment, currentValue, totalProfitLoss, topAsset, assetDetails);
    }
}
