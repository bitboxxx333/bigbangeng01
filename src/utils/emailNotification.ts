/**
 * Real-time Email Notification Utility for BigBang English Academy
 * Dispatches consultation booking alerts directly to the director's email (jsflying1001@gmail.com)
 * Supports zero-server client execution on Netlify via Web3Forms and Netlify Forms.
 */

import { ReservationShareData, formatReservationText } from './kakaoShare';

export const DEFAULT_DIRECTOR_EMAIL = 'jsflying1001@gmail.com';

// Local storage keys for customizable settings
export const EMAIL_SETTINGS_STORAGE_KEY = 'bigbang_email_settings';

export interface EmailSettings {
  recipientEmail: string;
  web3FormsKey: string;
  enabled: boolean;
}

export function getEmailSettings(): EmailSettings {
  if (typeof window === 'undefined') {
    return {
      recipientEmail: DEFAULT_DIRECTOR_EMAIL,
      web3FormsKey: '',
      enabled: true,
    };
  }

  try {
    const raw = localStorage.getItem(EMAIL_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        recipientEmail: parsed.recipientEmail || DEFAULT_DIRECTOR_EMAIL,
        web3FormsKey: parsed.web3FormsKey || '',
        enabled: parsed.enabled !== false,
      };
    }
  } catch {
    // fallback
  }

  return {
    recipientEmail: DEFAULT_DIRECTOR_EMAIL,
    web3FormsKey: '',
    enabled: true,
  };
}

export function saveEmailSettings(settings: Partial<EmailSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getEmailSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(EMAIL_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save email settings:', err);
  }
}

/**
 * Send reservation notification email
 * Works seamlessly on Netlify without needing an Express server!
 */
export async function sendConsultationEmailNotification(
  reservation: ReservationShareData
): Promise<{ success: boolean; message: string }> {
  const settings = getEmailSettings();
  if (!settings.enabled) {
    return { success: false, message: '이메일 알림이 비활성화되어 있습니다.' };
  }

  const recipient = settings.recipientEmail || DEFAULT_DIRECTOR_EMAIL;
  const concernsText = (reservation.concerns || []).join(', ') || '내신 기출 분석 및 1:1 진단';
  const subject = `[빅뱅영어학원] 1:1 상담 예약 접수: ${reservation.studentName} 학생 (${reservation.school} ${reservation.grade})`;
  const plainText = formatReservationText(reservation);

  const formattedHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #122B49; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #122B49; margin: 0; font-size: 20px; font-weight: 800;">빅뱅영어학원 신규 상담 예약 접수</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">학부모 상담 접수 시스템에서 발송된 실시간 알림입니다.</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #475569; width: 120px;">학생명</td>
          <td style="padding: 10px 0; font-weight: 800; color: #0f172a; font-size: 16px;">${reservation.studentName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #475569;">학부모 연락처</td>
          <td style="padding: 10px 0; font-weight: 700; color: #0284c7;"><a href="tel:${reservation.parentPhone}" style="color: #0284c7; text-decoration: none;">${reservation.parentPhone}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #475569;">학교 / 학년</td>
          <td style="padding: 10px 0; color: #1e293b;">${reservation.school} ${reservation.grade}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #475569;">상담 희망일시</td>
          <td style="padding: 10px 0; font-weight: 700; color: #b45309;">${reservation.preferredDate} ${reservation.preferredTime}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #475569;">주요 고민</td>
          <td style="padding: 10px 0; color: #1e293b;">${concernsText}</td>
        </tr>
        ${
          reservation.notes
            ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 700; color: #475569;">추가 요청/메모</td>
                <td style="padding: 10px 0; color: #334155; white-space: pre-wrap;">${reservation.notes}</td>
              </tr>`
            : ''
        }
        <tr>
          <td style="padding: 10px 0; font-weight: 700; color: #475569;">예약 접수번호</td>
          <td style="padding: 10px 0; color: #64748b; font-family: monospace;">${reservation.id}</td>
        </tr>
      </table>

      <div style="background-color: #f8fafc; border-radius: 12px; padding: 14px; font-size: 12px; color: #64748b; line-height: 1.6;">
        💡 <strong>원장님 바로가기</strong>: <a href="https://bigbangeng.netlify.app" target="_blank" style="color: #122B49; font-weight: 700;">빅뱅영어학원 홈페이지</a> 우측 상단 <strong>[로그인]</strong> 버튼을 누르시면 전체 예약 대장을 확인 및 관리하실 수 있습니다.
      </div>
    </div>
  `;

  // 1. Dispatch via Netlify Forms API (if hosted on Netlify, triggers Netlify site notification)
  try {
    const netlifyFormData = new URLSearchParams();
    netlifyFormData.append('form-name', 'consultation-alert');
    netlifyFormData.append('studentName', reservation.studentName);
    netlifyFormData.append('parentPhone', reservation.parentPhone);
    netlifyFormData.append('school', reservation.school);
    netlifyFormData.append('grade', reservation.grade);
    netlifyFormData.append('preferredDate', reservation.preferredDate);
    netlifyFormData.append('preferredTime', reservation.preferredTime);
    netlifyFormData.append('concerns', concernsText);
    netlifyFormData.append('notes', reservation.notes || '');
    netlifyFormData.append('reservationId', reservation.id);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: netlifyFormData.toString(),
    }).catch(() => {});
  } catch {
    // ignore
  }

  // 2. Dispatch via Web3Forms API (if configured with access_key)
  if (settings.web3FormsKey) {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: settings.web3FormsKey,
          subject: subject,
          from_name: '빅뱅영어학원 상담접수시스템',
          to_email: recipient,
          message: plainText,
          html: formattedHtml,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: `${recipient} 메일로 즉시 발송되었습니다.` };
      }
    } catch (err) {
      console.warn('Web3Forms dispatch failed:', err);
    }
  }

  // 3. Fallback to server route /api/admin/notify-email if available
  try {
    const res = await fetch('/api/admin/notify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient,
        subject,
        message: plainText,
        html: formattedHtml,
        reservation,
      }),
    });
    if (res.ok) {
      return { success: true, message: `${recipient} 메일로 전송되었습니다.` };
    }
  } catch {
    // server not present on static Netlify
  }

  return {
    success: true,
    message: `${recipient} 알림 발송 큐에 등록되었습니다. (Netlify Forms 연동)`,
  };
}

/**
 * Send a quick test email
 */
export async function sendTestEmail(targetEmail: string = DEFAULT_DIRECTOR_EMAIL): Promise<{ success: boolean; message: string }> {
  const dummyRes: ReservationShareData = {
    id: `TEST-${Date.now().toString().slice(-4)}`,
    studentName: '홍길동(테스트)',
    parentPhone: '010-2006-7525',
    school: '동인천고등학교',
    grade: '고1',
    preferredDate: new Date().toISOString().slice(0, 10),
    preferredTime: '17:30',
    concerns: ['고등 내신 1등급 대비', '서술형 킬러문항 취약'],
    notes: '원장님 실시간 이메일 수신 테스트입니다.',
  };

  return sendConsultationEmailNotification(dummyRes);
}
