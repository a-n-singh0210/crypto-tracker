package com.crypto.tracker.service;

import com.crypto.tracker.model.Portfolio;
import com.crypto.tracker.repository.PortfolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioService {

    @Autowired
    private PortfolioRepository repo;

    // Add crypto
    public String addCrypto(Portfolio p) {
        repo.save(p);
        return "Crypto added";
    }

    // View portfolio
    public List<Portfolio> getPortfolio(String username) {
        return repo.findByUsername(username);
    }

    // Update quantity
    public String updateCrypto(Long id, Portfolio updated) {
        Portfolio p = repo.findById(id).orElse(null);

        if (p == null) return "Not found";

        // Preserve username and cryptoName if not provided in update
        p.setQuantity(updated.getQuantity());
        p.setBuyPrice(updated.getBuyPrice());
        
        // Ensure cryptoName is preserved if it's missing in the update request
        if (updated.getCryptoName() != null && !updated.getCryptoName().isEmpty()) {
            p.setCryptoName(updated.getCryptoName());
        }
        
        // Ensure username is preserved if it's missing in the update request
        if (updated.getUsername() != null && !updated.getUsername().isEmpty()) {
            p.setUsername(updated.getUsername());
        }

        repo.save(p);
        return "Updated successfully";
    }

    // Delete crypto
    public String deleteCrypto(Long id) {
        repo.deleteById(id);
        return "Deleted successfully";
    }
}