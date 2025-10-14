package infosys.backend.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import infosys.backend.model.Review;
import infosys.backend.model.User;
import infosys.backend.repository.ReviewRepository;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    // Add a review
    public Review addReview(Review review) {
        return reviewRepository.save(review);
    }

    // Get reviews for a provider
    public List<Review> getReviewsByProvider(User provider) {
        return reviewRepository.findByProvider(provider);
    }

    // Get average rating for a provider
    public double getAverageRating(User provider) {
        List<Review> reviews = reviewRepository.findByProvider(provider);
        if (reviews.isEmpty()) return 0.0;
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }
}
