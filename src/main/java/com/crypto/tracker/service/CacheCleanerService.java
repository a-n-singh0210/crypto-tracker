package com.crypto.tracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CacheCleanerService {

    private static final Logger logger = LoggerFactory.getLogger(CacheCleanerService.class);

    @Autowired
    private CacheManager cacheManager;

    // Clear caches every 45 seconds to keep data fresh but avoid 429 errors
    @Scheduled(fixedRate = 45000)
    public void clearPriceAndMarketCaches() {
        logger.info("Evicting 'prices' and 'market' caches for real-time data sync");
        
        Cache pricesCache = cacheManager.getCache("prices");
        if (pricesCache != null) pricesCache.clear();
        
        Cache marketCache = cacheManager.getCache("market");
        if (marketCache != null) marketCache.clear();
        
        Cache predictionsCache = cacheManager.getCache("predictions");
        if (predictionsCache != null) predictionsCache.clear();
    }
}
