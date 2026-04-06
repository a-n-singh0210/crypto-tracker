package com.crypto.tracker.controller;

import com.crypto.tracker.model.AnalyticsResponse;
import com.crypto.tracker.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
@CrossOrigin
public class AnalyticsController {

    @Autowired
    private AnalyticsService service;

    @GetMapping("/{username}")
    public AnalyticsResponse getAnalytics(@PathVariable String username) {
        return service.getAnalytics(username);
    }
}