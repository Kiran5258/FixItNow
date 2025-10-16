package infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import infosys.backend.model.Review;
import infosys.backend.model.User;
import infosys.backend.service.ReviewService;
import infosys.backend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    // Add a new review
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/add")
    public Review addReview(@RequestBody Review review) {
        return reviewService.addReview(review);
    }

    // Get reviews for a provider
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER','ADMIN')")
    @GetMapping("/provider/{providerId}")
    public List<Review> getProviderReviews(@PathVariable Long providerId) {
        User provider = userService.getUserById(providerId);
        return reviewService.getReviewsByProvider(provider);
    }

    // Get average rating for a provider
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER','ADMIN')")
    @GetMapping("/provider/{providerId}/average")
    public double getProviderAverageRating(@PathVariable Long providerId) {
        User provider = userService.getUserById(providerId);
        return reviewService.getAverageRating(provider);
    }
}
