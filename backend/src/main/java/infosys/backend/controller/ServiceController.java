package infosys.backend.controller;

import infosys.backend.dto.ServiceRequest;
import infosys.backend.dto.ServiceResponse;
import infosys.backend.model.Service;
import infosys.backend.service.ServiceProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceProviderService serviceProviderService;

    // Create service (PROVIDER only)
    @PreAuthorize("hasRole('PROVIDER')")
    @PostMapping
    public ResponseEntity<ServiceResponse> createService(@RequestBody ServiceRequest request) {
        Service service = serviceProviderService.createService(request);
        return ResponseEntity.ok(toResponse(service));
    }

    // Get all services (CUSTOMER & ADMIN)
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        List<Service> services = serviceProviderService.getAllServices();
        List<ServiceResponse> response = services.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Get services by provider (all roles)
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','PROVIDER')")
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ServiceResponse>> getServicesByProvider(@PathVariable Long providerId) {
        List<Service> services = serviceProviderService.getServicesByProvider(providerId);
        List<ServiceResponse> response = services.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Update service (PROVIDER only)
    @PreAuthorize("hasRole('PROVIDER')")
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> updateService(@PathVariable Long id, @RequestBody ServiceRequest request) {
        Service service = serviceProviderService.updateService(id, request);
        return ResponseEntity.ok(toResponse(service));
    }

    // Delete service (PROVIDER only)
    @PreAuthorize("hasRole('PROVIDER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteService(@PathVariable Long id) {
        serviceProviderService.deleteService(id);
        return ResponseEntity.ok("Service deleted successfully");
    }

    // Convert entity to DTO
    private ServiceResponse toResponse(Service service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .providerId(service.getProviderId())
                .providerName("") // We'll need to fetch provider name separately or via join
                .category(service.getCategory())
                .subcategory(service.getSubcategory())
                .description(service.getDescription())
                .price(service.getPrice())
                .availability(service.getAvailability())
                .location(service.getLocation())
                .build();
    }
}
