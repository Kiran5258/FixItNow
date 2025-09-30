package infosys.backend.service;

import infosys.backend.dto.ServiceRequest;
import infosys.backend.enums.Role;
import infosys.backend.model.ServiceProvider;
import infosys.backend.model.User;
import infosys.backend.repository.ServiceRepository;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceProviderService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    // ✅ Create a new service (PROVIDER only)
    public ServiceProvider createService(ServiceRequest request) {
        User provider = userRepository.findById(request.getProviderId())
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));

        if (provider.getRole() != Role.PROVIDER) {
            throw new IllegalStateException("Only providers can create services");
        }

        ServiceProvider service = ServiceProvider.builder()
                .provider(provider)
                .category(request.getCategory())
                .subcategory(request.getSubcategory())
                .description(request.getDescription())
                .price(request.getPrice()) // BigDecimal
                .availability(request.getAvailability())
                .location(request.getLocation())
                .build();

        return serviceRepository.save(service);
    }

    // ✅ Get all services (CUSTOMER & ADMIN)
    public List<ServiceProvider> getAllServices() {
        return serviceRepository.findAll();
    }

    // ✅ Get service by ID
    public ServiceProvider getServiceById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + id));
    }

    // ✅ Get all services by provider
    public List<ServiceProvider> getServicesByProvider(Long providerId) {
        return serviceRepository.findByProviderId(providerId);
    }

    // ✅ Update existing service (PROVIDER only)
    public ServiceProvider updateService(Long id, ServiceRequest request) {
        ServiceProvider existing = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + id));

        if (request.getCategory() != null) existing.setCategory(request.getCategory());
        if (request.getSubcategory() != null) existing.setSubcategory(request.getSubcategory());
        if (request.getDescription() != null) existing.setDescription(request.getDescription());
        if (request.getPrice() != null) existing.setPrice(request.getPrice());
        if (request.getAvailability() != null) existing.setAvailability(request.getAvailability());
        if (request.getLocation() != null) existing.setLocation(request.getLocation());

        return serviceRepository.save(existing);
    }

    // ✅ Delete service (PROVIDER only)
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new IllegalArgumentException("Service not found with ID: " + id);
        }
        serviceRepository.deleteById(id);
    }
}
