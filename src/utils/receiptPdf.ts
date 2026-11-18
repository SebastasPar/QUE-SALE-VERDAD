export interface SendReceiptPayload {
  receiptType: 'user' | 'venue';
  receiptNumber: string;
  customerEmail: string;
  customerName?: string;
  totalSoles: number;
  igvSoles?: number;
  subtotalSoles?: number;
  coinsAcquired?: number;
  businessName?: string;
  ruc?: string;
  branchesCount?: number;
  planName?: string;
  renewsAt?: string;
  address?: string;
  paymentMethod: 'yape' | 'plin' | 'card';
  issuedAt: string;
  reference?: string;
}

export interface SendReceiptResponse {
  mode: 'live' | 'simulated' | 'resend_error';
  ok: boolean;
  filename?: string;
  pdfBase64?: string;
  error?: string;
}

const pdfCache = new Map<string, string>();

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toLatin1Bytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes[i] = code <= 255 ? code : 63; // '?' fallback outside latin-1
  }
  return bytes;
}

function sanitizePdfText(input: string): string {
  return input
    .replace(/[•·]/g, '-')
    .replace(/[→]/g, '->')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildClientFallbackPdfBytes(payload: SendReceiptPayload): Uint8Array {
  const total = Number(payload.totalSoles || 0);
  const igv = Number((payload.igvSoles ?? total * 0.18).toFixed(2));
  const subtotal = Number((payload.subtotalSoles ?? total - igv).toFixed(2));
  const issuedDate = new Date(payload.issuedAt || Date.now()).toLocaleString('es-PE');

  const ops: string[] = [];
  const text = (txt: string, x: number, y: number, bold = false, size = 10, color = '0.11 0.12 0.13') => {
    ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color} rg ${x} ${y} Td (${sanitizePdfText(txt)}) Tj ET`);
  };

  ops.push('0 0.545 0.545 rg 36 710 523 96 re f');
  text('¿QUE SALE? PERU S.A.C.  |  RUC: 20608945123', 54, 774, true, 13, '1 1 1');
  text(`BOLETA ELECTRONICA  -  SERIE: ${payload.receiptNumber}`, 54, 750, true, 12, '1 1 1');
  text(
    payload.receiptType === 'venue'
      ? 'SUSCRIPCION MENSUAL B2B (SIN MONEDAS)'
      : 'RECARGA DE BILLETERA ANTI NO-SHOW',
    54,
    728,
    true,
    9.5,
    '0.92 1 1'
  );

  let y = 675;
  if (payload.receiptType === 'venue') {
    text(`Razon Comercial: ${payload.businessName || 'Local Aliado'}`, 54, y, true, 10);
    y -= 18;
    text(`RUC del Local: ${payload.ruc || '20600000001'}   |   Locales cubiertos: ${payload.branchesCount || 1}`, 54, y, false, 10);
    y -= 18;
    text(`Correo Gmail: ${payload.customerEmail}`, 54, y, false, 10);
    y -= 18;
    text(`Fecha Emision: ${issuedDate}`, 54, y, false, 10);
    y -= 28;
    text(`Concepto: Suscripcion Mensual ${payload.planName || 'Plan Sede Unica'} (${payload.branchesCount || 1} sedes)`, 54, y, true, 10);
  } else {
    text(`Cliente: ${payload.customerName || payload.customerEmail}`, 54, y, true, 10);
    y -= 18;
    text(`Correo Gmail: ${payload.customerEmail}`, 54, y, false, 10);
    y -= 18;
    text(`Fecha Emision: ${issuedDate}`, 54, y, false, 10);
    y -= 28;
    text(`Concepto: Paquete de +${payload.coinsAcquired || 0} SaleCoins (Billetera Anti No-Show)`, 54, y, true, 10);
  }

  y -= 24;
  text(`Metodo de pago: ${payload.paymentMethod.toUpperCase()} (Culqi / Credicorp)`, 54, y, false, 10);
  y -= 26;
  text(`Op. Gravada (82%): S/ ${subtotal.toFixed(2)}`, 54, y, false, 10);
  y -= 18;
  text(`I.G.V. (18%): S/ ${igv.toFixed(2)}`, 54, y, false, 10);
  y -= 22;
  text(`IMPORTE TOTAL: S/ ${total.toFixed(2)}`, 54, y, true, 12, '1 0.341 0.2');

  const streamContent = ops.join('\n');
  const streamLen = toLatin1Bytes(streamContent).length;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  const header = '%PDF-1.4\n';
  let offset = toLatin1Bytes(header).length;
  const xrefEntries = ['0000000000 65535 f \n'];
  const parts: string[] = [header];
  for (const obj of objects) {
    xrefEntries.push(`${String(offset).padStart(10, '0')} 00000 n \n`);
    parts.push(obj);
    offset += toLatin1Bytes(obj).length;
  }

  const xref = `xref\n0 ${objects.length + 1}\n${xrefEntries.join('')}`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
  return toLatin1Bytes(parts.join('') + xref + trailer);
}

export async function sendReceiptEmailWithPdf(
  payload: SendReceiptPayload
): Promise<SendReceiptResponse> {
  try {
    const response = await fetch('/api/send-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data?.pdfBase64) {
      pdfCache.set(payload.receiptNumber, data.pdfBase64);
    }

    if (!response.ok) {
      return {
        ok: false,
        mode: 'resend_error',
        error: data?.error || 'No se pudo enviar la boleta al correo.',
      };
    }

    if (data.mode === 'live' && data.ok) {
      return {
        ok: true,
        mode: 'live',
        filename: data.filename,
        pdfBase64: data.pdfBase64,
      };
    }

    if (data.mode === 'simulated') {
      return {
        ok: true,
        mode: 'simulated',
        filename: data.filename,
        pdfBase64: data.pdfBase64,
      };
    }

    return {
      ok: false,
      mode: 'resend_error',
      filename: data?.filename,
      pdfBase64: data?.pdfBase64,
      error: data?.error || 'Error al despachar el correo con Resend.',
    };
  } catch (err: any) {
    return {
      ok: false,
      mode: 'resend_error',
      error: err?.message || 'Error de conexión al intentar enviar el comprobante.',
    };
  }
}

export function downloadReceiptPdf(payload: SendReceiptPayload, explicitBase64?: string) {
  const cached = explicitBase64 || pdfCache.get(payload.receiptNumber);
  const bytes = cached ? base64ToUint8Array(cached) : buildClientFallbackPdfBytes(payload);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Boleta_${payload.receiptNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
