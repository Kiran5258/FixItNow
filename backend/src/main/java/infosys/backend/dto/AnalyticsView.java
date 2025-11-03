package infosys.backend.dto;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsView {
    private String label;   // e.g. category, location, provider name
    private Long count;     // number of bookings, reviews, etc.
}

