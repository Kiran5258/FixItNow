package infosys.backend.service;

import infosys.backend.model.Review;
import infosys.backend.model.User;
import infosys.backend.repository.ReviewRepository;
import infosys.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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

        // Validate customer and provider exist
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
     * ✅ Get all reviews written by a specific customer (optional)
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
     * ✅ Update an existing review (optional)
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
     * ✅ Delete a review (optional, admin or customer who posted it)
     */
    public void deleteReview(Long reviewId) {
        if (reviewRepository.existsById(reviewId)) {
            reviewRepository.deleteById(reviewId);
        } else {
            throw new RuntimeException("Review not found");
        }
    }
}
