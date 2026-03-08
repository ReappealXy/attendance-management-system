-- ============================================================
-- 考勤管理系统 - 完整数据库初始化脚本 (MySQL 8.0+)
-- 400条员工数据 | 5管理员 | 1超级管理员 | 软删除
-- 包含 1 个超级管理员、4 个管理员、395 个普通员工示例数据
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------
-- 1. 部门表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `parent_id` BIGINT NULL,
    `manager` VARCHAR(50),
    `member_count` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '软删除标记',
    FOREIGN KEY (`parent_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. 员工表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL COMMENT 'BCrypt加密',
    `name` VARCHAR(50) NOT NULL,
    `role` ENUM('super_admin', 'admin', 'employee') DEFAULT 'employee',
    `dept_id` BIGINT NULL,
    `department` VARCHAR(50) COMMENT '冗余字段-部门名称',
    `position` VARCHAR(50),
    `employee_id` VARCHAR(20) NOT NULL UNIQUE COMMENT '工号',
    `phone` VARCHAR(20),
    `email` VARCHAR(100),
    `avatar` VARCHAR(255),
    `join_date` DATE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '软删除标记',
    FOREIGN KEY (`dept_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 3. 考勤记录表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `attendance_records`;
CREATE TABLE `attendance_records` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `clock_in` TIME NULL,
    `clock_out` TIME NULL,
    `status` ENUM('normal', 'late', 'early', 'absent', 'leave') DEFAULT 'normal',
    `clock_in_lat` DECIMAL(10, 6) NULL,
    `clock_in_lng` DECIMAL(10, 6) NULL,
    `clock_out_lat` DECIMAL(10, 6) NULL,
    `clock_out_lng` DECIMAL(10, 6) NULL,
    `remark` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL DEFAULT NULL,
    UNIQUE KEY `uk_user_date` (`user_id`, `date`),
    FOREIGN KEY (`user_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 4. 请假申请表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `type` ENUM('annual', 'sick', 'personal', 'compensatory', 'overtime', 'business') NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    `approver_id` BIGINT NULL,
    `approver_comment` VARCHAR(255),
    `approved_at` DATETIME NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL DEFAULT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approver_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 5. 考勤规则表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `attendance_rules`;
CREATE TABLE `attendance_rules` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `clock_in_time` TIME NOT NULL,
    `clock_out_time` TIME NOT NULL,
    `late_threshold` INT DEFAULT 15 COMMENT '迟到容忍分钟数',
    `early_threshold` INT DEFAULT 15 COMMENT '早退容忍分钟数',
    `is_default` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 6. 假期类型表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `leave_types`;
CREATE TABLE `leave_types` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `max_days` INT NOT NULL,
    `require_approval` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 7. 公司配置表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `company_config`;
CREATE TABLE `company_config` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `config_key` VARCHAR(50) NOT NULL UNIQUE,
    `config_value` TEXT NOT NULL,
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 初始数据
-- ============================================================

-- 部门数据（8个顶级 + 5个子部门）
INSERT INTO `departments` (`id`, `name`, `parent_id`, `manager`, `member_count`) VALUES
(1,  '技术部', NULL, '张明远', 65),
(2,  '市场部', NULL, '刘芳',   45),
(3,  '人事部', NULL, '周蕾',   30),
(4,  '财务部', NULL, '吴强',   25),
(5,  '运营部', NULL, '杨帆',   50),
(6,  '产品部', NULL, '赵磊',   40),
(7,  '客服部', NULL, '孙丽',   55),
(8,  '行政部', NULL, '马超',   20),
(9,  '前端组', 1,    '李思涵', 22),
(10, '后端组', 1,    '赵雨萱', 20),
(11, '测试组', 1,    '陈晓',   15),
(12, '品牌组', 2,    '林月',   18),
(13, '渠道组', 2,    '何杰',   15);

-- 考勤规则
INSERT INTO `attendance_rules` (`name`, `clock_in_time`, `clock_out_time`, `late_threshold`, `early_threshold`, `is_default`) VALUES
('标准班次', '09:00', '18:00', 15, 15, 1),
('弹性班次', '10:00', '19:00', 30, 30, 0),
('早班',     '07:00', '16:00', 10, 10, 0);

-- 假期类型
INSERT INTO `leave_types` (`name`, `max_days`, `require_approval`) VALUES
('年假', 15, 1), ('事假', 10, 1), ('病假', 30, 1),
('调休', 5, 1),  ('婚假', 10, 1), ('产假', 90, 1), ('丧假', 3, 1);

-- 公司配置
INSERT INTO `company_config` (`config_key`, `config_value`) VALUES
('location', '{"latitude":29.5647,"longitude":106.2965,"name":"重庆人文科技学院","radius":500}');

-- ============================================================
-- 员工数据（400条）
-- 示例账号密码不直接写入仓库；SQL 中仅保留占位符
-- Spring Boot 启动时会将占位符替换为真实 BCrypt hash
-- 若未显式配置种子密码，系统会在首次启动时自动生成并打印到后端日志
-- ============================================================

-- 密码占位符说明:
-- __SEED_PASSWORD_COMMON__      → 启动时替换为普通示例账号初始密码的 BCrypt
-- __SEED_PASSWORD_SUPER_ADMIN__ → 启动时替换为超级管理员初始密码的 BCrypt

SET @pwd_seed_common = '__SEED_PASSWORD_COMMON__';
SET @pwd_seed_super_admin = '__SEED_PASSWORD_SUPER_ADMIN__';

-- ★ 超级管理员（ID=1）
INSERT INTO `employees` (`id`, `username`, `password`, `name`, `role`, `dept_id`, `department`, `position`, `employee_id`, `phone`, `email`, `join_date`) VALUES
(1, 'super_admin', @pwd_seed_super_admin, '系统管理员', 'super_admin', 1, '技术部', '系统管理员', 'EMP001', '13800000001', 'admin@company.com', '2020-01-01');

-- ★ 4个管理员（ID=2-5）
INSERT INTO `employees` (`id`, `username`, `password`, `name`, `role`, `dept_id`, `department`, `position`, `employee_id`, `phone`, `email`, `join_date`) VALUES
(2, 'admin_zhang', @pwd_seed_common, '张明远', 'admin', 1, '技术部', '技术总监',   'EMP002', '13800000002', 'zhangmy@company.com', '2020-03-15'),
(3, 'admin_liu',   @pwd_seed_common, '刘芳',   'admin', 2, '市场部', '市场总监',   'EMP003', '13800000003', 'liufang@company.com', '2020-05-20'),
(4, 'admin_zhou',  @pwd_seed_common, '周蕾',   'admin', 3, '人事部', '人事总监',   'EMP004', '13800000004', 'zhoulei@company.com', '2020-06-01'),
(5, 'admin_wu',    @pwd_seed_common, '吴强',   'admin', 4, '财务部', '财务总监',   'EMP005', '13800000005', 'wuqiang@company.com', '2020-07-10');

-- ★ 395个普通员工（ID=6-400）
-- 使用存储过程批量生成

DELIMITER //
CREATE PROCEDURE generate_employees()
BEGIN
    DECLARE i INT DEFAULT 6;
    DECLARE v_name VARCHAR(50);
    DECLARE v_dept_id INT;
    DECLARE v_dept_name VARCHAR(50);
    DECLARE v_position VARCHAR(50);
    DECLARE v_phone VARCHAR(20);
    DECLARE v_emp_id VARCHAR(20);
    
    -- 姓氏
    DECLARE surnames VARCHAR(500) DEFAULT '张,李,王,赵,陈,刘,杨,黄,周,吴,徐,孙,马,朱,胡,郭,林,何,高,罗,郑,梁,谢,宋,唐,韩,曹,许,邓,冯,曾,彭,萧,蒋,蔡,贾,丁,魏,薛,叶';
    DECLARE given_names VARCHAR(500) DEFAULT '明远,思涵,佳琪,志豪,雨萱,浩然,欣怡,子轩,梓涵,一诺,宇航,诗琪,俊杰,美琳,天翔,雅馨,文博,语嫣,晨曦,若彤,嘉豪,静怡,泽宇,紫萱,昊天,梦瑶,鹏飞,雪晴,建国,淑芳,伟强,丽华,国庆,秀英,永强,桂兰,德华,翠花,军伟,春梅';
    
    DECLARE surname_count INT DEFAULT 40;
    DECLARE given_count INT DEFAULT 40;
    DECLARE dept_count INT DEFAULT 8;
    
    WHILE i <= 400 DO
        -- 随机部门 (1-8)
        SET v_dept_id = FLOOR(1 + RAND() * dept_count);
        SET v_dept_name = CASE v_dept_id
            WHEN 1 THEN '技术部' WHEN 2 THEN '市场部' WHEN 3 THEN '人事部' WHEN 4 THEN '财务部'
            WHEN 5 THEN '运营部' WHEN 6 THEN '产品部' WHEN 7 THEN '客服部' ELSE '行政部'
        END;
        
        -- 随机岗位
        SET v_position = CASE v_dept_id
            WHEN 1 THEN ELT(FLOOR(1 + RAND() * 6), '前端工程师','后端工程师','测试工程师','架构师','运维工程师','DevOps工程师')
            WHEN 2 THEN ELT(FLOOR(1 + RAND() * 5), '市场专员','品牌经理','渠道专员','市场总监助理','推广专员')
            WHEN 3 THEN ELT(FLOOR(1 + RAND() * 5), 'HR专员','招聘专员','培训专员','HRBP','薪酬专员')
            WHEN 4 THEN ELT(FLOOR(1 + RAND() * 5), '会计','出纳','财务分析师','审计专员','税务专员')
            WHEN 5 THEN ELT(FLOOR(1 + RAND() * 5), '运营专员','数据分析师','内容运营','活动策划','用户运营')
            WHEN 6 THEN ELT(FLOOR(1 + RAND() * 5), '产品经理','产品助理','UI设计师','UX设计师','需求分析师')
            WHEN 7 THEN ELT(FLOOR(1 + RAND() * 4), '客服专员','客服主管','投诉处理专员','售后专员')
            ELSE ELT(FLOOR(1 + RAND() * 5), '行政专员','前台','后勤管理','文员','采购专员')
        END;
        
        -- 随机姓名
        SET v_name = CONCAT(
            SUBSTRING_INDEX(SUBSTRING_INDEX(surnames, ',', FLOOR(1 + RAND() * surname_count)), ',', -1),
            SUBSTRING_INDEX(SUBSTRING_INDEX(given_names, ',', FLOOR(1 + RAND() * given_count)), ',', -1)
        );
        
        -- 工号
        SET v_emp_id = CONCAT('EMP', LPAD(i, 3, '0'));
        
        -- 手机号
        SET v_phone = CONCAT(
            ELT(FLOOR(1 + RAND() * 10), '138','139','136','137','135','150','151','152','188','189'),
            LPAD(FLOOR(RAND() * 100000000), 8, '0')
        );
        
        INSERT INTO `employees` (`id`, `username`, `password`, `name`, `role`, `dept_id`, `department`, `position`, `employee_id`, `phone`, `email`, `join_date`)
        VALUES (
            i,
            CONCAT('user', LPAD(i, 3, '0')),
            @pwd_seed_common,
            v_name,
            'employee',
            v_dept_id,
            v_dept_name,
            v_position,
            v_emp_id,
            v_phone,
            CONCAT('user', LPAD(i, 3, '0'), '@company.com'),
            DATE_ADD('2018-01-01', INTERVAL FLOOR(RAND() * 2920) DAY)
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_employees();
DROP PROCEDURE IF EXISTS generate_employees;

-- ============================================================
-- 考勤记录（最近30个工作日 × 400人）
-- ============================================================

DELIMITER //
CREATE PROCEDURE generate_attendance()
BEGIN
    DECLARE d INT DEFAULT 0;
    DECLARE v_date DATE;
    DECLARE v_day_of_week INT;
    DECLARE v_user_id INT;
    DECLARE v_rand DOUBLE;
    DECLARE v_status VARCHAR(10);
    DECLARE v_clock_in TIME;
    DECLARE v_clock_out TIME;
    
    WHILE d < 30 DO
        SET v_date = DATE_SUB(CURDATE(), INTERVAL d DAY);
        SET v_day_of_week = DAYOFWEEK(v_date);
        
        -- 跳过周末
        IF v_day_of_week NOT IN (1, 7) THEN
            SET v_user_id = 1;
            WHILE v_user_id <= 400 DO
                SET v_rand = RAND();
                
                IF v_rand < 0.08 THEN
                    -- 迟到 8%
                    SET v_status = 'late';
                    SET v_clock_in = ADDTIME('09:10:00', SEC_TO_TIME(FLOOR(RAND() * 3000)));
                    SET v_clock_out = ADDTIME('18:00:00', SEC_TO_TIME(FLOOR(RAND() * 600)));
                ELSEIF v_rand < 0.12 THEN
                    -- 早退 4%
                    SET v_status = 'early';
                    SET v_clock_in = ADDTIME('08:30:00', SEC_TO_TIME(FLOOR(RAND() * 1800)));
                    SET v_clock_out = SUBTIME('18:00:00', SEC_TO_TIME(FLOOR(600 + RAND() * 1800)));
                ELSEIF v_rand < 0.14 THEN
                    -- 缺勤 2%
                    SET v_status = 'absent';
                    SET v_clock_in = NULL;
                    SET v_clock_out = NULL;
                ELSEIF v_rand < 0.17 THEN
                    -- 请假 3%
                    SET v_status = 'leave';
                    SET v_clock_in = NULL;
                    SET v_clock_out = NULL;
                ELSE
                    -- 正常 83%
                    SET v_status = 'normal';
                    SET v_clock_in = ADDTIME('08:30:00', SEC_TO_TIME(FLOOR(RAND() * 1800)));
                    SET v_clock_out = ADDTIME('18:00:00', SEC_TO_TIME(FLOOR(RAND() * 600)));
                END IF;
                
                INSERT IGNORE INTO `attendance_records` (`user_id`, `date`, `clock_in`, `clock_out`, `status`,
                    `clock_in_lat`, `clock_in_lng`, `clock_out_lat`, `clock_out_lng`)
                VALUES (
                    v_user_id, v_date, v_clock_in, v_clock_out, v_status,
                    CASE WHEN v_clock_in IS NOT NULL THEN 29.5647 + (RAND() - 0.5) * 0.003 ELSE NULL END,
                    CASE WHEN v_clock_in IS NOT NULL THEN 106.2965 + (RAND() - 0.5) * 0.003 ELSE NULL END,
                    CASE WHEN v_clock_out IS NOT NULL THEN 29.5647 + (RAND() - 0.5) * 0.003 ELSE NULL END,
                    CASE WHEN v_clock_out IS NOT NULL THEN 106.2965 + (RAND() - 0.5) * 0.003 ELSE NULL END
                );
                
                SET v_user_id = v_user_id + 1;
            END WHILE;
        END IF;
        
        SET d = d + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_attendance();
DROP PROCEDURE IF EXISTS generate_attendance;

-- ============================================================
-- 请假申请数据（80条）
-- ============================================================

DELIMITER //
CREATE PROCEDURE generate_leave_requests()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE v_user_id INT;
    DECLARE v_type VARCHAR(20);
    DECLARE v_status VARCHAR(20);
    DECLARE v_start DATE;
    DECLARE v_end DATE;
    DECLARE v_reason VARCHAR(255);
    DECLARE v_rand DOUBLE;
    
    WHILE i <= 80 DO
        SET v_user_id = FLOOR(6 + RAND() * 395);
        
        SET v_type = ELT(FLOOR(1 + RAND() * 6), 'annual', 'sick', 'personal', 'compensatory', 'overtime', 'business');
        
        SET v_rand = RAND();
        IF i <= 20 THEN
            SET v_status = 'pending';
        ELSEIF v_rand < 0.6 THEN
            SET v_status = 'approved';
        ELSE
            SET v_status = 'rejected';
        END IF;
        
        SET v_start = DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 30 - 15) DAY);
        SET v_end = DATE_ADD(v_start, INTERVAL FLOOR(1 + RAND() * 3) DAY);
        
        SET v_reason = CASE v_type
            WHEN 'annual' THEN ELT(FLOOR(1+RAND()*5), '回老家探亲','家庭旅行','个人事务处理','婚礼参加','搬家')
            WHEN 'sick' THEN ELT(FLOOR(1+RAND()*5), '感冒发烧','肠胃不适','牙痛就医','腰椎不适需休息','过敏需要治疗')
            WHEN 'personal' THEN ELT(FLOOR(1+RAND()*5), '处理个人事务','家中水管维修','陪家人看病','办理证件','接送孩子')
            WHEN 'overtime' THEN ELT(FLOOR(1+RAND()*4), '项目上线需加班','紧急Bug修复','客户演示准备','季度结算')
            WHEN 'business' THEN ELT(FLOOR(1+RAND()*4), '参加行业招聘会','客户拜访','分公司出差','参加培训')
            ELSE ELT(FLOOR(1+RAND()*3), '之前加班调休','国庆加班补休','周末加班调休')
        END;
        
        INSERT INTO `leave_requests` (`user_id`, `type`, `start_date`, `end_date`, `reason`, `status`,
            `approver_id`, `approver_comment`, `approved_at`, `created_at`)
        VALUES (
            v_user_id, v_type, v_start, v_end, v_reason, v_status,
            CASE WHEN v_status != 'pending' THEN FLOOR(1 + RAND() * 5) ELSE NULL END,
            CASE WHEN v_status = 'approved' THEN '同意' WHEN v_status = 'rejected' THEN '不符合条件，建议延期' ELSE NULL END,
            CASE WHEN v_status != 'pending' THEN DATE_SUB(v_start, INTERVAL 1 DAY) ELSE NULL END,
            DATE_SUB(v_start, INTERVAL FLOOR(1 + RAND() * 3) DAY)
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_leave_requests();
DROP PROCEDURE IF EXISTS generate_leave_requests;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 提示
-- ============================================================
-- 1. BCrypt 密码 hash 由后端在启动时自动修复占位符
--    可通过环境变量 SEED_SUPER_ADMIN_PASSWORD / SEED_COMMON_USER_PASSWORD 提前指定
--    若未指定，系统会在首次启动时自动生成初始化密码并打印到后端日志
--
-- 2. 查询时需加 WHERE deleted_at IS NULL 过滤软删除记录
--    推荐使用 MyBatis-Plus 的 @TableLogic 注解自动处理
--
-- 3. 默认 SQL 会导入 1 个超级管理员、4 个管理员和 395 个普通员工示例数据
--    首次初始化完成后，请登录系统并立即重置关键账号密码
-- ============================================================
