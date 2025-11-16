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

    // -------------------------------------------------------------
    // 1️⃣ ADD REVIEW
    // -------------------------------------------------------------
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/add")
    public ResponseEntity<ReviewResponseDTO> addReview(@RequestBody Review review) {
        try {
            Review saved = reviewService.addReview(review);
            ReviewResponseDTO dto = reviewService.mapToDTO(saved);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // -------------------------------------------------------------
    // 2️⃣ GET REVIEWS FOR PROVIDER (DTO, NOT ENTITY)
    // -------------------------------------------------------------
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER','ADMIN')")
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ReviewResponseDTO>> getProviderReviews(@PathVariable Long providerId) {
        try {
            User provider = userService.getUserById(providerId);
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByProviderDTO(provider);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // -------------------------------------------------------------
    // 3️⃣ PROVIDER AVERAGE RATING
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // 4️⃣ GET REVIEWS FOR A SERVICE
    // -------------------------------------------------------------
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER','ADMIN')")
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByService(@PathVariable Long serviceId) {
        try {
            ServiceProvider service = serviceProviderService.getServiceById(serviceId);
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByServiceDTO(service);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // -------------------------------------------------------------
    // 5️⃣ AVERAGE RATING FOR SERVICE
    // -------------------------------------------------------------
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER','ADMIN')")
    @GetMapping("/service/{serviceId}/average")
    public ResponseEntity<Double> getAverageRatingByService(@PathVariable Long serviceId) {
        try {
            ServiceProvider service = serviceProviderService.getServiceById(serviceId);
            double avg = reviewService.getAverageRatingByService(service);
            return ResponseEntity.ok(avg);
        } catch (Exception e) {
            return ResponseEntity.ok(0.0);
        }
    }

    // -------------------------------------------------------------
    // 6️⃣ PROVIDER REPLY TO REVIEW
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // 7️⃣ DELETE REVIEW
    // -------------------------------------------------------------
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        try {
            reviewService.deleteReview(reviewId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // -------------------------------------------------------------
    // 8️⃣ GET REVIEW BY BOOKING ID (FOR DUPLICATE CHECK)
    // -------------------------------------------------------------
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getReviewByBookingId(@PathVariable Long bookingId) {
        return reviewService.getReviewByBookingId(bookingId)
                .map(r -> ResponseEntity.ok(reviewService.mapToDTO(r)))
                .orElse(ResponseEntity.noContent().build());
    }
}
