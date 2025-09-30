package infosys.backend.controller;

import infosys.backend.dto.ServiceRequest;
import infosys.backend.dto.ServiceResponse;
import infosys.backend.model.ServiceProvider;
import infosys.backend.model.User;
import infosys.backend.service.ServiceProviderService;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceProviderService serviceProviderService;
    private final UserRepository userRepository; // Inject UserRepository to update profileCompleted

    // ✅ Create service (PROVIDER only)
    
    @PostMapping
    public ResponseEntity<ServiceResponse> createService(@RequestBody ServiceRequest request) {

        // Get logged-in user's email from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal(); // cast to your User entity
        String providerEmail = user.getEmail();

        // 🔹 Debug log
        System.out.println("Trying to fetch provider with email: " + providerEmail);

        // Create service
        ServiceProvider service = serviceProviderService.createService(request, providerEmail);

        // ✅ Mark profile as completed if not already
       
        // Build response DTO
        ServiceResponse response = ServiceResponse.builder()
                .id(service.getId())
                .providerId(service.getProvider().getId())
                .providerName(service.getProvider().getName())
                .category(service.getCategory())
                .subcategory(service.getSubcategory())
                .description(service.getDescription())
                .price(service.getPrice())
                .availability(service.getAvailability())
                .location(service.getLocation())
                .build();

        return ResponseEntity.ok(response);
    }

    // ✅ Get all services
    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        List<ServiceResponse> services = serviceProviderService.getAllServices()
                .stream()
                .map(service -> ServiceResponse.builder()
                        .id(service.getId())
                        .providerId(service.getProvider().getId())
                        .providerName(service.getProvider().getName())
                        .category(service.getCategory())
                        .subcategory(service.getSubcategory())
                        .description(service.getDescription())
                        .price(service.getPrice())
                        .availability(service.getAvailability())
                        .location(service.getLocation())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(services);
    }

    // ✅ Get service by ID
    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable Long id) {
        ServiceProvider service = serviceProviderService.getServiceById(id);

        ServiceResponse response = ServiceResponse.builder()
                .id(service.getId())
                .providerId(service.getProvider().getId())
                .providerName(service.getProvider().getName())
                .category(service.getCategory())
                .subcategory(service.getSubcategory())
                .description(service.getDescription())
                .price(service.getPrice())
                .availability(service.getAvailability())
                .location(service.getLocation())
                .build();

        return ResponseEntity.ok(response);
    }

    

}
