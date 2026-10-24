export interface ClientChatParams {
  message: string;
  school?: string;
  grade?: string;
  concern?: string;
  stage?: number;
}

export interface ClientChatResult {
  text: string;
  stage: number;
  suggestedReplies: string[];
}

export function generateClientChatResponse(params: ClientChatParams): ClientChatResult {
  const { message, school, grade, concern } = params;
  const lower = message.toLowerCase();

  // 1. Detect custom school, grade, and weakness diagnosis request
  if (message.includes('기타 학교·학년 맞춤 진단') || message.includes('재학 학교:')) {
    const schoolMatch = message.match(/재학 학교:\s*([^\n\r]+)/);
    const gradeMatch = message.match(/학년:\s*([^\n\r]+)/);
    const concernMatch = message.match(/부족한 (?:영역|부분):\s*([^\n\r]+)/);
    const detailMatch = message.match(/상세 (?:고민|부족한 점):\s*([^\n\r]+)/);

    const targetSchool = schoolMatch ? schoolMatch[1].trim() : (school || '재학 중인 학교');
    const targetGrade = gradeMatch ? gradeMatch[1].trim() : (grade || '해당 학년');
    const targetConcern = concernMatch ? concernMatch[1].trim() : (concern || '서술형 영작 및 어법 취약');
    const targetDetail = detailMatch ? detailMatch[1].trim() : '';

    return {
      text: `🎯 **${targetSchool} (${targetGrade}) 맞춤 정밀 진단 솔루션**입니다!\n\n학생분께서 남겨주신 부족한 영역(**${targetConcern}**)${targetDetail ? ` 및 고민사항("${targetDetail}")` : ''}을 꼼꼼히 확인했습니다.\n\n💡 **빅뱅영어학원 취약점 집중 클리닉 처방**:\n• **${targetSchool} 맞춤형 내신 분석**: 교과서 및 외부 지문/부교재 출제 비율을 반영한 1:1 맞춤 진도 설계\n• **취약 영역 집중 돌파**: ${targetConcern.includes('서술형') ? '감점 요인 0%를 위한 필수 조건 영작 12패턴 집중 훈련 및 1:1 대면 첨삭' : '어법·구문 뼈대 세우기(SVOC 직독직해) 및 3단계 어휘 체화 드릴'}\n• **원장 직강 1:1 밀착 피드백**: 학생의 실제 시험지 오답 분석을 통해 틀린 이유를 핀셋 교정\n\n현재 학생의 진짜 영어 취약점과 단원별 구멍을 데이터로 정확히 진단받으실 수 있도록, 학원에서 **[60분 무료 정밀 레벨테스트 및 1:1 컨설팅]**을 진행하고 있습니다.\n\n평일 오후나 주말 중 편하신 방문 일정을 남겨주시면 무료 예약을 바로 확정해 드리겠습니다! 😊`,
      stage: 4,
      suggestedReplies: [
        '무료 레벨테스트 예약할게요!',
        '평일 오후 6시 상담 가능한가요?',
        '주말 토요일 상담도 되나요?',
        '레벨테스트 진행방식이 궁금해요'
      ]
    };
  }

  // 2. Detect 2027 예비고1
  if (lower.includes('예비고1') || lower.includes('2027')) {
    return {
      text: `🎯 **2027 예비고1(현 중3) 고등영어 정밀 진단 안내**입니다!\n\n중등 내신에서는 교과서 본문 암기로 90점대(A등급)를 받던 학생들도, 고등학교 첫 중간고사에서 4~5등급으로 급락하는 경우가 매우 많습니다.\n\n고등학교 시험은 교과서 비중이 20% 내외이고 **모의고사/EBS 부교재 변형이 80% 이상**이며, 밑줄 없는 통문장 어법 수정과 조건 영작 등 **고난도 서술형 감점**이 1등급을 가르기 때문입니다.\n\n빅뱅영어학원에서는 **동인천고·숭덕여고·문일여고·만수고·인제고·신명여고** 등 지망 고교별 5개년 기출 DB를 바탕으로 **60분 무료 정밀 진단평가(어휘·문법·독해·구문)** 및 **원장 1:1 맞춤 로드맵 리포트 상담**을 제공합니다.\n\n지망하시는 고등학교나 희망하시는 방문 상담 일정을 남겨주시면 바로 안내해 드리겠습니다! 😊`,
      stage: 3,
      suggestedReplies: [
        '동인천고 지망 예정입니다',
        '숭덕여고 지망 예정입니다',
        '문일여고 지망 예정입니다',
        '만수고 지망 예정입니다',
        '2027 예비고1 무료 진단예약 신청'
      ]
    };
  }

  // 3. Detect school mention
  let matchedSchool = school || '';
  if (lower.includes('동인천') || lower.includes('동인천고')) matchedSchool = '동인천고등학교';
  else if (lower.includes('숭덕') || lower.includes('숭덕여고')) matchedSchool = '숭덕여고';
  else if (lower.includes('문일') || lower.includes('문일여고')) matchedSchool = '문일여고';
  else if (lower.includes('만수고') || lower.includes('만수고등학교')) matchedSchool = '만수고등학교';
  else if (lower.includes('인제') || lower.includes('인제고')) matchedSchool = '인제고등학교';
  else if (lower.includes('신명') || lower.includes('신명여고')) matchedSchool = '신명여자고등학교';
  else if (lower.includes('만수북') || lower.includes('만수북중')) matchedSchool = '만수북중학교';
  else if (lower.includes('만수여중')) matchedSchool = '만수여중학교';
  else if (lower.includes('만수중')) matchedSchool = '만수중학교';
  else if (lower.includes('간석여중') || lower.includes('간석여자중')) matchedSchool = '간석여자중학교';
  else if (lower.includes('정각') || lower.includes('정각중')) matchedSchool = '정각중학교';
  else if (lower.includes('초등') || lower.includes('담방초') || lower.includes('만수초') || lower.includes('인수초')) matchedSchool = '초등부(만수동 인근 초등학교)';

  // 4. Detect grade mention
  let matchedGrade = grade || '';
  if (lower.includes('1학년') || lower.includes('고1') || lower.includes('중1')) matchedGrade = lower.includes('중') ? '중1' : '1학년';
  else if (lower.includes('2학년') || lower.includes('고2') || lower.includes('중2')) matchedGrade = lower.includes('중') ? '중2' : '2학년';
  else if (lower.includes('3학년') || lower.includes('고3') || lower.includes('중3')) matchedGrade = lower.includes('중') ? '중3' : '3학년';

  // 5. If school is identified but NO grade specified yet: prompt user to choose grade for that school
  if (matchedSchool && !matchedGrade && !message.includes('학년')) {
    const isMiddle = matchedSchool.includes('중학교');
    const isElem = matchedSchool.includes('초등');
    const shortName = matchedSchool.replace('등학교', '').replace('학교', '');

    if (isElem) {
      return {
        text: `🎯 **${matchedSchool}** 학생이시군요! 😊\n\n초등부 어휘 마스터 및 중등 내신 선행을 위한 **현재 학년**을 선택해 주세요:`,
        stage: 1,
        suggestedReplies: [
          '초등 고학년 (5~6학년)',
          '초등 저학년 (3~4학년)',
          '✍️ 기타 학교·학년 직접 입력',
        ]
      };
    }

    if (isMiddle) {
      return {
        text: `🎯 **${matchedSchool}** 학생이시군요! 😊\n\n**${shortName}**의 학년별 내신 시험 대비 및 고등 영어 연계 진단을 위해 **현재 학년**을 아래에서 선택해 주세요:`,
        stage: 1,
        suggestedReplies: [
          `${shortName} 1학년입니다`,
          `${shortName} 2학년입니다`,
          `${shortName} 3학년입니다`,
          '🔥 2027 예비고1 (현 중3)',
          '✍️ 기타 학년 직접 입력'
        ]
      };
    }

    return {
      text: `🎯 **${matchedSchool}** 학생이시군요! 😊\n\n**${shortName}**의 학년별(1학년·2학년·3학년) 내신 출제 비중과 킬러 서술형 유형이 다릅니다. 정밀 1:1 맞춤 진단을 위해 **현재 학년**을 선택해 주세요:`,
      stage: 1,
      suggestedReplies: [
        `${shortName} 1학년입니다`,
        `${shortName} 2학년입니다`,
        `${shortName} 3학년입니다`,
        '✍️ 기타 학년 직접 입력'
      ]
    };
  }

  // 6. School + Grade specific insight
  if (matchedSchool) {
    const displayGrade = matchedGrade || '전 학년';
    let schoolSpecificInsight = '';

    if (matchedSchool.includes('동인천')) {
      schoolSpecificInsight = `💡 **동인천고등학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(비상 홍민표 / 능률) 20% + 모의고사 2~3개년(16~20지문) 80% + EBS 부교재
• **배점 구조**: 선택형 65점(20문항) + 서술형 35점(5문항)
• **1등급 컷**: 평균 93~95점선 (서술형 부분 감점이 1~2등급 결정)
• **핵심 킬러**: 밑줄 없이 전체 문단에서 틀린 어법 찾기, 지문 내 핵심 어휘의 유의어/반의어 치환, 요약문 조건 영작
• **빅뱅 맞춤 솔루션**: 동인천고 ${displayGrade} 5개년 기출 변형 족보 워크북 + 전 지문 7단계 체화 + 킬러 어법 1:1 클리닉`;
    } else if (matchedSchool.includes('숭덕')) {
      schoolSpecificInsight = `💡 **숭덕여자고등학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서 + 고난도 부교재(수능만만 / 마더텅 / 올림포스) + 듣기평가 심화 연계
• **배점 구조**: 선택형 65점(21문항) + 서술형 35점(6문항)
• **1등급 컷**: 평균 94~96점선 (서술형 무감점 학생이 최상위권 독점)
• **핵심 킬러**: 5개 이상 복합 조건 영작, 부교재 다의어/숙어 변형
• **빅뱅 맞춤 솔루션**: 숭덕여고 ${displayGrade} 서술형 12패턴 드릴 + 부교재 3회독 압축 워크북 + 1:1 무감점 첨삭`;
    } else if (matchedSchool.includes('문일')) {
      schoolSpecificInsight = `💡 **문일여자고등학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서 + 학평 모의고사 기출 + 외부 심화 지문
• **배점 구조**: 선택형 65점(20문항) + 서술형 35점(5~6문항)
• **1등급 컷**: 평균 92~95점선 (문법 근거 서술 문항이 등급 판가름)
• **핵심 킬러**: 틀린 어법을 고치고 문법적 근거를 서술하는 킬러
• **빅뱅 맞춤 솔루션**: 문일여고 ${displayGrade} 기출 구문 분석서 + SVOC 직독직해 구문 체급 형성`;
    } else if (matchedSchool.includes('만수고')) {
      schoolSpecificInsight = `💡 **만수고등학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서 + 모의고사 기출 변형 + EBS 올림포스
• **배점 구조**: 선택형 70점(22문항) + 서술형 30점(5문항)
• **핵심 킬러**: 요약문 빈칸 품사 변형 영작, 주간 타임어택 실전 모의고사
• **빅뱅 맞춤 솔루션**: 만수고 ${displayGrade} 5개년 기출 변형 족보 및 1:1 클리닉`;
    } else if (matchedSchool.includes('인제')) {
      schoolSpecificInsight = `💡 **인제고등학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서 + 학평 기출 + EBS 수능특강 라이트
• **핵심 킬러**: 지문 변형 후 밑줄 없는 어법 오류 수정 문항
• **빅뱅 맞춤 솔루션**: 인제고 ${displayGrade} 전용 5개년 변형 족보 및 구문 훈련`;
    } else if (matchedSchool.includes('신명')) {
      schoolSpecificInsight = `💡 **신명여자고등학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서 + 고난도 부교재 + 모의고사 변형
• **핵심 킬러**: 필수 제시 단어 어순 배열 및 어형 변화 서술형 영작
• **빅뱅 맞춤 솔루션**: 신명여고 ${displayGrade} 조건 영작 드릴북 및 1:1 대면 첨삭`;
    } else if (matchedSchool.includes('만수북')) {
      schoolSpecificInsight = `💡 **만수북중학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(동아 윤정미) + 단원별 학습지
• **핵심 킬러**: 단원 핵심 어법 서술형 영작 조건 감점 및 영영풀이
• **빅뱅 맞춤 솔루션**: 만수북중 ${displayGrade} 5단계 영작 드릴북 + 영영풀이 족보`;
    } else if (matchedSchool.includes('간석여중')) {
      schoolSpecificInsight = `💡 **간석여자중학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서 + 단원별 학습지
• **핵심 킬러**: 학습지 예문 변형 서술형 영작 시제/수일치 실수 함정
• **빅뱅 맞춤 솔루션**: 간석여중 ${displayGrade} 학습지 100% 변형 워크북`;
    } else if (matchedSchool.includes('정각')) {
      schoolSpecificInsight = `💡 **정각중학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서 + 추가 읽기 자료
• **핵심 킬러**: 복수 정답 어법 고르기 및 조건 영작
• **빅뱅 맞춤 솔루션**: 정각중 ${displayGrade} 기출 유형 워크북 + 파이널 모의고사`;
    } else if (matchedSchool.includes('만수여중')) {
      schoolSpecificInsight = `💡 **만수여중학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서 + 자체 심화 프린트물 (30여 페이지)
• **핵심 킬러**: 어법 어색한 문장 개수 세기 및 영어 선택지
• **빅뱅 맞춤 솔루션**: 만수여중 ${displayGrade} 프린트물 100% 수거 워크북`;
    } else if (matchedSchool.includes('만수중')) {
      schoolSpecificInsight = `💡 **만수중학교 (${displayGrade}) 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서 + 단어/숙어 프린트
• **핵심 킬러**: 모두 고르기 복수 정답 문항 및 지칭 추론
• **빅뱅 맞춤 솔루션**: 만수중 ${displayGrade} 3단계 암기 및 소거법 특훈`;
    } else {
      schoolSpecificInsight = `💡 **${matchedSchool} (${displayGrade}) 맞춤 클리닉 솔루션**:
• 만수동 및 남동구 주요 학교 기출 DB 분석 완료
• 1:1 대면 서술형 무감점 첨삭 클리닉 및 주간 타임어택 실전 테스트 제공`;
    }

    return {
      text: `${schoolSpecificInsight}\n\n말씀해주신 고민은 학생의 성실함 문제가 아니라, **학교별 실제 출제 코드에 맞춘 정확한 공략법과 취약점 진단**이 선행되지 않았기 때문입니다.\n\n이 문제를 확실하게 해결하기 위해, 학원에 방문하셔서 **[무료 1:1 정밀 레벨테스트 및 학습 컨설팅(약 60분)]**을 받아보시는 것을 추천드립니다.\n\n평일 저녁이나 주말 중 편하신 방문 일정이 있으신가요? 바로 예약을 도와드릴 수 있습니다. 📝`,
      stage: 4,
      suggestedReplies: [
        '무료 레벨테스트 예약할게요!',
        '평일 오후 6시 이후 가능한가요?',
        '주말 토요일 상담도 되나요?',
        '레벨테스트 진행방식이 궁금해요'
      ]
    };
  }

  // 7. Default stage 1 greeting/prompt
  return {
    text: `안녕하세요! 인천 만수동 **빅뱅영어학원** AI 상담실장입니다. 😊\n\n만수동 지역 학생들의 내신 1등급과 튼튼한 영어 실력을 위해 학교별 기출 데이터를 기반으로 1:1 맞춤 진단을 도와드리고 있습니다.\n\n하단 메뉴에서 학생의 **재학 중인 학교**를 선택해 주세요:`,
    stage: 1,
    suggestedReplies: []
  };
}
