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
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    // -----------------------------------------------------
    // 1️⃣ ENTITY → DTO MAPPER (FINAL & ONLY VERSION)
    // -----------------------------------------------------
    public ReviewResponseDTO mapToDTO(Review r) {
        ReviewResponseDTO dto = new ReviewResponseDTO();

        dto.setId(r.getId());
        dto.setBookingId(r.getBooking() != null ? r.getBooking().getId() : null);

        if (r.getCustomer() != null) {
            dto.setCustomerId(r.getCustomer().getId());
            dto.setCustomerName(r.getCustomer().getName());
        }

        if (r.getProvider() != null) {
            dto.setProviderId(r.getProvider().getId());
            dto.setProviderName(r.getProvider().getName());
        }

        if (r.getService() != null) {
            dto.setServiceId(r.getService().getId());
            dto.setServiceSubcategory(r.getService().getSubcategory());
        }

        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setReply(r.getReply());
        dto.setCreatedAt(r.getCreatedAt());

        return dto;
    }

    // -----------------------------------------------------
    // 2️⃣ ADD REVIEW
    // -----------------------------------------------------
    public Review addReview(Review review) {
        review.setCreatedAt(LocalDateTime.now());

        if (review.getCustomer() != null) {
            userRepository.findById(review.getCustomer().getId())
                    .ifPresent(review::setCustomer);
        }

        if (review.getProvider() != null) {
            userRepository.findById(review.getProvider().getId())
                    .ifPresent(review::setProvider);
        }

        return reviewRepository.save(review);
    }

    // -----------------------------------------------------
    // 3️⃣ GET PROVIDER REVIEWS AS DTO LIST
    // -----------------------------------------------------
    public List<ReviewResponseDTO> getReviewsByProviderDTO(User provider) {
        return reviewRepository.findByProvider(provider)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------
    // 4️⃣ GET CUSTOMER REVIEWS
    // -----------------------------------------------------
    public List<Review> getReviewsByCustomer(User customer) {
        return reviewRepository.findByCustomer(customer);
    }

    // -----------------------------------------------------
    // 5️⃣ AVERAGE PROVIDER RATING
    // -----------------------------------------------------
    public double getAverageRating(User provider) {
        List<Review> reviews = reviewRepository.findByProvider(provider);
        if (reviews.isEmpty()) return 0.0;
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }

    // -----------------------------------------------------
    // 6️⃣ GET SERVICE REVIEWS AS DTO LIST
    // -----------------------------------------------------
    public List<ReviewResponseDTO> getReviewsByServiceDTO(ServiceProvider service) {
        return reviewRepository.findByService(service)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------
    // 7️⃣ AVERAGE SERVICE RATING
    // -----------------------------------------------------
    public double getAverageRatingByService(ServiceProvider service) {
        List<Review> reviews = reviewRepository.findByService(service);
        if (reviews.isEmpty()) return 0.0;
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }

    // -----------------------------------------------------
    // 8️⃣ UPDATE REVIEW
    // -----------------------------------------------------
    public Review updateReview(Long reviewId, Review newReview) {
        return reviewRepository.findById(reviewId)
                .map(existing -> {
                    existing.setRating(newReview.getRating());
                    existing.setComment(newReview.getComment());
                    return reviewRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    // -----------------------------------------------------
    // 9️⃣ DELETE REVIEW
    // -----------------------------------------------------
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Review not found");
        }
        reviewRepository.deleteById(reviewId);
    }

    // -----------------------------------------------------
    // 🔟 PROVIDER REPLY
    // -----------------------------------------------------
    public ReviewResponseDTO addReply(Long reviewId, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getProvider().getId().equals(getCurrentUserId())) {
            throw new RuntimeException("Unauthorized");
        }

        review.setReply(reply);
        Review saved = reviewRepository.save(review);

        return mapToDTO(saved);
    }

    // -----------------------------------------------------
    // 1️⃣1️⃣ CURRENT USER ID
    // -----------------------------------------------------
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("Not authenticated");
        return userRepository.findByName(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    // -----------------------------------------------------
    // 1️⃣2️⃣ REVIEW BY BOOKING ID
    // -----------------------------------------------------
    public Optional<Review> getReviewByBookingId(Long bookingId) {
        return reviewRepository.findByBookingId(bookingId);
    }
}
