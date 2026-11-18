import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getMethodDisplayName(paymentMethod: string): string {
  if (paymentMethod === "card") return "Tarjeta Débito / Crédito (Culqi)";
  if (paymentMethod === "yape") return "Yape (vía Culqi)";
  if (paymentMethod === "plin") return "Plin (vía Culqi)";
  return "Culqi / Credicorp";
}

function buildReceiptHtml(params: {
  receiptNumber: string;
  customerEmail: string;
  totalSoles: number;
  igvSoles: number;
  subtotalSoles: number;
  coinsAcquired: number;
  methodDisplayName: string;
  formattedDate: string;
  reference?: string;
}): string {
  const safeReceipt = escapeHtml(params.receiptNumber);
  const safeEmail = escapeHtml(params.customerEmail);
  const safeMethod = escapeHtml(params.methodDisplayName);
  const safeDate = escapeHtml(params.formattedDate);
  const safeRef = params.reference ? escapeHtml(params.reference) : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Boleta de Venta Electrónica ${safeReceipt}</title>
</head>
<body style="margin:0;padding:0;background-color:#EFEFF1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1E21;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#EFEFF1;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#FFFFFF;border-radius:20px;border:1px solid #DDE1E5;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#008B8B;padding:24px 28px;color:#FFFFFF;">
              <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;opacity:0.9;">
                ¿QUÉ SALE? PERÚ S.A.C. • RUC 20608945123
              </div>
              <h1 style="margin:6px 0 4px;font-size:20px;font-weight:900;line-height:1.25;">
                BOLETA DE VENTA ELECTRÓNICA
              </h1>
              <div style="font-size:13px;opacity:0.95;">
                Serie y Correlativo: <strong style="font-family:monospace;font-size:14px;">${safeReceipt}</strong>
              </div>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding:20px 28px 8px;">
              <div style="background-color:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:12px 16px;font-size:13px;color:#065F46;font-weight:700;">
                ✅ ¡Pago confirmado! Tus <strong>+${params.coinsAcquired} SaleCoins</strong> ya están acreditadas en tu billetera.
              </div>
            </td>
          </tr>

          <!-- Metadata -->
          <tr>
            <td style="padding:16px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.6;">
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Fecha de Emisión:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeDate}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Cliente (Correo):</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeEmail}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Pasarela de Pago:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">Culqi / Credicorp</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Método de Pago:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeMethod}</td>
                </tr>
                ${
                  safeRef
                    ? `<tr>
                  <td style="color:#65676B;padding:4px 0;">Referencia:</td>
                  <td align="right" style="font-family:monospace;font-weight:700;color:#1C1E21;padding:4px 0;">${safeRef}</td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 28px;">
              <div style="border-top:1px dashed #DDE1E5;"></div>
            </td>
          </tr>

          <!-- Concept & Tax Breakdown -->
          <tr>
            <td style="padding:16px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.7;">
                <tr>
                  <td style="font-weight:800;color:#1C1E21;padding-bottom:8px;">Descripción</td>
                  <td align="right" style="font-weight:800;color:#1C1E21;padding-bottom:8px;">Importe</td>
                </tr>
                <tr>
                  <td style="color:#1C1E21;padding:4px 0;">
                    Paquete de <strong>${params.coinsAcquired} SaleCoins</strong> (B2C Wallet)
                  </td>
                  <td align="right" style="font-family:monospace;font-weight:700;color:#1C1E21;padding:4px 0;">
                    S/ ${params.totalSoles.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:10px 0 6px;">
                    <div style="border-top:1px dashed #DDE1E5;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:3px 0;">Op. Gravada (Subtotal 82%):</td>
                  <td align="right" style="font-family:monospace;font-weight:600;color:#1C1E21;padding:3px 0;">
                    S/ ${params.subtotalSoles.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:3px 0;">I.G.V. (18%):</td>
                  <td align="right" style="font-family:monospace;font-weight:600;color:#1C1E21;padding:3px 0;">
                    S/ ${params.igvSoles.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:900;color:#1C1E21;padding-top:8px;">IMPORTE TOTAL:</td>
                  <td align="right" style="font-family:monospace;font-size:16px;font-weight:900;color:#FF5733;padding-top:8px;">
                    S/ ${params.totalSoles.toFixed(2)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8FAFC;padding:16px 28px;border-top:1px solid #DDE1E5;font-size:11px;color:#65676B;text-align:center;line-height:1.5;">
              <div>Representación impresa de la Boleta de Venta Electrónica • SUNAT UBL 2.1</div>
              <div>Procesado y protegido por Culqi / Credicorp • ¿Qué Sale? Perú S.A.C.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildReceiptText(params: {
  receiptNumber: string;
  customerEmail: string;
  totalSoles: number;
  igvSoles: number;
  subtotalSoles: number;
  coinsAcquired: number;
  methodDisplayName: string;
  formattedDate: string;
  reference?: string;
}): string {
  return [
    "====================================================",
    "              ¿QUÉ SALE? PERÚ S.A.C.                ",
    "                 RUC: 20608945123                   ",
    "           BOLETA DE VENTA ELECTRÓNICA              ",
    `                SERIE: ${params.receiptNumber}               `,
    "====================================================",
    `Fecha de Emisión : ${params.formattedDate}`,
    `Cliente (Correo) : ${params.customerEmail}`,
    "Pasarela de Pago : Procesado y protegido por Culqi / Credicorp",
    `Método de Pago   : ${params.methodDisplayName}`,
    ...(params.reference ? [`Referencia       : ${params.reference}`] : []),
    "----------------------------------------------------",
    "DESCRIPCIÓN                                  IMPORTE",
    `Paquete de ${params.coinsAcquired} SaleCoins (B2C Wallet)       S/ ${params.totalSoles.toFixed(2)}`,
    "----------------------------------------------------",
    `OP. GRAVADA (82%)                        S/ ${params.subtotalSoles.toFixed(2)}`,
    `I.G.V. (18%)                             S/ ${params.igvSoles.toFixed(2)}`,
    `IMPORTE TOTAL                            S/ ${params.totalSoles.toFixed(2)}`,
    "====================================================",
    "Representación impresa de la Boleta de Venta Electrónica.",
    "SUNAT UBL 2.1 • ¿Qué Sale? Perú S.A.C.",
  ].join("\n");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const {
      receiptNumber = "B001-0000001",
      customerEmail,
      totalSoles,
      igvSoles,
      subtotalSoles,
      coinsAcquired,
      paymentMethod = "yape",
      issuedAt,
      reference,
    } = req.body || {};

    const cleanEmail = typeof customerEmail === "string" ? customerEmail.trim() : "";
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        error: "Se requiere un correo electrónico válido (customerEmail).",
      });
    }

    const totalNum = Number(totalSoles) || 0;
    const igvNum = Number(igvSoles ?? totalNum * 0.18) || 0;
    const subtotalNum = Number(subtotalSoles ?? totalNum - igvNum) || 0;
    const coinsNum = Number(coinsAcquired) || 0;
    const methodDisplayName = getMethodDisplayName(String(paymentMethod));
    const formattedDate = issuedAt
      ? new Date(issuedAt).toLocaleString("es-PE", { timeZone: "America/Lima" })
      : new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("RESEND_API_KEY no configurada en el servidor; envío simulado para:", cleanEmail);
      return res.status(200).json({
        ok: true,
        mode: "simulated",
        message: "RESEND_API_KEY no configurada en el servidor; envío simulado.",
      });
    }

    const resend = new Resend(apiKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "¿Qué Sale? Perú <onboarding@resend.dev>";

    const templateParams = {
      receiptNumber: String(receiptNumber),
      customerEmail: cleanEmail,
      totalSoles: totalNum,
      igvSoles: igvNum,
      subtotalSoles: subtotalNum,
      coinsAcquired: coinsNum,
      methodDisplayName,
      formattedDate,
      reference: typeof reference === "string" && reference.trim() ? reference.trim() : undefined,
    };

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [cleanEmail],
      subject: `Boleta de Venta Electrónica ${templateParams.receiptNumber} - ¿Qué Sale? Perú`,
      html: buildReceiptHtml(templateParams),
      text: buildReceiptText(templateParams),
    });

    if (error) {
      console.error("Error de Resend al enviar boleta:", error);
      return res.status(200).json({
        ok: false,
        mode: "resend_error",
        error: error.message || "Error al enviar el correo con Resend.",
      });
    }

    return res.status(200).json({
      ok: true,
      mode: "live",
      id: data?.id,
    });
  } catch (err: any) {
    console.error("Error inesperado en /api/send-receipt:", err);
    return res.status(200).json({
      ok: false,
      mode: "resend_error",
      error: err?.message || "Error interno al procesar el envío del comprobante.",
    });
  }
}
