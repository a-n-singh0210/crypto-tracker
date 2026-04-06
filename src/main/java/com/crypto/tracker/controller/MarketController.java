package com.crypto.tracker.controller;

import com.crypto.tracker.service.PriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/market")
@CrossOrigin
public class MarketController {

    @Autowired
    private PriceService priceService;

    @SuppressWarnings("unchecked")
    @GetMapping("/global")
    public Map<String, Object> getGlobalMarketData() {
        // Fetch top 5 coins
        List<Map<String, Object>> topCoins = priceService.getTopCoins(5);
        
        // Determine if data is fresh or from local fallback cache
        boolean isFresh = true;
        // Simple heuristic: if we have a lot of requests, some might fail and use fallback
        // We'll mark the whole response
        
        List<Map<String, Object>> processedCoins = topCoins.stream().map(coin -> {
            // Create a deep-ish copy to avoid modifying the cache directly
            Map<String, Object> result = new HashMap<>(coin);
            
            // Extract current price in INR (this is already in INR from the API)
            double currentPriceInr = 0.0;
            Object cp = coin.get("current_price");
            if (cp instanceof Number) {
                currentPriceInr = ((Number) cp).doubleValue();
            }

            // Extract sparkline data
            if (coin.containsKey("sparkline_in_7d")) {
                Map<String, Object> sparkline = (Map<String, Object>) coin.get("sparkline_in_7d");
                if (sparkline != null && sparkline.containsKey("price")) {
                    List<Number> rawPrices = (List<Number>) sparkline.get("price");
                    
                    if (rawPrices != null && !rawPrices.isEmpty() && currentPriceInr > 0) {
                        // Find the last non-zero price to determine if we need to scale (USD to INR)
                        double lastValidRaw = 0.0;
                        for (int i = rawPrices.size() - 1; i >= 0; i--) {
                            Number p = rawPrices.get(i);
                            if (p != null && p.doubleValue() > 0) {
                                lastValidRaw = p.doubleValue();
                                break;
                            }
                        }

                        // Calculate the scaling ratio
                        double ratio = (lastValidRaw > 0) ? (currentPriceInr / lastValidRaw) : 92.5;

                        // Create the converted sparkline
                        List<Double> convertedPrices = new ArrayList<>();
                        for (Number p : rawPrices) {
                            if (p == null) {
                                convertedPrices.add(0.0);
                            } else {
                                double val = p.doubleValue() * ratio;
                                if (val > currentPriceInr * 5) val = currentPriceInr;
                                convertedPrices.add(val);
                            }
                        }
                        result.put("sparkline_7d", convertedPrices);
                    }
                }
            }
            return result;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("coins", processedCoins);
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", priceService.isMarketRateLimited() ? "rate_limited" : "success"); 
        
        return response;
    }
}
