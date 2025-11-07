package infosys.backend.controller;

import infosys.backend.dto.ReviewReplyRequest;
import infosys.backend.dto.ReviewResponseDTO;
import infosys.backend.model.Review;
import infosys.backend.model.ServiceProvider;
import infosys.backend.model.User;
import infosys.backend.service.ReviewService;
import infosys.backend.service.UserService;
import infosys.backend.service.ServiceProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;
    private final ServiceProviderService serviceProviderService;
    

    // ✅ Add a new review
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/add")
    public ResponseEntity<Review> addReview(@RequestBody Review review) {
        try {
            Review savedReview = reviewService.addReview(review);
            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ Get all reviews for a provider
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER','ADMIN')")
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<Review>> getProviderReviews(@PathVariable Long providerId) {
        try {
            User provider = userService.getUserById(providerId);
            List<Review> reviews = reviewService.getReviewsByProvider(provider);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Get average rating for a provider
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER','ADMIN')")
    @GetMapping("/provider/{providerId}/average")
    public ResponseEntity<Double> getProviderAverageRating(@PathVariable Long providerId) {
        try {
            User provider = userService.getUserById(providerId);
            double avgRating = reviewService.getAverageRating(provider);
            return ResponseEntity.ok(avgRating);
        } catch (Exception e) {
            return ResponseEntity.ok(0.0);
        }
    }

    // ✅ Get all reviews for a specific service
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER','ADMIN')")
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<Review>> getReviewsByService(@PathVariable Long serviceId) {
        try {
            ServiceProvider service = serviceProviderService.getServiceById(serviceId);
            List<Review> reviews = reviewService.getReviewsByService(service);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Get average rating for a specific service
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER','ADMIN')")
    @GetMapping("/service/{serviceId}/average")
    public ResponseEntity<Double> getAverageRatingByService(@PathVariable Long serviceId) {
        try {
            ServiceProvider service = serviceProviderService.getServiceById(serviceId);
            double avgRating = reviewService.getAverageRatingByService(service);
            return ResponseEntity.ok(avgRating);
        } catch (Exception e) {
            return ResponseEntity.ok(0.0);
        }
    }

    // ✅ Add or update reply for a review
@PreAuthorize("hasRole('PROVIDER')")
@PutMapping("/reply/{reviewId}")
public ResponseEntity<ReviewResponseDTO> addReply(
        @PathVariable Long reviewId,
        @RequestBody ReviewReplyRequest request) {
    try {
        ReviewResponseDTO response = reviewService.addReply(reviewId, request.getReply());
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.badRequest().build();
    }
}

@PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        try {
            reviewService.deleteReview(reviewId); // implement this in ReviewService
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getReviewByBookingId(@PathVariable Long bookingId) {
        return reviewService.getReviewByBookingId(bookingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
