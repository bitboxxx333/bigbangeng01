export const DEFAULT_DIRECTOR_EMAIL = 'jsflying1001@gmail.com';
export type EmailSettings = { recipientEmail: string; enabled: boolean; configured?: boolean; web3FormsKey?: string };

async function adminEmailRequest(path: string, pin: string, method = 'GET', body?: unknown) {
  const response = await fetch(path, {
    method, headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) throw new Error(result?.error || result?.message || '이메일 설정 서버에 연결하지 못했습니다.');
  return result;
}

export const getEmailSettings = (pin: string): Promise<EmailSettings> => adminEmailRequest('/api/admin/email-settings', pin);
export const saveEmailSettings = (settings: EmailSettings, pin: string): Promise<{success: boolean; configured: boolean}> => adminEmailRequest('/api/admin/email-settings', pin, 'PATCH', settings);
export const sendTestEmail = (pin: string): Promise<{success: boolean; message: string}> => adminEmailRequest('/api/admin/test-email', pin, 'POST', {});
