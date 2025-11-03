package infosys.backend.service;

import infosys.backend.model.Document;
import infosys.backend.model.User;
import infosys.backend.repository.DocumentRepository;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    private final String uploadDir = "uploads/";

    public Document uploadDocument(Long providerId, MultipartFile file) throws IOException {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Create uploads directory if not exists
        File directory = new File(uploadDir);
        if (!directory.exists()) directory.mkdirs();

        // Save file locally
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.write(filePath, file.getBytes());

        Document document = Document.builder()
                .fileName(fileName)
                .fileType(file.getContentType())
                .fileUrl(filePath.toString())
                .provider(provider)
                .build();
document.setUploadedAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByProvider(Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        return documentRepository.findByProvider(provider);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Document approveDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        doc.setApproved(true);
        documentRepository.save(doc);

        // Optionally mark provider verified
        User provider = doc.getProvider();
        provider.setVerified(true);
        userRepository.save(provider);

        return doc;
    }

   

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }
}
