# [빅뱅영어학원] 카카오톡 오픈채팅 주소 변경 및 실시간 상담 신청 이메일 알림 연동 계획

빅뱅영어학원 웹사이트에서 카카오톡 오픈채팅방 링크를 손쉽게 변경하는 코드 위치와 관리자 화면 사용법을 안내하고, 학부모가 상담 예약을 신청했을 때 별도의 백엔드 서버 없이도 원장님 이메일(`jsflying1001@gmail.com`)로 즉시 상세 알림이 발송되는 무서버(Serverless) 이메일 알림 시스템 구축 계획입니다.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> 1단계 질문을 통해 확인된 사용자 결정 사항:
> - **알림 방식**: Netlify 정적 호스팅 환경에 최적화된 **무서버(Serverless) 이메일 발송 방식 (Web3Forms / EmailJS)** 채택 (별도 Express 서버 유지보수 불필요)
> - **수신 이메일**: `jsflying1001@gmail.com`
> - **오픈채팅방 주소 변경**: 코드 파일 수정 위치와 관리자 패널을 통한 변경 방법을 단계별로 명확히 정리하여 제공

---

### 1. Overview & Core Concept

1. **카카오톡 1:1 오픈채팅방 주소 변경 가이드**:
   - 코드 소스 파일 2곳(`src/data/schools.ts`, `src/utils/kakaoShare.ts`)의 수정 위치 안내
   - 관리자 로그인 화면(`AdminDashboardView.tsx`)에서 코드 수정 없이 즉시 변경하는 방법 안내
2. **상담 신청 접수 시 실시간 이메일 알림 (`jsflying1001@gmail.com`)**:
   - 학부모가 메인 랜딩페이지의 '1:1 상담 예약 카드' 또는 '예약 모달'에서 상담을 접수하면, 브라우저가 자동으로 원장님 이메일로 학생명, 학교, 학년, 학부모 연락처, 희망 상담일시, 주요 고민 내용을 정리한 이메일을 즉시 전송
   - Netlify 무료 정적 호스팅 환경에서도 100% 안정적으로 작동하는 Web3Forms / EmailJS 연동 모듈 탑재

---

### 2. User Experience & Visual Design

- **학부모 화면 (신청 완료 시)**:
  - 상담 신청 버튼 클릭 시 로딩 스피너 및 접수 완료 모달 표시 (기존 사용자 경험 유지)
  - 이메일 발송은 백그라운드에서 비동기 처리되어 학부모 화면의 딜레이가 전혀 없음
- **원장 관리자 대시보드 (설정 탭)**:
  - '실시간 알림 및 오픈채팅 설정' 탭에 **이메일 알림 수신 설정 카드** 추가
  - 현재 수신 이메일(`jsflying1001@gmail.com`) 표시 및 **[테스트 이메일 발송]** 버튼을 제공하여 원장님 메일함으로 즉시 테스트 알림이 잘 오는지 1초 만에 확인 가능

---

### 3. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      빅뱅영어학원 프론트엔드                    │
│   (https://bigbangeng.netlify.app / Netlify Static SPA)     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     [1] 1:1 상담 신청 접수           [2] 원장 관리자 화면
               │                              │
               ▼                              ▼
  ┌─────────────────────────┐   ┌─────────────────────────────┐
  │ src/utils/emailNotify.ts│   │   카카오톡 오픈채팅 주소     │
  │ (Web3Forms/EmailJS API) │   │   코드 직접 수정 or 대시보드 │
  └────────────┬────────────┘   └─────────────────────────────┘
               │ (HTTPS POST)
               ▼
  ┌───────────────────────────────────────────────────────────┐
  │         원장님 이메일함 (jsflying1001@gmail.com)          │
  │  • 제목: [빅뱅영어학원] 신규 상담 신청: OOO 학생 (OO고 1학년)│
  │  • 내용: 학생명, 연락처, 학교, 희망일시, 고민사항            │
  └───────────────────────────────────────────────────────────┘
```

#### 주요 모듈 구성
1. **`src/utils/emailNotification.ts` (신규)**:
   - 상담 신청 데이터(`ReservationShareData`)를 정돈된 HTML 및 텍스트 템플릿으로 변환
   - `sendConsultationEmailNotification(reservation)` 비동기 발송 함수 제공
   - 무료 Web3Forms API 엔드포인트 연동 (스팸 방지 및 0.5초 초고속 전송)
2. **`src/components/QuickReservationCard.tsx` & `src/components/ReservationModal.tsx`**:
   - 상담 접수 성공 시 `sendConsultationEmailNotification` 자동 호출
3. **`src/components/AdminDashboardView.tsx`**:
   - 알림 설정 탭에 이메일 알림 연동 상태 및 원클릭 '테스트 이메일 발송' 기능 추가

---

### 4. Implementation Steps

1. **카카오톡 오픈채팅방 주소 변경 안내 가이드 작성**:
   - 파일 위치: `src/data/schools.ts` (라인 357 `kakaoChannelUrl`)
   - 파일 위치: `src/utils/kakaoShare.ts` (라인 54 `openKakaoConsultation`)
   - 관리자 패널: `AdminDashboardView.tsx` 알림 설정 탭
2. **이메일 알림 전송 유틸리티 구현 (`src/utils/emailNotification.ts`)**:
   - 수신자 `jsflying1001@gmail.com` 설정
   - 상담 신청 내역(학생명, 연락처, 학교/학년, 희망 상담 시간, 고민 등) 정돈 포맷
3. **상담 신청 완료 이벤트와 이메일 발송 연동**:
   - `QuickReservationCard.tsx` 및 `ReservationModal.tsx`에 이메일 발송 훅 연결
4. **관리자 대시보드 테스트 발송 기능 탑재**:
   - `AdminDashboardView.tsx`에서 원장님이 버튼 하나로 이메일 수신 테스트를 수행할 수 있도록 UI 배치
5. **빌드 검증**:
   - `compile_applet` 및 `lint_applet`으로 오류 없음 최종 확인
