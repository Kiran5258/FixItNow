package infosys.backend.service;

import infosys.backend.dto.ReviewResponseDTO;
import infosys.backend.model.Review;
import infosys.backend.model.ServiceProvider;
import infosys.backend.model.User;
import infosys.backend.repository.ReviewRepository;
import infosys.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * ✅ Add a new review (with safety checks)
     */
    public Review addReview(Review review) {
        // Ensure timestamp is set
        review.setCreatedAt(LocalDateTime.now());

        // Validate customer and provider
        if (review.getCustomer() != null && review.getCustomer().getId() != null) {
            Optional<User> customerOpt = userRepository.findById(review.getCustomer().getId());
            customerOpt.ifPresent(review::setCustomer);
        }

        if (review.getProvider() != null && review.getProvider().getId() != null) {
            Optional<User> providerOpt = userRepository.findById(review.getProvider().getId());
            providerOpt.ifPresent(review::setProvider);
        }

        return reviewRepository.save(review);
    }

    /**
     * ✅ Get all reviews written for a specific provider
     */
    public List<Review> getReviewsByProvider(User provider) {
        return reviewRepository.findByProvider(provider);
    }

    /**
     * ✅ Get all reviews written by a specific customer
     */
    public List<Review> getReviewsByCustomer(User customer) {
        return reviewRepository.findByCustomer(customer);
    }

    /**
     * ✅ Calculate average rating for a provider
     */
    public double getAverageRating(User provider) {
        List<Review> reviews = reviewRepository.findByProvider(provider);
        if (reviews.isEmpty()) return 0.0;
        return reviews.stream()
                      .mapToInt(Review::getRating)
                      .average()
                      .orElse(0.0);
    }

    /**
     * ✅ Get all reviews for a specific service
     */
    public List<Review> getReviewsByService(ServiceProvider service) {
        return reviewRepository.findByService(service);
    }

    /**
     * ✅ Calculate average rating for a specific service
     */
    public double getAverageRatingByService(ServiceProvider service) {
        List<Review> reviews = reviewRepository.findByService(service);
        if (reviews.isEmpty()) return 0.0;
        return reviews.stream()
                      .mapToInt(Review::getRating)
                      .average()
                      .orElse(0.0);
    }

    /**
     * ✅ Update an existing review
     */
    public Review updateReview(Long reviewId, Review newReview) {
        return reviewRepository.findById(reviewId)
                .map(existing -> {
                    existing.setRating(newReview.getRating());
                    existing.setComment(newReview.getComment());
                    return reviewRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    /**
     * ✅ Delete a review
     */
    public void deleteReview(Long reviewId) {
        if (reviewRepository.existsById(reviewId)) {
            reviewRepository.deleteById(reviewId);
        } else {
            throw new RuntimeException("Review not found");
        }
    }

    public ReviewResponseDTO addReply(Long reviewId, String reply) {
    Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));

    if (!review.getProvider().getId().equals(getCurrentUserId())) {
        throw new RuntimeException("Unauthorized");
    }

    review.setReply(reply);
    Review saved = reviewRepository.save(review);

    return new ReviewResponseDTO(
            saved.getId(),
            saved.getBooking() != null ? saved.getBooking().getId() : null,
            saved.getCustomer().getId(),
            saved.getProvider().getId(),
            saved.getService().getId(),
            saved.getRating(),
            saved.getComment(),
            saved.getReply()
    );

    
}






    /**
     * Helper method to get the currently logged-in user's ID
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }

        // Assuming username is unique and stored in authentication.getName()
        return userRepository.findByName(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }


    public Optional<Review> getReviewByBookingId(Long bookingId) {
        return reviewRepository.findByBookingId(bookingId);
    }
    

}
