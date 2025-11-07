// infosys/backend/service/PresenceService.java
package infosys.backend.service;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {
    private final Set<Long> onlineUsers = ConcurrentHashMap.newKeySet();

    public void userConnected(Long userId) {
        onlineUsers.add(userId);
        System.out.println("🟢 User connected: " + userId);
    }

    public void userDisconnected(Long userId) {
        onlineUsers.remove(userId);
        System.out.println("🔴 User disconnected: " + userId);
    }

    public boolean isUserOnline(Long userId) {
        return onlineUsers.contains(userId);
    }

    public Set<Long> getOnlineUsers() {
        return onlineUsers;
    }
}
