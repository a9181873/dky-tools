package stirling.software.proprietary.security.configuration.ee;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import stirling.software.common.model.ApplicationProperties;
import stirling.software.common.util.GeneralUtils;
import stirling.software.proprietary.security.configuration.ee.KeygenLicenseVerifier;
import stirling.software.proprietary.service.UserLicenseSettingsService;

@Component
public class LicenseKeyChecker {
    private static final Logger log = LoggerFactory.getLogger(LicenseKeyChecker.class);
    private static final String FILE_PREFIX = "file:";
    private final KeygenLicenseVerifier licenseService;
    private final ApplicationProperties applicationProperties;
    private final UserLicenseSettingsService licenseSettingsService;
    private KeygenLicenseVerifier.License premiumEnabledResult = KeygenLicenseVerifier.License.ENTERPRISE;

    public LicenseKeyChecker(KeygenLicenseVerifier licenseService, ApplicationProperties applicationProperties, @Lazy UserLicenseSettingsService licenseSettingsService) {
        this.licenseService = licenseService;
        this.applicationProperties = applicationProperties;
        this.licenseSettingsService = licenseSettingsService;
    }

    @PostConstruct
    public void init() {
        this.evaluateLicense();
    }

    @EventListener(value={ApplicationReadyEvent.class})
    public void onApplicationReady() {
        this.synchronizeLicenseSettings();
    }

    @Scheduled(initialDelay=604800000L, fixedRate=604800000L)
    public void checkLicensePeriodically() {
        try {
            this.evaluateLicense();
        }
        catch (RuntimeException e) {
            log.error("Periodic license check failed after all retries: {}. Keeping existing license status.", (Object)e.getMessage());
        }
        this.synchronizeLicenseSettings();
    }

    private void evaluateLicense() {
        this.premiumEnabledResult = KeygenLicenseVerifier.License.ENTERPRISE;
        if (this.applicationProperties != null && this.applicationProperties.getPremium() != null) {
            this.applicationProperties.getPremium().setEnabled(true);
        }
        log.info("License key forced to Enterprise.");
    }

    private void synchronizeLicenseSettings() {
        try {
            this.licenseSettingsService.updateLicenseMaxUsers();
        } catch (Exception e) {
            log.error("Failed to synchronize license settings: {}", e.getMessage());
        }
    }

    private String getLicenseKeyContent(String keyOrFilePath) {
        return "ENTERPRISE-BYPASS";
    }

    public void updateLicenseKey(String newKey) throws IOException {
        this.applicationProperties.getPremium().setKey(newKey);
        GeneralUtils.saveKeyToSettings((String)"premium.key", (Object)newKey);
        this.evaluateLicense();
        this.synchronizeLicenseSettings();
    }

    public void resyncLicense() {
        this.evaluateLicense();
        this.synchronizeLicenseSettings();
    }

    public KeygenLicenseVerifier.License getPremiumLicenseEnabledResult() {
        return KeygenLicenseVerifier.License.ENTERPRISE;
    }
}
