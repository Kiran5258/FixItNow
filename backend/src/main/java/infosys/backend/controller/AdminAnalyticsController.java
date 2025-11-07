package infosys.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import infosys.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/bookings/monthly")
    public ResponseEntity<List<Map<String, Object>>> getBookingsPerMonth() {
        return ResponseEntity.ok(analyticsService.getBookingsPerMonth());
    }

    @GetMapping("/top-providers")
    public ResponseEntity<List<Map<String, Object>>> getTopProviders() {
        return ResponseEntity.ok(analyticsService.getTopProviders());
    }

    @GetMapping("/top-services")
    public ResponseEntity<List<Map<String, Object>>> getTopServices() {
        return ResponseEntity.ok(analyticsService.getTopServices());
    }

    @GetMapping("/locations")
    public ResponseEntity<List<Map<String, Object>>> getLocationTrends() {
        return ResponseEntity.ok(analyticsService.getLocationTrends());
    }
}
