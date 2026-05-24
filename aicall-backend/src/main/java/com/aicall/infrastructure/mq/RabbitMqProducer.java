package com.aicall.infrastructure.mq;

import com.aicall.config.RabbitMqConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMqProducer {
    private final RabbitTemplate rabbitTemplate;

    public void sendNotification(Object message) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.CONSULTATION_EXCHANGE,
                RabbitMqConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }
}
