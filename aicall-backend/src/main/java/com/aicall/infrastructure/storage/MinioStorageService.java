package com.aicall.infrastructure.storage;

import com.aicall.common.exception.BusinessException;
import com.aicall.common.result.ResultCode;
import com.aicall.config.MinioConfig;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetObjectArgs;
import io.minio.RemoveObjectArgs;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioStorageService {
    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @PostConstruct
    public void init() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(minioConfig.getBucketName()).build());
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(minioConfig.getBucketName()).build());
                log.info("Created MinIO bucket: {}", minioConfig.getBucketName());
            }
        } catch (Exception e) {
            log.warn("MinIO bucket init failed: {}", e.getMessage());
        }
    }

    public String upload(String objectName, InputStream inputStream, String contentType, long size) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .stream(inputStream, size, -1)
                            .contentType(contentType)
                            .build());
            return String.format("%s/%s/%s", minioConfig.getEndpoint(), minioConfig.getBucketName(), objectName);
        } catch (Exception e) {
            throw BusinessException.fail(ResultCode.INTERNAL_ERROR.getCode(), "文件上传失败: " + e.getMessage());
        }
    }

    public InputStream download(String objectName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw BusinessException.fail(ResultCode.INTERNAL_ERROR.getCode(), "文件下载失败: " + e.getMessage());
        }
    }

    public void delete(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw BusinessException.fail(ResultCode.INTERNAL_ERROR.getCode(), "文件删除失败: " + e.getMessage());
        }
    }
}
