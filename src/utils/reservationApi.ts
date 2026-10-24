import type { Reservation } from '../types';

type ReservationInput = Omit<Reservation, 'id' | 'createdAt' | 'status'>;
export async function createReservation(input: ReservationInput): Promise<Reservation> {
  let response: Response;
  try {
    response = await fetch('/api/reservations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
    });
  } catch {
    throw new Error('예약 서버에 연결하지 못했습니다. 접수 여부를 학원에 확인한 뒤 다시 시도해 주세요.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.reservation?.id) {
    throw new Error(data?.error || '예약 저장을 확인하지 못했습니다. 학원에 접수 여부를 확인해 주세요.');
  }
  return data.reservation;
}
