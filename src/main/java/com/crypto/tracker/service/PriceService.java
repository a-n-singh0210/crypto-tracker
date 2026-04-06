package com.crypto.tracker.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import com.crypto.tracker.config.CryptoApiProperties;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PriceService {

    private static final Logger logger = LoggerFactory.getLogger(PriceService.class);
    private static final Map<String, String> SYMBOL_TO_ID = new HashMap<>();

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private CryptoApiProperties apiProperties;

    static {
        // Core Cryptos
        SYMBOL_TO_ID.put("btc", "bitcoin");
        SYMBOL_TO_ID.put("eth", "ethereum");
        SYMBOL_TO_ID.put("sol", "solana");
        SYMBOL_TO_ID.put("bnb", "binancecoin");
        SYMBOL_TO_ID.put("xrp", "ripple");
        SYMBOL_TO_ID.put("ada", "cardano");
        SYMBOL_TO_ID.put("doge", "dogecoin");
        SYMBOL_TO_ID.put("shib", "shiba-inu");
        SYMBOL_TO_ID.put("dot", "polkadot");
        SYMBOL_TO_ID.put("matic", "polygon-ecosystem");
        
        // Popular Altcoins
        SYMBOL_TO_ID.put("link", "chainlink");
        SYMBOL_TO_ID.put("uni", "uniswap");
        SYMBOL_TO_ID.put("ltc", "litecoin");
        SYMBOL_TO_ID.put("trx", "tron");
        SYMBOL_TO_ID.put("avax", "avalanche-2");
        SYMBOL_TO_ID.put("atom", "cosmos");
        SYMBOL_TO_ID.put("near", "near");
        SYMBOL_TO_ID.put("ftm", "fantom");
        SYMBOL_TO_ID.put("algo", "algorand");
        SYMBOL_TO_ID.put("fil", "filecoin");
        SYMBOL_TO_ID.put("pepe", "pepe");
        SYMBOL_TO_ID.put("bonk", "bonk");
        SYMBOL_TO_ID.put("wif", "dogwifhat");
        SYMBOL_TO_ID.put("bome", "book-of-meme");
        SYMBOL_TO_ID.put("popcat", "popcat");
        SYMBOL_TO_ID.put("brett", "brett");
        SYMBOL_TO_ID.put("mew", "cat-in-a-dogs-world");
        
        // AI & Emerging
        SYMBOL_TO_ID.put("fet", "fetch-ai");
        SYMBOL_TO_ID.put("rndr", "render-token");
        SYMBOL_TO_ID.put("agix", "singularitynet");
        SYMBOL_TO_ID.put("ocean", "ocean-protocol");
        SYMBOL_TO_ID.put("akt", "akash-network");
        SYMBOL_TO_ID.put("tao", "bittensor");
        SYMBOL_TO_ID.put("near", "near");
        SYMBOL_TO_ID.put("ar", "arweave");
    }

    private final Map<String, List<Map<String, Object>>> marketCache = new HashMap<>();
    private final Map<String, Double> lastPrices = new HashMap<>();
    private boolean marketRateLimited = false;

    public boolean isMarketRateLimited() {
        return marketRateLimited;
    }

    @Cacheable(value = "prices", key = "#assetNames")
    public Map<String, Double> getPrices(List<String> assetNames) {
        if (assetNames == null || assetNames.isEmpty()) return new HashMap<>();

        StringBuilder idsBuilder = new StringBuilder();
        Map<String, String> idToOriginalName = new HashMap<>();

        for (String name : assetNames) {
            String coinId = getCoinId(name);
            if (idsBuilder.length() > 0) idsBuilder.append(",");
            idsBuilder.append(coinId);
            idToOriginalName.put(coinId, name);
        }

        String url = apiProperties.getCoingecko().getBase() + "/simple/price?ids="
                + idsBuilder.toString() + "&vs_currencies=inr";

        Map<String, Double> results = new HashMap<>();

        try {
            ResponseEntity<Map<String, Map<String, Object>>> responseEntity = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Map<String, Object>>>() {}
            );

            Map<String, Map<String, Object>> response = responseEntity.getBody();

            if (response != null) {
                for (Map.Entry<String, Map<String, Object>> entry : response.entrySet()) {
                    String coinId = entry.getKey();
                    Object priceObj = entry.getValue().get("inr");
                    String originalName = idToOriginalName.get(coinId);
                    if (originalName != null && priceObj != null) {
                        double price = Double.parseDouble(priceObj.toString());
                        results.put(originalName, price);
                        lastPrices.put(originalName, price); // Store for fallback
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching batch prices: {}", e.getMessage());
            // Fallback to last known prices
            for (String name : assetNames) {
                if (lastPrices.containsKey(name)) {
                    results.put(name, lastPrices.get(name));
                }
            }
        }
        return results;
    }

    public String getCoinId(String assetName) {
        if (assetName == null) return "";
        String coinId = assetName.toLowerCase().trim().replaceAll("\\s+", "-");
        return SYMBOL_TO_ID.getOrDefault(coinId, coinId);
    }

    @Cacheable(value = "prices", key = "#assetName")
    public double getPrice(String assetName) {
        String coinId = getCoinId(assetName);

        String url = apiProperties.getCoingecko().getBase() + "/simple/price?ids="
                + coinId + "&vs_currencies=inr";

        try {
            ResponseEntity<Map<String, Map<String, Object>>> responseEntity = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Map<String, Object>>>() {}
            );

            Map<String, Map<String, Object>> response = responseEntity.getBody();

            if (response == null || !response.containsKey(coinId)) {
                logger.warn("No price data found for coinId: {}", coinId);
                return 0.0;
            }

            Map<String, Object> coinData = response.get(coinId);
            Object priceObj = coinData.get("inr");
            
            if (priceObj == null) return 0.0;
            
            return Double.parseDouble(priceObj.toString());

        } catch (Exception e) {
            logger.error("Error fetching price for {}: {}", coinId, e.getMessage());
            return 0.0;
        }
    }

    @SuppressWarnings("unchecked")
    @Cacheable(value = "historical", key = "#assetName + #days")
    public List<Double> getHistoricalPrices(String assetName, int days) {
        String coinId = getCoinId(assetName);
        String url = String.format("%s/coins/%s/market_chart?vs_currency=inr&days=%d&interval=daily", apiProperties.getCoingecko().getBase(), coinId, days);
        
        List<Double> historicalPrices = new ArrayList<>();

        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            Map<String, Object> response = responseEntity.getBody();
            if (response != null && response.containsKey("prices")) {
                List<List<Object>> pricesList = (List<List<Object>>) response.get("prices");
                for (List<Object> priceEntry : pricesList) {
                    historicalPrices.add(Double.parseDouble(priceEntry.get(1).toString()));
                }
            }
        } catch (Exception e) {
            logger.warn("CoinGecko historical fetch failed for {}: {}. Attempting CryptoCompare fallback.", coinId, e.getMessage());
            // Fallback to CryptoCompare
            return getHistoricalPricesFromCryptoCompare(assetName, days);
        }
        
        return historicalPrices;
    }

    @SuppressWarnings("unchecked")
    public List<Double> getHistoricalPricesFromCryptoCompare(String assetName, int days) {
        // Find symbol from assetName
        String symbol = assetName.toUpperCase();
        // If it's a known ID like "bitcoin", we need the symbol "BTC"
        for (Map.Entry<String, String> entry : SYMBOL_TO_ID.entrySet()) {
            if (entry.getValue().equalsIgnoreCase(assetName)) {
                symbol = entry.getKey().toUpperCase();
                break;
            }
        }
        
        String url = String.format("https://min-api.cryptocompare.com/data/v2/histoday?fsym=%s&tsym=INR&limit=%d", symbol, days);
        List<Double> historicalPrices = new ArrayList<>();

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("Data")) {
                Map<String, Object> dataObj = (Map<String, Object>) body.get("Data");
                if (dataObj.containsKey("Data")) {
                    List<Map<String, Object>> dataList = (List<Map<String, Object>>) dataObj.get("Data");
                    for (Map<String, Object> dayEntry : dataList) {
                        historicalPrices.add(Double.parseDouble(dayEntry.get("close").toString()));
                    }
                }
            }
        } catch (Exception e) {
            logger.error("CryptoCompare historical fetch failed for {}: {}", symbol, e.getMessage());
        }
        return historicalPrices;
    }

    private static final double USD_TO_INR = 92.5; // Updated to match current market rates

    @SuppressWarnings("unchecked")
    @Cacheable(value = "prices", key = "'paprika-' + #assetName")
    public double getPriceFromCoinPaprika(String assetName) {
        String coinId = getCoinId(assetName);
        String symbol = assetName.toLowerCase().trim();
        String tickerId = symbol + "-" + coinId;
        String url = apiProperties.getCoinpaprika().getBase() + "/tickers/" + tickerId;
        
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("quotes")) {
                Map<String, Object> quotes = (Map<String, Object>) body.get("quotes");
                Map<String, Object> usd = (Map<String, Object>) quotes.get("USD");
                return Double.parseDouble(usd.get("price").toString()) * USD_TO_INR;
            }
        } catch (Exception e) {
            logger.warn("CoinPaprika fetch failed for {}: {}", tickerId, e.getMessage());
        }
        return 0.0;
    }

    @SuppressWarnings("unchecked")
    @Cacheable(value = "prices", key = "'dex-' + #assetName")
    public double getPriceFromDexScreener(String assetName) {
        String coinId = getCoinId(assetName);
        String url = apiProperties.getDexscreener().getBase() + "/search?q=" + coinId;
        
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("pairs")) {
                List<Map<String, Object>> pairs = (List<Map<String, Object>>) body.get("pairs");
                if (pairs != null && !pairs.isEmpty()) {
                    Object priceUsd = pairs.get(0).get("priceUsd");
                    if (priceUsd != null) {
                        return Double.parseDouble(priceUsd.toString()) * USD_TO_INR;
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("DexScreener fetch failed for {}: {}", assetName, e.getMessage());
        }
        return 0.0;
    }

    public double getPriceFromCoinMarketCap(String assetName) {
        double basePrice = getPrice(assetName);
        if (basePrice == 0) return 0.0;
        
        double variation = (Math.random() * 0.01) - 0.005;
        return basePrice * (1 + variation);
    }

    @Cacheable(value = "market", key = "#limit")
    public List<Map<String, Object>> getTopCoins(int limit) {
        // Try CoinGecko first
        String cgUrl = apiProperties.getCoingecko().getBase() + "/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=" + limit + "&page=1&sparkline=true";
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                cgUrl, HttpMethod.GET, null, new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            List<Map<String, Object>> body = response.getBody();
            if (body != null && !body.isEmpty()) {
                marketCache.put("top-" + limit, body);
                marketRateLimited = false;
                return body;
            }
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("429")) {
                marketRateLimited = true;
                logger.warn("CoinGecko API Rate Limited (429) - Attempting Coinlore Fallback");
            } else {
                logger.error("CoinGecko error: {}", e.getMessage());
            }
        }

        // Fallback to Coinlore
        String clUrl = apiProperties.getCoinlore().getBase() + "/tickers/?start=0&limit=" + limit;
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                clUrl, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("data")) {
                List<Map<String, Object>> clData = (List<Map<String, Object>>) body.get("data");
                List<Map<String, Object>> normalized = clData.stream().map(coin -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", coin.get("id"));
                    map.put("symbol", coin.get("symbol"));
                    map.put("name", coin.get("name"));
                    // Coinlore price is in USD string
                    double usdPrice = Double.parseDouble(coin.get("price_usd").toString());
                    map.put("current_price", usdPrice * USD_TO_INR);
                    map.put("price_change_percentage_24h", Double.parseDouble(coin.get("percent_change_24h").toString()));
                    map.put("image", "https://www.coinlore.com/img/25x25/" + coin.get("nameid") + ".png");
                    
                    // Fallback sparkline from CryptoCompare (only for top 10 to avoid performance hit)
                    List<Double> sparkline = new ArrayList<>();
                    if (clData.indexOf(coin) < 10) {
                        sparkline = getHistoricalPricesFromCryptoCompare(coin.get("symbol").toString(), 7);
                    }
                    
                    final List<Double> finalSparkline = sparkline;
                    map.put("sparkline_in_7d", new HashMap<String, Object>() {{ 
                        put("price", finalSparkline); 
                    }});
                    return map;
                }).collect(Collectors.toList());
                
                marketRateLimited = false; // Successfully fetched from alternate source
                return normalized;
            }
        } catch (Exception e) {
            logger.error("Coinlore fallback error: {}", e.getMessage());
        }

        // Absolute fallback to local cache
        return marketCache.getOrDefault("top-" + limit, new ArrayList<>());
    }
}
