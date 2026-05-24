package com.aicall.module.followup.scheduler;

import com.aicall.module.followup.service.FollowUpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class FollowUpScheduler {
    private final FollowUpService followUpService;

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkAndSend() {
        log.info("Running follow-up due check...");
        followUpService.sendDueFollowUps();
    }
}
