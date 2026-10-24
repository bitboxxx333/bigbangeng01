import type { Reservation } from '../src/types';

export const DEFAULT_DIRECTOR_EMAIL = 'jsflying1001@gmail.com';
export type EmailSettings = { recipientEmail: string; web3FormsKey: string; enabled: boolean };
export const defaultEmailSettings: EmailSettings = { recipientEmail: DEFAULT_DIRECTOR_EMAIL, web3FormsKey: '', enabled: true };
export type EmailDelivery = { status: 'accepted' | 'failed' | 'not_configured' | 'disabled'; message: string };

// Web3Forms delivers to the verified address associated with its access key.
// recipientEmail documents that address; it cannot override the provider's recipient.
export async function sendReservationEmail(reservation: Reservation, settings: EmailSettings): Promise<EmailDelivery> {
  if (!settings.enabled) return { status: 'disabled', message: '이메일 알림이 꺼져 있습니다.' };
  if (!settings.web3FormsKey) return { status: 'not_configured', message: '수신 이메일로 발급받은 Web3Forms Access Key를 저장해 주세요.' };
  const message = [
    `예약번호: ${reservation.id}`, `학생명: ${reservation.studentName}`,
    `학부모 연락처: ${reservation.parentPhone}`, `학교/학년: ${reservation.school} ${reservation.grade}`,
    `상담 희망일시: ${reservation.preferredDate} ${reservation.preferredTime}`,
    `주요 고민: ${reservation.concerns.join(', ')}`, `메모: ${reservation.notes || '-'}`,
  ].join('\n');
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ access_key: settings.web3FormsKey, from_name: '빅뱅영어학원 상담접수', subject: '[빅뱅영어학원] 신규 상담 예약 접수', message }),
    });
    const result = await response.json();
    if (response.ok && result.success === true) {
      return { status: 'accepted', message: '메일 발송 서비스가 요청을 접수했습니다. 실제 수신 여부는 수신함에서 확인해 주세요.' };
    }
  } catch { /* Provider/network failures must not undo a saved reservation. */ }
  return { status: 'failed', message: '예약은 저장됐지만 이메일 발송 요청이 실패했습니다. Access Key와 발송 서비스 상태를 확인해 주세요.' };
}
