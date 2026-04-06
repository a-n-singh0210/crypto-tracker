package com.crypto.tracker.controller;

import com.crypto.tracker.model.Portfolio;
import com.crypto.tracker.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/portfolio")
@CrossOrigin
public class PortfolioController {

    @Autowired
    private PortfolioService service;

    // Add
    @PostMapping("/add")
    public String add(@RequestBody Portfolio p) {
        return service.addCrypto(p);
    }

    // View
    @GetMapping("/{username}")
    public List<Portfolio> get(@PathVariable String username) {
        return service.getPortfolio(username);
    }

    // Update
    @PutMapping("/update/{id}")
    public String update(@PathVariable Long id, @RequestBody Portfolio p) {
        return service.updateCrypto(id, p);
    }

    // Delete
    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        return service.deleteCrypto(id);
    }
}