package com.aicall.common.aspect;

import com.aicall.common.annotation.Log;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class LogAspect {
    private static final Logger log = LoggerFactory.getLogger(LogAspect.class);

    @Around("@annotation(logAnnotation)")
    public Object around(ProceedingJoinPoint joinPoint, Log logAnnotation) throws Throwable {
        String operation = logAnnotation.value().isEmpty() ? joinPoint.getSignature().toShortString() : logAnnotation.value();
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        String ip = "";
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            ip = request.getRemoteAddr();
        }
        log.info("[操作日志] {} - IP: {}", operation, ip);
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            log.info("[操作日志] {} - 耗时: {}ms - 结果: 成功", operation, System.currentTimeMillis() - start);
            return result;
        } catch (Throwable e) {
            log.warn("[操作日志] {} - 耗时: {}ms - 结果: 失败 - {}", operation, System.currentTimeMillis() - start, e.getMessage());
            throw e;
        }
    }
}
