-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- 생성 시간: 25-09-19 05:24
-- 서버 버전: 10.4.32-MariaDB
-- PHP 버전: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 데이터베이스: `estimate`
--

-- --------------------------------------------------------

--
-- 테이블 구조 `applications`
--

CREATE TABLE `applications` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL COMMENT '신청한 사용자 ID',
  `status` enum('REQUESTED','QUOTED','PAID') DEFAULT 'REQUESTED' COMMENT '상태 (REQUESTED=신청됨, QUOTED=견적 완료, PAID=결제됨)',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '신청일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 테이블의 덤프 데이터 `applications`
--

INSERT INTO `applications` (`id`, `user_id`, `status`, `created_at`) VALUES
(1, 1, 'REQUESTED', '2025-09-17 13:00:11'),
(2, 1, 'REQUESTED', '2025-09-18 12:07:21');

-- --------------------------------------------------------

--
-- 테이블 구조 `application_products`
--

CREATE TABLE `application_products` (
  `id` bigint(20) NOT NULL,
  `application_id` bigint(20) NOT NULL COMMENT '신청 내역 ID',
  `product_id` bigint(20) NOT NULL COMMENT '상품 고유 ID',
  `quantity` int(11) DEFAULT 1 COMMENT '수량',
  `price` int(11) NOT NULL COMMENT '단가'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 테이블의 덤프 데이터 `application_products`
--

INSERT INTO `application_products` (`id`, `application_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 250000),
(2, 1, 2, 1, 500000),
(3, 1, 3, 1, 30000),
(4, 2, 1, 1, 250000),
(5, 2, 3, 1, 30000),
(6, 2, 4, 1, 50000),
(7, 2, 8, 1, 100000),
(8, 2, 14, 1, 3500000),
(9, 2, 16, 1, 1200000);

-- --------------------------------------------------------

--
-- 테이블 구조 `estimates`
--

CREATE TABLE `estimates` (
  `id` bigint(20) NOT NULL COMMENT '내부 고유값 (자동 증가)',
  `estimate_number` varchar(20) NOT NULL COMMENT '실제 견적번호',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '생성일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 테이블의 덤프 데이터 `estimates`
--

INSERT INTO `estimates` (`id`, `estimate_number`, `created_at`) VALUES
(1, '250916_1314_01', '2025-09-16 13:14:49'),
(2, '250916_1316_02', '2025-09-16 13:16:06'),
(3, '250916_1321_03', '2025-09-16 13:21:04'),
(4, '250916_1418_04', '2025-09-16 14:18:02'),
(5, '250916_1420_05', '2025-09-16 14:20:00'),
(6, '250916_1729_06', '2025-09-16 17:29:00'),
(26, '250917_1028_20', '2025-09-17 10:28:13'),
(27, '250917_1029_21', '2025-09-17 10:29:44'),
(28, '250917_1032_22', '2025-09-17 10:32:26'),
(29, '250917_1033_23', '2025-09-17 10:33:20'),
(30, '250917_1034_24', '2025-09-17 10:34:18'),
(31, '250917_1035_25', '2025-09-17 10:35:18'),
(32, '250917_1040_26', '2025-09-17 10:40:14'),
(33, '250917_1044_27', '2025-09-17 10:44:18'),
(34, '250918_1040_01', '2025-09-18 10:40:12'),
(35, '250918_1131_02', '2025-09-18 11:31:21'),
(36, '250918_1136_03', '2025-09-18 11:36:58'),
(37, '250918_1137_04', '2025-09-18 11:37:52'),
(38, '250918_1210_05', '2025-09-18 12:10:13'),
(39, '250918_1606_06', '2025-09-18 16:06:01'),
(40, '250918_1705_07', '2025-09-18 17:05:49'),
(41, '250919_1006_01', '2025-09-19 10:06:20'),
(42, '250919_1136_02', '2025-09-19 11:36:07'),
(43, '250919_1150_03', '2025-09-19 11:50:03'),
(44, '250919_1157_04', '2025-09-19 11:57:35'),
(45, '250919_1158_05', '2025-09-19 11:58:24'),
(46, '250919_1158_06', '2025-09-19 11:58:44'),
(47, '250919_1203_07', '2025-09-19 12:03:37'),
(48, '250919_1203_08', '2025-09-19 12:03:49'),
(49, '250919_1208_09', '2025-09-19 12:08:45'),
(50, '250919_1211_10', '2025-09-19 12:11:00');

-- --------------------------------------------------------

--
-- 테이블 구조 `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `quote_id` bigint(20) NOT NULL COMMENT '견적서 고유 ID',
  `pg_provider` varchar(50) DEFAULT NULL COMMENT 'PG사 이름',
  `amount` int(11) NOT NULL COMMENT '결제 금액',
  `status` enum('READY','PAID','FAILED') DEFAULT 'READY' COMMENT '상태 (READY=대기, PAID=완료, FAILED=실패)',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '결제 시각'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT '상품명',
  `price` int(11) NOT NULL COMMENT '기본 단가',
  `description` text DEFAULT NULL COMMENT '상품 설명',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 테이블의 덤프 데이터 `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `description`, `created_at`) VALUES
(1, 'CI 제작(로고)', 250000, '기업 아이덴티티(로고, 시그니처, 가이드라인)를 제작하여 브랜드 신뢰도를 높이고, 사업계획서 및 투자유치 자료에 일관성 있는 이미지를 제공합니다.\n예상 기간 : 2주(샘플 5안, 택 1), 최종 ai/eps 포함', '2025-09-15 12:52:55'),
(2, '홈페이지 제작', 500000, '반응형 웹 기반 기업 홈페이지를 제작하여 온라인 홍보, 해외 바이어 대상 신뢰성 확보, 수출바우처·정책자금 사업 참여 요건을 충족합니다.\n예상 기간 : 1개월(자료 제공 시), 디자인+퍼블리싱 포함', '2025-09-15 12:52:55'),
(3, '도메인 등록', 30000, '기업 전용 도메인(.com/.co.kr 등)을 등록하여 브랜드 보호 및 공식 비즈니스 채널을 확보합니다.\n예상 기간 : 즉시, 일반 gTLD 기준', '2025-09-15 12:52:55'),
(4, '서버 사용/관리', 50000, '안정적인 서버 환경과 보안 관리 서비스를 제공하여 기업의 정보 보호 및 R&D 과제 참여 시 평가 가점을 받을 수 있습니다.\n예상 기간 : 월 단위, 트래픽/백업 포함', '2025-09-15 12:52:55'),
(5, '상표권', 900000, '기업 브랜드/서비스명에 대한 상표를 등록하여 법적 보호를 강화하고, IP 담보대출 및 정책자금 심사에서 활용할 수 있습니다.\n예상 기간 : 관공서 일정, 등록 및 발급은 스케줄 따름', '2025-09-15 12:52:55'),
(6, '특허 (일반형)', 3500000, '신기술·아이디어에 대한 특허 출원을 대행하여 기술 독점권을 확보하고, 기술보증기금 보증 및 R&D 과제 가점 요소로 활용됩니다.\n예상 기간 : 3 ~ 6개월(심사 별도), 대출용 출원서는 별도문의', '2025-09-15 12:52:55'),
(7, '벤처기업 확인', 10000000, '벤처기업 인증을 획득하여 정책자금 심사 시 가점을 받고, 법인세 최대 50% 감면 등 세제 혜택을 받을 수 있습니다.\n예상 기간 : 2개월, 컨설팅 및 사후관리 포함', '2025-09-15 12:52:55'),
(8, '창업기업 확인', 100000, '창업 7년 이내 기업임을 증명하여 창업기업 전용 정책자금과 세제 감면 혜택을 받을 수 있습니다.\n예상 기간 : 1개월', '2025-09-15 12:52:55'),
(9, '중소기업 확인', 50000, '중소기업 확인서를 발급받아 모든 정책자금·정부지원사업 참여의 기본 자격을 갖춥니다.\n예상 기간 : 즉시, 온라인 즉시발급형', '2025-09-15 12:52:55'),
(10, '여성기업 확인', 200000, '여성대표 기업임을 인증하여 여성기업 전용 지원자금과 공공기관 조달 우선구매 혜택을 받을 수 있습니다.\n예상 기간 : 1개월, 여성대표 및 지분요건', '2025-09-15 12:52:55'),
(11, '인증 패키지', 300000, '중소, 창업, 여성기업 확인을 통합 진행하여 정부 과제·정책자금 심사에서 높은 가점을 확보할 수 있는 종합 패키지입니다.\n예상 기간 : 최장 1개월, 시장가의 1/4 수준', '2025-09-15 12:52:55'),
(12, 'ISO 9001/14001', 3500000, '품질경영(9001), 환경경영(14001) 국제표준 인증을 취득하여 공공기관 입찰 자격과 정책자금 심사 가점을 동시에 확보합니다.\n예상 기간 : 1개월, 컨설팅+심사 연계', '2025-09-15 12:52:55'),
(13, '메인비즈', 3000000, '경영혁신형 중소기업 인증을 통해 경영관리 체계를 입증하고, 정책자금·보증 한도 우대 혜택을 받을 수 있습니다.\n예상 기간 : 1 ~ 2개월, 경영혁신형', '2025-09-15 12:52:55'),
(14, '이노비즈', 3500000, '기술혁신형 중소기업 인증을 취득하여 연구개발 과제 선정, 조달 사업 참여 시 가점을 확보할 수 있습니다.\n예상 기간 : 2 ~ 3개월, 기술혁신형', '2025-09-15 12:52:55'),
(15, '사업계획서', 1500000, '정책자금, 금융기관 제출용 사업계획서를 작성하여 투자자 및 기관 심사에서 기업의 성장성과 안정성을 효과적으로 제시합니다.\n예상 기간 : 1주(자료 충분 시), 금융 및 정책자금용', '2025-09-15 12:52:55'),
(16, '회사소개서/IR', 1200000, '투자유치용 IR 자료와 기업 홍보용 회사소개서를 제작하여 정책펀드, 모태펀드, 투자사 심사에서 기업 경쟁력을 강화합니다.\n예상 기간 : 2주, IR 슬라이드/원펭저 포함', '2025-09-15 12:52:55'),
(17, '영상/유튜브', 1500000, '기업 홍보용 영상·유튜브 콘텐츠를 제작하여 브랜드 신뢰도와 대외 홍보 효과를 높이고, ESG 평가 시 긍정적 요소로 활용됩니다.\n예상 기간 : 2주 ~ 1개월, 기획 및 촬영 및 편집', '2025-09-15 12:52:55'),
(18, '간접업무대행비용', 0, '직접인건비, 직접경비, 제경비(간접비), 기술료, 부가가치세를 합산하는 실비정액가산방식이 일반적으로 적용됩니다. 직접인건비(업무에 직접 투입되는 인력의 인건비), 직접경비(여비, 인쇄비 등 실제 소요 경비), 제경비(관리·운영비 등 간접비용), 기술료, 부가가치세 등이 포함됩니다.', '2025-09-19 11:12:29'),
(19, '정책자금성공보수', 0, '정책자금 컨설팅을 하고 문서작성을 도와줍니다. 관련된 모든 자료를 준비하고 시장조사등의 업무를 하고 의뢰인의  원활한 사업을 위한 모든 준비단계를 지원해줍니다.', '2025-09-19 11:12:29');

-- --------------------------------------------------------

--
-- 테이블 구조 `quotes`
--

CREATE TABLE `quotes` (
  `id` bigint(20) NOT NULL,
  `application_id` bigint(20) NOT NULL COMMENT '신청한 고객 ID',
  `total_amount` int(11) NOT NULL COMMENT '총 금액',
  `sent_email` tinyint(1) DEFAULT 0 COMMENT '이메일 발송 여부',
  `file_path` varchar(255) DEFAULT NULL COMMENT '다운로드 용 저장 경로',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL COMMENT '회사명',
  `phone` varchar(20) DEFAULT NULL COMMENT '연락처',
  `email` varchar(100) NOT NULL COMMENT '이메일',
  `provider` varchar(20) DEFAULT NULL COMMENT '로그인 제공자(가입한 메일)',
  `role` enum('USER','ADMIN') DEFAULT 'USER' COMMENT '역할',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '가입일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 테이블의 덤프 데이터 `users`
--

INSERT INTO `users` (`id`, `name`, `company_name`, `phone`, `email`, `provider`, `role`, `created_at`) VALUES
(1, '홍길동', '성진글로벌', '010-1234-1234', 'comp8467@gmail.com', 'google', 'USER', '2025-09-17 12:25:34'),
(2, '성진글로벌', '성진글로벌', '051-936-1255', 'sungjin_g@naver.com', 'naver', 'ADMIN', '2025-09-18 09:15:21'),
(4, NULL, NULL, NULL, 'sungjing25@gmail.com', 'google', 'ADMIN', '2025-09-18 11:28:07'),
(5, NULL, NULL, NULL, 'globalsungjin@gmail.com', 'google', 'ADMIN', '2025-09-18 11:28:23');

--
-- 덤프된 테이블의 인덱스
--

--
-- 테이블의 인덱스 `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- 테이블의 인덱스 `application_products`
--
ALTER TABLE `application_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `product_id` (`product_id`);

--
-- 테이블의 인덱스 `estimates`
--
ALTER TABLE `estimates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `estimate_number` (`estimate_number`);

--
-- 테이블의 인덱스 `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quote_id` (`quote_id`);

--
-- 테이블의 인덱스 `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- 테이블의 인덱스 `quotes`
--
ALTER TABLE `quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

--
-- 테이블의 인덱스 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- 덤프된 테이블의 AUTO_INCREMENT
--

--
-- 테이블의 AUTO_INCREMENT `applications`
--
ALTER TABLE `applications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 테이블의 AUTO_INCREMENT `application_products`
--
ALTER TABLE `application_products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- 테이블의 AUTO_INCREMENT `estimates`
--
ALTER TABLE `estimates`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '내부 고유값 (자동 증가)', AUTO_INCREMENT=51;

--
-- 테이블의 AUTO_INCREMENT `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- 테이블의 AUTO_INCREMENT `quotes`
--
ALTER TABLE `quotes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 덤프된 테이블의 제약사항
--

--
-- 테이블의 제약사항 `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- 테이블의 제약사항 `application_products`
--
ALTER TABLE `application_products`
  ADD CONSTRAINT `application_products_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `application_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- 테이블의 제약사항 `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE;

--
-- 테이블의 제약사항 `quotes`
--
ALTER TABLE `quotes`
  ADD CONSTRAINT `quotes_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
