package com.crypto.tracker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "api")
@Data
public class CryptoApiProperties {
    private Coingecko coingecko = new Coingecko();
    private Coinpaprika coinpaprika = new Coinpaprika();
    private Dexscreener dexscreener = new Dexscreener();
    private Coinlore coinlore = new Coinlore();

    @Data
    public static class Coingecko {
        private String base;
    }

    @Data
    public static class Coinpaprika {
        private String base;
    }

    @Data
    public static class Dexscreener {
        private String base;
    }

    @Data
    public static class Coinlore {
        private String base;
    }
}
