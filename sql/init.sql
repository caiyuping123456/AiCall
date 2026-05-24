-- AICall 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS aicall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aicall;

-- =============================================
-- 用户与医生
-- =============================================

CREATE TABLE IF NOT EXISTS `patient` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL COMMENT '患者姓名',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `gender` TINYINT DEFAULT NULL COMMENT '性别 0女1男',
    `age` INT DEFAULT NULL COMMENT '年龄',
    `id_card` VARCHAR(18) DEFAULT NULL COMMENT '身份证号',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='患者信息';

CREATE TABLE IF NOT EXISTS `doctor` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL COMMENT '登录账号',
    `password` VARCHAR(200) NOT NULL COMMENT '密码(BCrypt)',
    `name` VARCHAR(50) NOT NULL COMMENT '姓名',
    `title` VARCHAR(50) DEFAULT NULL COMMENT '职称',
    `department` VARCHAR(50) DEFAULT NULL COMMENT '科室',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `introduction` TEXT DEFAULT NULL COMMENT '简介',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生';

CREATE TABLE IF NOT EXISTS `admin` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL COMMENT '登录账号',
    `password` VARCHAR(200) NOT NULL COMMENT '密码(BCrypt)',
    `name` VARCHAR(50) NOT NULL COMMENT '姓名',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `role_id` BIGINT DEFAULT NULL COMMENT '角色ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员';

CREATE TABLE IF NOT EXISTS `doctor_schedule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `doctor_id` BIGINT NOT NULL COMMENT '医生ID',
    `schedule_date` DATE NOT NULL COMMENT '排班日期',
    `start_time` TIME NOT NULL COMMENT '开始时间',
    `end_time` TIME NOT NULL COMMENT '结束时间',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0已预约1可用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_doctor_date` (`doctor_id`, `schedule_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生排班';

-- =============================================
-- 会诊与报告
-- =============================================

CREATE TABLE IF NOT EXISTS `consultation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_no` VARCHAR(32) NOT NULL COMMENT '会诊编号',
    `patient_id` BIGINT NOT NULL COMMENT '患者ID',
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '类型 1单学科2多学科MDT',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0已提交1资料审核中2专家确认中3已排期4待会诊5会诊中6已完成7已取消8已退回',
    `department` VARCHAR(50) DEFAULT NULL COMMENT '科室',
    `chief_complaint` TEXT DEFAULT NULL COMMENT '主诉',
    `medical_summary` TEXT DEFAULT NULL COMMENT 'AI病情摘要',
    `fee` DECIMAL(10,2) DEFAULT NULL COMMENT '会诊费用',
    `payment_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态 0未支付1已支付2已退款',
    `scheduled_time` DATETIME DEFAULT NULL COMMENT '排期时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `cancel_reason` VARCHAR(500) DEFAULT NULL COMMENT '取消原因',
    `reject_reason` VARCHAR(500) DEFAULT NULL COMMENT '退回原因',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_consultation_no` (`consultation_no`),
    INDEX `idx_patient` (`patient_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊主表';

CREATE TABLE IF NOT EXISTS `consultation_doctor` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `doctor_id` BIGINT NOT NULL COMMENT '医生ID',
    `role` TINYINT NOT NULL DEFAULT 0 COMMENT '角色 0普通专家1主持人',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待确认1已确认2已拒绝',
    `confirm_time` DATETIME DEFAULT NULL COMMENT '确认时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`),
    INDEX `idx_doctor` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊-医生关联';

CREATE TABLE IF NOT EXISTS `consultation_status_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `from_status` TINYINT DEFAULT NULL COMMENT '原状态',
    `to_status` TINYINT NOT NULL COMMENT '新状态',
    `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊状态变更日志';

CREATE TABLE IF NOT EXISTS `consultation_upload` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
    `file_type` TINYINT NOT NULL COMMENT '类型 1影像2化验单3病理报告4其他',
    `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小(字节)',
    `ocr_result` TEXT DEFAULT NULL COMMENT 'OCR识别结果',
    `ai_review` TEXT DEFAULT NULL COMMENT 'AI审核结果',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='上传资料记录';

CREATE TABLE IF NOT EXISTS `report` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '类型 1专业版2患者版',
    `content` LONGTEXT DEFAULT NULL COMMENT '报告内容(JSON)',
    `pdf_url` VARCHAR(500) DEFAULT NULL COMMENT 'PDF文件URL',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0草稿1待审核2已签发',
    `signed_by` BIGINT DEFAULT NULL COMMENT '签发医生ID',
    `signed_time` DATETIME DEFAULT NULL COMMENT '签发时间',
    `template_id` BIGINT DEFAULT NULL COMMENT '报告模板ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊报告';

CREATE TABLE IF NOT EXISTS `report_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
    `department` VARCHAR(50) DEFAULT NULL COMMENT '科室',
    `content_template` LONGTEXT NOT NULL COMMENT '模板内容(JSON)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报告模板';

-- =============================================
-- 支付与通知
-- =============================================

CREATE TABLE IF NOT EXISTS `payment_order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '金额',
    `fee_detail` JSON DEFAULT NULL COMMENT '费用明细',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待支付1已支付2已退款',
    `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付订单';

CREATE TABLE IF NOT EXISTS `payment_refund` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `refund_no` VARCHAR(32) NOT NULL COMMENT '退款单号',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '退款金额',
    `reason` VARCHAR(500) DEFAULT NULL COMMENT '退款原因',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0处理中1已退款2退款失败',
    `refund_time` DATETIME DEFAULT NULL COMMENT '退款时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款记录';

CREATE TABLE IF NOT EXISTS `notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_type` TINYINT NOT NULL COMMENT '用户类型 1患者2医生3管理员',
    `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号(患者)',
    `type` TINYINT NOT NULL COMMENT '通知类型 1短信2站内信3WebSocket推送',
    `title` VARCHAR(200) DEFAULT NULL COMMENT '标题',
    `content` TEXT NOT NULL COMMENT '内容',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待发送1已发送2发送失败',
    `send_time` DATETIME DEFAULT NULL COMMENT '发送时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user` (`user_type`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知记录';

-- =============================================
-- 影像与音视频
-- =============================================

CREATE TABLE IF NOT EXISTS `imaging_file` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `patient_id` BIGINT NOT NULL COMMENT '患者ID',
    `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
    `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
    `file_type` VARCHAR(20) DEFAULT NULL COMMENT '文件类型(DICOM/JPG/PNG)',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小',
    `ai_analysis` TEXT DEFAULT NULL COMMENT 'AI影像分析结果',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='影像文件记录';

CREATE TABLE IF NOT EXISTS `live_room` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `room_id` VARCHAR(100) NOT NULL COMMENT 'TRTC房间号',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0未开始1进行中2已结束',
    `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊室记录';

CREATE TABLE IF NOT EXISTS `live_recording` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `room_id` BIGINT NOT NULL COMMENT '会诊室ID',
    `file_url` VARCHAR(500) NOT NULL COMMENT '录制文件URL',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小',
    `duration` INT DEFAULT NULL COMMENT '时长(秒)',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_room` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='录制文件';

-- =============================================
-- 管理与系统
-- =============================================

CREATE TABLE IF NOT EXISTS `qc_result` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `report_id` BIGINT NOT NULL COMMENT '报告ID',
    `completeness_score` DECIMAL(5,2) DEFAULT NULL COMMENT '完整性得分',
    `standard_score` DECIMAL(5,2) DEFAULT NULL COMMENT '规范性得分',
    `consistency_score` DECIMAL(5,2) DEFAULT NULL COMMENT '一致性得分',
    `total_score` DECIMAL(5,2) DEFAULT NULL COMMENT '总分',
    `issues` TEXT DEFAULT NULL COMMENT '问题列表(JSON)',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待处理1已通过2退回修改',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_report` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报告质控结果';

CREATE TABLE IF NOT EXISTS `operation_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_type` TINYINT NOT NULL COMMENT '用户类型 2医生3管理员',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `operation` VARCHAR(200) NOT NULL COMMENT '操作描述',
    `method` VARCHAR(200) DEFAULT NULL COMMENT '请求方法',
    `params` TEXT DEFAULT NULL COMMENT '请求参数',
    `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user` (`user_type`, `user_id`),
    INDEX `idx_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志';

CREATE TABLE IF NOT EXISTS `sys_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT NOT NULL COMMENT '配置值',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置';

CREATE TABLE IF NOT EXISTS `sys_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `role_code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色';

CREATE TABLE IF NOT EXISTS `sys_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `permission_name` VARCHAR(100) NOT NULL COMMENT '权限名称',
    `permission_code` VARCHAR(100) NOT NULL COMMENT '权限编码',
    `type` TINYINT NOT NULL COMMENT '类型 1菜单2按钮',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父权限ID',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_permission_code` (`permission_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限';

CREATE TABLE IF NOT EXISTS `sys_role_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT NOT NULL COMMENT '权限ID',
    PRIMARY KEY (`id`),
    INDEX `idx_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联';

CREATE TABLE IF NOT EXISTS `follow_up` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `patient_id` BIGINT NOT NULL COMMENT '患者ID',
    `plan_day` INT NOT NULL COMMENT '随访天数(第N天)',
    `questionnaire` TEXT DEFAULT NULL COMMENT '问卷内容(JSON)',
    `answer` TEXT DEFAULT NULL COMMENT '回答内容(JSON)',
    `ai_analysis` TEXT DEFAULT NULL COMMENT 'AI分析结果',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待发送1已发送2已回答3异常提醒',
    `send_time` DATETIME DEFAULT NULL COMMENT '发送时间',
    `answer_time` DATETIME DEFAULT NULL COMMENT '回答时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='随访记录';

CREATE TABLE IF NOT EXISTS `evaluation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `patient_id` BIGINT NOT NULL COMMENT '患者ID',
    `doctor_score` TINYINT DEFAULT NULL COMMENT '专家评分(1-5)',
    `service_score` TINYINT DEFAULT NULL COMMENT '服务评分(1-5)',
    `comment` VARCHAR(500) DEFAULT NULL COMMENT '文字评价',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价';

-- =============================================
-- 初始数据
-- =============================================

-- 角色
INSERT INTO `sys_role` (`id`, `role_name`, `role_code`, `remark`) VALUES
(1, '超级管理员', 'SUPER_ADMIN', '拥有所有权限'),
(2, '运营管理员', 'OPERATOR', '日常运营管理'),
(3, '质控管理员', 'QC_ADMIN', '质量管理'),
(4, '财务管理员', 'FINANCE_ADMIN', '财务管理');

-- 权限
INSERT INTO `sys_permission` (`id`, `permission_name`, `permission_code`, `type`, `parent_id`, `sort_order`) VALUES
(1, '系统管理', 'system', 1, NULL, 1),
(2, '用户管理', 'system:user', 1, 1, 1),
(3, '角色管理', 'system:role', 1, 1, 2),
(4, '业务管理', 'business', 1, NULL, 2),
(5, '会诊管理', 'business:consultation', 1, 4, 1),
(6, '医生管理', 'business:doctor', 1, 4, 2),
(7, '质控管理', 'business:qc', 1, 4, 3),
(8, '财务管理', 'business:finance', 1, 4, 4),
(9, '数据大屏', 'business:dashboard', 1, 4, 5);

-- 角色权限(超级管理员拥有所有权限)
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9);

-- 管理员(密码: admin123, BCrypt加密)
INSERT INTO `admin` (`id`, `username`, `password`, `name`, `role_id`) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '超级管理员', 1);

-- 示例医生(密码: 123456, BCrypt加密)
INSERT INTO `doctor` (`id`, `username`, `password`, `name`, `title`, `department`, `status`) VALUES
(1, 'zhangsan', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '张三', '主任医师', '肿瘤内科', 1),
(2, 'lisi', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '李四', '副主任医师', '外科', 1),
(3, 'wangwu', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '王五', '主治医师', '放射科', 1),
(4, 'zhaoliu', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '赵六', '主任医师', '心血管内科', 1),
(5, 'sunqi', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '孙七', '副主任医师', '病理科', 1);

-- 系统配置
INSERT INTO `sys_config` (`config_key`, `config_value`, `remark`) VALUES
('single_fee', '500.00', '单学科会诊费用'),
('mdt_fee', '1500.00', '多学科会诊费用'),
('platform_service_rate', '0.10', '平台服务费比例'),
('follow_up_days', '3,7,30', '随访天数'),
('consultation_timeout_hours', '48', '会诊超时时间(小时)');

-- 报告模板
INSERT INTO `report_template` (`id`, `name`, `department`, `content_template`) VALUES
(1, '通用会诊报告模板', NULL, '{"sections":[{"title":"会诊经过","key":"process"},{"title":"诊断分析讨论","key":"analysis"},{"title":"最终诊断","key":"diagnosis"},{"title":"治疗建议","key":"suggestion"}]}');
