package infosys.backend.service;

import infosys.backend.dto.ProviderRegistrationRequest;
import infosys.backend.enums.Role;
import infosys.backend.model.ProviderProfile;
import infosys.backend.model.User;
import infosys.backend.repository.ProviderProfileRepository;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public ProviderProfile registerProvider(ProviderRegistrationRequest request) {
        // 1. Create User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PROVIDER)
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        User savedUser = userRepository.save(user);

        // 2. Create ProviderProfile
        ProviderProfile profile = ProviderProfile.builder()
                .user(savedUser)
                .category(request.getCategory())
                .subcategory(request.getSubcategory())
                .skills(request.getSkills())
                .serviceArea(request.getServiceArea())
                .build();

        return providerProfileRepository.save(profile);
    }
}
