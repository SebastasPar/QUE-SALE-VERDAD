import { Resend } from "resend";
import nodemailer from "nodemailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ReceiptType = "user" | "venue";

interface NormalizedReceiptParams {
  receiptType: ReceiptType;
  receiptNumber: string;
  customerEmail: string;
  customerName: string;
  totalSoles: number;
  igvSoles: number;
  subtotalSoles: number;
  coinsAcquired: number;
  businessName: string;
  ruc: string;
  branchesCount: number;
  planName: string;
  renewsAtFormatted: string;
  address: string;
  methodDisplayName: string;
  formattedDate: string;
  reference?: string;
  paymentDetailsSummary?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getMethodDisplayName(paymentMethod: string): string {
  if (paymentMethod === "card") return "Tarjeta Débito / Crédito";
  if (paymentMethod === "yape") return "Yape";
  if (paymentMethod === "plin") return "Plin";
  return "Pago Digital";
}

function toPdfSafeText(input: string): string {
  // Keep Latin-1 characters supported by WinAnsiEncoding and replace symbols/emojis cleanly
  const replaced = input
    .replace(/[•·]/g, "-")
    .replace(/[→]/g, "->")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
  return replaced.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (!current) {
      current = w;
    } else if (current.length + 1 + w.length <= maxChars) {
      current += ` ${w}`;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export function buildReceiptPdfBuffer(params: NormalizedReceiptParams): Buffer {
  const ops: string[] = [];

  const drawText = (
    text: string,
    x: number,
    y: number,
    options: { font?: "F1" | "F2"; size?: number; color?: [number, number, number] } = {}
  ) => {
    const font = options.font || "F1";
    const size = options.size || 10;
    const [r, g, b] = options.color || [0.11, 0.12, 0.13];
    ops.push(`BT /${font} ${size} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x} ${y} Td (${toPdfSafeText(text)}) Tj ET`);
  };

  const drawRightText = (
    text: string,
    rightX: number,
    y: number,
    options: { font?: "F1" | "F2"; size?: number; color?: [number, number, number] } = {}
  ) => {
    const size = options.size || 10;
    const approxWidth = text.length * size * 0.52;
    drawText(text, Math.max(40, Math.round(rightX - approxWidth)), y, options);
  };

  const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    fill?: [number, number, number],
    stroke?: [number, number, number]
  ) => {
    if (fill) {
      ops.push(`${fill[0].toFixed(3)} ${fill[1].toFixed(3)} ${fill[2].toFixed(3)} rg`);
    }
    if (stroke) {
      ops.push(`${stroke[0].toFixed(3)} ${stroke[1].toFixed(3)} ${stroke[2].toFixed(3)} RG 1 w`);
    }
    const mode = fill && stroke ? "B" : fill ? "f" : "S";
    ops.push(`${x} ${y} ${w} ${h} re ${mode}`);
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = [0.87, 0.88, 0.90]) => {
    ops.push(`${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} RG 0.8 w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  // Page background border
  drawRect(36, 48, 523, 758, [1, 1, 1], [0.87, 0.88, 0.9]);

  // Header Banner (Teal #008B8B)
  drawRect(36, 706, 523, 100, [0, 0.545, 0.545]);
  drawText("¿QUE SALE? PERU S.A.C.", 56, 774, { font: "F2", size: 15, color: [1, 1, 1] });
  drawText("RUC: 20608945123  |  Lima, Peru", 56, 756, { font: "F1", size: 9.5, color: [0.9, 0.98, 0.98] });
  drawText(
    params.receiptType === "venue"
      ? "SUSCRIPCION MENSUAL PARA EMPRESAS (S/ 99.00)"
      : "RECARGA DE BILLETERA ANTI NO-SHOW",
    56,
    724,
    { font: "F2", size: 9, color: [0.95, 1, 1] }
  );

  // Fiscal Box on top-right
  drawRect(362, 720, 178, 72, [1, 1, 1], [0, 0.45, 0.45]);
  drawText("BOLETA ELECTRONICA", 386, 770, { font: "F2", size: 10.5, color: [0.11, 0.12, 0.13] });
  drawText("RUC: 20608945123", 404, 753, { font: "F1", size: 9, color: [0.4, 0.41, 0.42] });
  drawText(`SERIE: ${params.receiptNumber}`, 390, 732, { font: "F2", size: 11, color: [1, 0.341, 0.2] });

  // Status pill
  drawRect(56, 658, 483, 30, [0.925, 0.992, 0.961], [0.655, 0.953, 0.816]);
  drawText(
    params.receiptType === "venue"
      ? `ESTADO: SUSCRIPCION ACTIVA  |  Plan ${params.planName} (${params.branchesCount} ${params.branchesCount === 1 ? "local" : "locales"})`
      : `ESTADO: PAGADO  |  +${params.coinsAcquired} SaleCoins acreditadas en billetera`,
    68,
    669,
    { font: "F2", size: 9.5, color: [0.024, 0.373, 0.275] }
  );

  // Customer / Venue Information Box
  const infoHeight = params.receiptType === "venue" ? 168 : 120;
  const infoTopY = 640;
  const infoBottomY = infoTopY - infoHeight;
  drawRect(56, infoBottomY, 483, infoHeight, [0.973, 0.98, 0.988], [0.87, 0.88, 0.9]);
  drawText(
    params.receiptType === "venue" ? "DATOS DEL CLIENTE (LOCAL ALIADO)" : "DATOS DEL CLIENTE (PERSONA)",
    70,
    infoTopY - 20,
    { font: "F2", size: 9.5, color: [0, 0.545, 0.545] }
  );
  drawLine(70, infoTopY - 27, 525, infoTopY - 27);

  let cursorY = infoTopY - 45;
  const addInfoRow = (label: string, value: string) => {
    drawText(label, 70, cursorY, { font: "F2", size: 9.5, color: [0.39, 0.4, 0.42] });
    drawText(value, 215, cursorY, { font: "F1", size: 9.5, color: [0.11, 0.12, 0.13] });
    cursorY -= 18;
  };

  if (params.receiptType === "venue") {
    addInfoRow("Razon Comercial:", params.businessName);
    addInfoRow("RUC del Local:", params.ruc);
    addInfoRow("Locales Cubiertos:", `${params.branchesCount} ${params.branchesCount === 1 ? "sede registrada" : "sedes registradas"}`);
    addInfoRow("Direccion:", params.address.slice(0, 52));
    addInfoRow("Correo Gmail:", params.customerEmail);
    addInfoRow("Emision / Vigencia:", `${params.formattedDate}  (Renueva: ${params.renewsAtFormatted})`);
  } else {
    addInfoRow("Cliente:", params.customerName || "Usuario ¿Qué Sale?");
    addInfoRow("Correo Gmail:", params.customerEmail);
    addInfoRow("Fecha de Emision:", params.formattedDate);
    addInfoRow("Metodo de Pago:", params.methodDisplayName);
  }

  // Payment metadata strip
  let tableTopY = infoBottomY - 24;
  if (params.receiptType === "venue") {
    const venuePayLine = params.paymentDetailsSummary
      ? `Metodo de pago: ${params.methodDisplayName}  |  ${params.paymentDetailsSummary}`
      : `Metodo de pago: ${params.methodDisplayName}`;
    drawText(venuePayLine, 70, infoBottomY - 14, {
      font: "F1",
      size: 8.5,
      color: [0.39, 0.4, 0.42],
    });
    tableTopY = infoBottomY - 32;
  } else if (params.reference || params.paymentDetailsSummary) {
    const userPayLine = params.reference
      ? `Referencia de operacion: ${params.reference}`
      : `Detalle de pago: ${params.paymentDetailsSummary}`;
    drawText(userPayLine, 70, infoBottomY - 14, {
      font: "F1",
      size: 8.5,
      color: [0.39, 0.4, 0.42],
    });
    tableTopY = infoBottomY - 32;
  }

  // Detail Table Header
  drawRect(56, tableTopY - 26, 483, 26, [0.937, 0.937, 0.945], [0.87, 0.88, 0.9]);
  drawText("CANT.", 68, tableTopY - 17, { font: "F2", size: 9 });
  drawText("DESCRIPCION DEL PRODUCTO / SERVICIO", 125, tableTopY - 17, { font: "F2", size: 9 });
  drawRightText("IMPORTE", 528, tableTopY - 17, { font: "F2", size: 9 });

  // Detail Row
  const itemDesc =
    params.receiptType === "venue"
      ? `Suscripcion Mensual ${params.planName} (${params.branchesCount} ${params.branchesCount === 1 ? "local" : "locales"}) - Publicacion de planes grupales`
      : `Paquete de +${params.coinsAcquired} SaleCoins (Billetera Personal Anti No-Show)`;
  const wrappedDesc = wrapText(itemDesc, 56);
  const rowHeight = Math.max(40, 18 + wrappedDesc.length * 14);
  const rowBottomY = tableTopY - 26 - rowHeight;

  drawRect(56, rowBottomY, 483, rowHeight, [1, 1, 1], [0.87, 0.88, 0.9]);
  drawText(params.receiptType === "venue" ? "1 SERV" : "1 UND", 68, tableTopY - 46, { font: "F1", size: 9.5 });

  let descY = tableTopY - 46;
  for (const line of wrappedDesc) {
    drawText(line, 125, descY, { font: "F1", size: 9.5 });
    descY -= 14;
  }
  drawRightText(`S/ ${params.totalSoles.toFixed(2)}`, 528, tableTopY - 46, { font: "F2", size: 10 });

  // Totals Box
  const totalsTopY = rowBottomY - 18;
  drawRect(310, totalsTopY - 82, 229, 82, [0.973, 0.98, 0.988], [0.87, 0.88, 0.9]);
  drawText("Op. Gravada (82%):", 324, totalsTopY - 22, { font: "F1", size: 9.5, color: [0.39, 0.4, 0.42] });
  drawRightText(`S/ ${params.subtotalSoles.toFixed(2)}`, 528, totalsTopY - 22, { font: "F2", size: 9.5 });

  drawText("I.G.V. (18%):", 324, totalsTopY - 40, { font: "F1", size: 9.5, color: [0.39, 0.4, 0.42] });
  drawRightText(`S/ ${params.igvSoles.toFixed(2)}`, 528, totalsTopY - 40, { font: "F2", size: 9.5 });

  drawLine(322, totalsTopY - 50, 528, totalsTopY - 50);
  drawText("IMPORTE TOTAL:", 324, totalsTopY - 68, { font: "F2", size: 11 });
  drawRightText(`S/ ${params.totalSoles.toFixed(2)}`, 528, totalsTopY - 68, {
    font: "F2",
    size: 12,
    color: [1, 0.341, 0.2],
  });

  // Security & Legal Footer
  drawLine(56, 118, 539, 118);
  drawText("Pago verificado directamente en ¿Que Sale? (no se almacenan datos sensibles de tarjeta).", 56, 98, {
    font: "F1",
    size: 8.5,
    color: [0.39, 0.4, 0.42],
  });
  drawText(
    params.receiptType === "venue"
      ? "Suscripcion mensual comercial: hasta 8 planes/mes, 1 boost de 3h por plan, prioridad 5 km y chat directo."
      : "Comprobante de recarga personal - Representacion impresa emitida por ¿Que Sale? Peru S.A.C.",
    56,
    82,
    { font: "F1", size: 8.5, color: [0.39, 0.4, 0.42] }
  );
  drawText("Soporte: soporte@quesale.pe  |  aliados@quesale.pe  |  https://que-sale-verdad.vercel.app", 56, 66, {
    font: "F1",
    size: 8,
    color: [0, 0.545, 0.545],
  });

  const streamContent = ops.join("\n");
  const streamByteLen = Buffer.byteLength(streamContent, "latin1");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n",
    `6 0 obj\n<< /Length ${streamByteLen} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  const header = "%PDF-1.4\n";
  let offset = Buffer.byteLength(header, "latin1");
  const xrefEntries = ["0000000000 65535 f \n"];

  const bodyParts: string[] = [header];
  for (const obj of objects) {
    xrefEntries.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
    bodyParts.push(obj);
    offset += Buffer.byteLength(obj, "latin1");
  }

  const xrefOffset = offset;
  const xref = `xref\n0 ${objects.length + 1}\n${xrefEntries.join("")}`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(bodyParts.join("") + xref + trailer, "latin1");
}

function buildUserReceiptHtml(params: NormalizedReceiptParams): string {
  const safeReceipt = escapeHtml(params.receiptNumber);
  const safeName = escapeHtml(params.customerName || "Amig@");
  const safeEmail = escapeHtml(params.customerEmail);
  const safeMethod = escapeHtml(params.methodDisplayName);
  const safeDate = escapeHtml(params.formattedDate);
  const safeRef = params.reference ? escapeHtml(params.reference) : "";
  const safePaySummary = params.paymentDetailsSummary ? escapeHtml(params.paymentDetailsSummary) : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Boleta de Venta ${safeReceipt}</title>
</head>
<body style="margin:0;padding:0;background-color:#EFEFF1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1E21;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#EFEFF1;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#FFFFFF;border-radius:20px;border:1px solid #DDE1E5;overflow:hidden;">
          <tr>
            <td style="background-color:#008B8B;padding:24px 28px;color:#FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:10px;">
                <tr>
                  <td style="width:28px;height:28px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.45);background-color:rgba(255,255,255,0.12);text-align:center;vertical-align:middle;font-weight:900;font-style:italic;font-size:13px;color:#FFFFFF;">
                    ¿?
                  </td>
                  <td style="padding-left:8px;font-size:16px;font-weight:900;letter-spacing:-0.3px;color:#FFFFFF;">
                    ¿Qué Sale?
                  </td>
                </tr>
              </table>
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

          <tr>
            <td style="padding:20px 28px 8px;">
              <p style="margin:0 0 12px;font-size:14px;color:#1C1E21;line-height:1.5;">
                ¡Hola, <strong>${safeName}</strong>! Gracias por tu recarga en <strong>¿Qué Sale?</strong>.
              </p>
              <div style="background-color:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:12px 16px;font-size:13px;color:#065F46;font-weight:700;">
                ✅ ¡Pago confirmado! Tus <strong>+${params.coinsAcquired} SaleCoins</strong> ya están acreditadas en tu billetera.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.6;">
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Fecha de Emisión:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeDate}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Correo Gmail:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeEmail}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Método de Pago:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeMethod}</td>
                </tr>
                ${
                  safePaySummary
                    ? `<tr>
                  <td style="color:#65676B;padding:4px 0;">Detalle de Pago:</td>
                  <td align="right" style="font-weight:600;color:#1C1E21;padding:4px 0;">${safePaySummary}</td>
                </tr>`
                    : ""
                }
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

          <tr>
            <td style="padding:0 28px;"><div style="border-top:1px dashed #DDE1E5;"></div></td>
          </tr>

          <tr>
            <td style="padding:16px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.7;">
                <tr>
                  <td style="font-weight:800;color:#1C1E21;padding-bottom:8px;">Descripción</td>
                  <td align="right" style="font-weight:800;color:#1C1E21;padding-bottom:8px;">Importe</td>
                </tr>
                <tr>
                  <td style="color:#1C1E21;padding:4px 0;">
                    Paquete de <strong>+${params.coinsAcquired} SaleCoins</strong> (Billetera Anti No-Show)
                  </td>
                  <td align="right" style="font-family:monospace;font-weight:700;color:#1C1E21;padding:4px 0;">
                    S/ ${params.totalSoles.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:10px 0 6px;"><div style="border-top:1px dashed #DDE1E5;"></div></td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:3px 0;">Op. Gravada (82%):</td>
                  <td align="right" style="font-family:monospace;font-weight:600;color:#1C1E21;padding:3px 0;">S/ ${params.subtotalSoles.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:3px 0;">I.G.V. (18%):</td>
                  <td align="right" style="font-family:monospace;font-weight:600;color:#1C1E21;padding:3px 0;">S/ ${params.igvSoles.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:900;color:#1C1E21;padding-top:8px;">IMPORTE TOTAL:</td>
                  <td align="right" style="font-family:monospace;font-size:16px;font-weight:900;color:#FF5733;padding-top:8px;">S/ ${params.totalSoles.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 28px 24px;text-align:center;">
              <div style="margin-bottom:16px;padding:10px 14px;border-radius:10px;background-color:#F8FAFC;border:1px solid #DDE1E5;font-size:12px;color:#1C1E21;">
                📎 <strong>Adjuntamos tu Boleta en PDF</strong> (<code>Boleta_${safeReceipt}.pdf</code>) en este correo.
              </div>
              <a href="https://que-sale-verdad.vercel.app/feed" style="display:inline-block;background-color:#FF5733;color:#FFFFFF;text-decoration:none;font-weight:800;font-size:13px;padding:12px 24px;border-radius:12px;">
                Explorar Planes en ¿Qué Sale?
              </a>
              <p style="margin:14px 0 0;font-size:12px;color:#65676B;">
                ¿Necesitas ayuda? Escríbenos a <a href="mailto:soporte@quesale.pe?subject=Ayuda%20Boleta%20${safeReceipt}" style="color:#008B8B;font-weight:700;">soporte@quesale.pe</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#F8FAFC;padding:16px 28px;border-top:1px solid #DDE1E5;font-size:11px;color:#65676B;text-align:center;line-height:1.5;">
              <div>Pago verificado de forma segura en ¿Qué Sale? (no almacenamos datos sensibles de tarjeta)</div>
              <div>¿Qué Sale? Perú S.A.C. • Lima, Perú</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildVenueReceiptHtml(params: NormalizedReceiptParams): string {
  const safeReceipt = escapeHtml(params.receiptNumber);
  const safeBusiness = escapeHtml(params.businessName || "Local Aliado");
  const safeRuc = escapeHtml(params.ruc || "20600000001");
  const safeAddress = escapeHtml(params.address || "Lima, Perú");
  const safePlan = escapeHtml(params.planName || "Plan Mensual Empresas");
  const safeEmail = escapeHtml(params.customerEmail);
  const safeMethod = escapeHtml(params.methodDisplayName);
  const safeDate = escapeHtml(params.formattedDate);
  const safeRenew = escapeHtml(params.renewsAtFormatted);
  const safeRef = params.reference ? escapeHtml(params.reference) : "";
  const safePaySummary = params.paymentDetailsSummary ? escapeHtml(params.paymentDetailsSummary) : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Boleta de Suscripción ${safeReceipt}</title>
</head>
<body style="margin:0;padding:0;background-color:#EFEFF1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1E21;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#EFEFF1;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#FFFFFF;border-radius:20px;border:1px solid #DDE1E5;overflow:hidden;">
          <tr>
            <td style="background-color:#008B8B;padding:24px 28px;color:#FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:10px;">
                <tr>
                  <td style="width:28px;height:28px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.45);background-color:rgba(255,255,255,0.12);text-align:center;vertical-align:middle;font-weight:900;font-style:italic;font-size:13px;color:#FFFFFF;">
                    ¿?
                  </td>
                  <td style="padding-left:8px;font-size:16px;font-weight:900;letter-spacing:-0.3px;color:#FFFFFF;">
                    ¿Qué Sale?
                  </td>
                </tr>
              </table>
              <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;opacity:0.9;">
                ¿QUÉ SALE? PERÚ S.A.C. • CUENTA COMERCIAL B2B
              </div>
              <h1 style="margin:6px 0 4px;font-size:20px;font-weight:900;line-height:1.25;">
                BOLETA DE SUSCRIPCIÓN MENSUAL
              </h1>
              <div style="font-size:13px;opacity:0.95;">
                Serie y Correlativo: <strong style="font-family:monospace;font-size:14px;">${safeReceipt}</strong>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px 8px;">
              <p style="margin:0 0 12px;font-size:14px;color:#1C1E21;line-height:1.5;">
                ¡Hola, equipo de <strong>${safeBusiness}</strong>! Confirmamos el pago de tu suscripción mensual en <strong>¿Qué Sale?</strong>.
              </p>
              <div style="background-color:#F0FDFA;border:1px solid #99F6E4;border-radius:12px;padding:12px 16px;font-size:13px;color:#115E59;font-weight:700;">
                🏢 <strong>Suscripción Mensual Activa:</strong> Suscripción mensual comercial: hasta 8 planes/mes, 1 boost de 3h por plan, prioridad 5 km y chat directo.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.6;">
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Razón Comercial:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeBusiness}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">RUC del Negocio:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeRuc}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Locales Cubiertos:</td>
                  <td align="right" style="font-weight:700;color:#008B8B;padding:4px 0;">${params.branchesCount} ${params.branchesCount === 1 ? "sede" : "sedes"}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Dirección Principal:</td>
                  <td align="right" style="font-weight:600;color:#1C1E21;padding:4px 0;">${safeAddress}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Correo Gmail:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeEmail}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Fecha de Emisión:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeDate}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Próxima Renovación:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeRenew}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:4px 0;">Método de Pago:</td>
                  <td align="right" style="font-weight:700;color:#1C1E21;padding:4px 0;">${safeMethod}</td>
                </tr>
                ${
                  safePaySummary
                    ? `<tr>
                  <td style="color:#65676B;padding:4px 0;">Detalle de Pago:</td>
                  <td align="right" style="font-weight:600;color:#1C1E21;padding:4px 0;">${safePaySummary}</td>
                </tr>`
                    : ""
                }
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

          <tr>
            <td style="padding:0 28px;"><div style="border-top:1px dashed #DDE1E5;"></div></td>
          </tr>

          <tr>
            <td style="padding:16px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.7;">
                <tr>
                  <td style="font-weight:800;color:#1C1E21;padding-bottom:8px;">Concepto B2B</td>
                  <td align="right" style="font-weight:800;color:#1C1E21;padding-bottom:8px;">Importe</td>
                </tr>
                <tr>
                  <td style="color:#1C1E21;padding:4px 0;">
                    Suscripción Mensual <strong>${safePlan}</strong> (${params.branchesCount} ${params.branchesCount === 1 ? "local" : "locales"})
                  </td>
                  <td align="right" style="font-family:monospace;font-weight:700;color:#1C1E21;padding:4px 0;">
                    S/ ${params.totalSoles.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:10px 0 6px;"><div style="border-top:1px dashed #DDE1E5;"></div></td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:3px 0;">Op. Gravada (82%):</td>
                  <td align="right" style="font-family:monospace;font-weight:600;color:#1C1E21;padding:3px 0;">S/ ${params.subtotalSoles.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="color:#65676B;padding:3px 0;">I.G.V. (18%):</td>
                  <td align="right" style="font-family:monospace;font-weight:600;color:#1C1E21;padding:3px 0;">S/ ${params.igvSoles.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:900;color:#1C1E21;padding-top:8px;">IMPORTE TOTAL:</td>
                  <td align="right" style="font-family:monospace;font-size:16px;font-weight:900;color:#FF5733;padding-top:8px;">S/ ${params.totalSoles.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 28px 24px;text-align:center;">
              <div style="margin-bottom:16px;padding:10px 14px;border-radius:10px;background-color:#F8FAFC;border:1px solid #DDE1E5;font-size:12px;color:#1C1E21;">
                📎 <strong>Adjuntamos tu Boleta Comercial en PDF</strong> (<code>Boleta_${safeReceipt}.pdf</code>).
              </div>
              <a href="https://que-sale-verdad.vercel.app/venue/dashboard" style="display:inline-block;background-color:#008B8B;color:#FFFFFF;text-decoration:none;font-weight:800;font-size:13px;padding:12px 24px;border-radius:12px;">
                Ir al Panel de mi Local
              </a>
              <p style="margin:14px 0 0;font-size:12px;color:#65676B;">
                Soporte Comercial B2B: <a href="mailto:aliados@quesale.pe?subject=Soporte%20Local%20${safeReceipt}" style="color:#008B8B;font-weight:700;">aliados@quesale.pe</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#F8FAFC;padding:16px 28px;border-top:1px solid #DDE1E5;font-size:11px;color:#65676B;text-align:center;line-height:1.5;">
              <div>Suscripción mensual comercial: hasta 8 planes/mes, 1 boost de 3h por plan, prioridad 5 km y chat directo.</div>
              <div>¿Qué Sale? Perú S.A.C. (RUC 20608945123) • Lima, Perú</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildReceiptText(params: NormalizedReceiptParams): string {
  if (params.receiptType === "venue") {
    return [
      "====================================================",
      "              ¿QUÉ SALE? PERÚ S.A.C.                ",
      "                 RUC: 20608945123                   ",
      "        BOLETA DE SUSCRIPCIÓN MENSUAL B2B           ",
      `                SERIE: ${params.receiptNumber}               `,
      "====================================================",
      `Fecha de Emisión   : ${params.formattedDate}`,
      `Próxima Renovación : ${params.renewsAtFormatted}`,
      `Razón Comercial    : ${params.businessName}`,
      `RUC del Local      : ${params.ruc}`,
      `Locales Cubiertos  : ${params.branchesCount} sedes`,
      `Correo Gmail       : ${params.customerEmail}`,
      `Método de Pago     : ${params.methodDisplayName}`,
      ...(params.paymentDetailsSummary ? [`Detalle de Pago    : ${params.paymentDetailsSummary}`] : []),
      ...(params.reference ? [`Referencia         : ${params.reference}`] : []),
      "----------------------------------------------------",
      `Suscripción Mensual ${params.planName} (${params.branchesCount} locales)  S/ ${params.totalSoles.toFixed(2)}`,
      "----------------------------------------------------",
      `OP. GRAVADA (82%)                        S/ ${params.subtotalSoles.toFixed(2)}`,
      `I.G.V. (18%)                             S/ ${params.igvSoles.toFixed(2)}`,
      `IMPORTE TOTAL                            S/ ${params.totalSoles.toFixed(2)}`,
      "====================================================",
      "Adjunto en PDF: Boleta_" + params.receiptNumber + ".pdf",
      "Suscripción mensual comercial: hasta 8 planes/mes, 1 boost de 3h por plan, prioridad 5 km y chat directo.",
    ].join("\n");
  }

  return [
    "====================================================",
    "              ¿QUÉ SALE? PERÚ S.A.C.                ",
    "                 RUC: 20608945123                   ",
    "           BOLETA DE VENTA ELECTRÓNICA              ",
    `                SERIE: ${params.receiptNumber}               `,
    "====================================================",
    `Fecha de Emisión : ${params.formattedDate}`,
    `Cliente          : ${params.customerName || params.customerEmail}`,
    `Correo Gmail     : ${params.customerEmail}`,
    "Plataforma       : Pago verificado directamente en ¿Qué Sale?",
    `Método de Pago   : ${params.methodDisplayName}`,
    ...(params.reference ? [`Referencia       : ${params.reference}`] : []),
    "----------------------------------------------------",
    "DESCRIPCIÓN                                  IMPORTE",
    `Paquete de +${params.coinsAcquired} SaleCoins (Billetera)     S/ ${params.totalSoles.toFixed(2)}`,
    "----------------------------------------------------",
    `OP. GRAVADA (82%)                        S/ ${params.subtotalSoles.toFixed(2)}`,
    `I.G.V. (18%)                             S/ ${params.igvSoles.toFixed(2)}`,
    `IMPORTE TOTAL                            S/ ${params.totalSoles.toFixed(2)}`,
    "====================================================",
    "Adjunto en PDF: Boleta_" + params.receiptNumber + ".pdf",
    "¿Qué Sale? Perú S.A.C.",
  ].join("\n");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const {
      receiptType = "user",
      receiptNumber = "B001-0000001",
      customerEmail,
      customerName = "",
      totalSoles,
      igvSoles,
      subtotalSoles,
      coinsAcquired = 0,
      businessName = "",
      ruc = "",
      branchesCount = 1,
      planName = "Plan Mensual Empresas",
      renewsAt,
      address = "Lima, Perú",
      paymentMethod = "yape",
      issuedAt,
      reference,
      paymentDetailsSummary,
    } = req.body || {};

    const cleanEmail = typeof customerEmail === "string" ? customerEmail.trim() : "";
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        error: "Se requiere un correo Gmail / electrónico válido (customerEmail).",
      });
    }

    const finalType: ReceiptType = receiptType === "venue" ? "venue" : "user";
    const totalNum = finalType === "venue" ? (Number(totalSoles) || 99) : (Number(totalSoles) || 0);
    const igvNum = Number(igvSoles ?? totalNum * 0.18) || 0;
    const subtotalNum = Number(subtotalSoles ?? totalNum - igvNum) || 0;
    const coinsNum = finalType === "venue" ? 0 : Number(coinsAcquired) || 0;
    const methodDisplayName = getMethodDisplayName(String(paymentMethod));
    const issuedDateObj = issuedAt ? new Date(issuedAt) : new Date();
    const formattedDate = issuedDateObj.toLocaleString("es-PE", { timeZone: "America/Lima" });
    const renewDateObj = renewsAt
      ? new Date(renewsAt)
      : new Date(issuedDateObj.getTime() + 30 * 24 * 60 * 60 * 1000);
    const renewsAtFormatted = renewDateObj.toLocaleDateString("es-PE", { timeZone: "America/Lima" });

    const templateParams: NormalizedReceiptParams = {
      receiptType: finalType,
      receiptNumber: String(receiptNumber),
      customerEmail: cleanEmail,
      customerName: typeof customerName === "string" ? customerName.trim() : "",
      totalSoles: Number(totalNum.toFixed(2)),
      igvSoles: Number(igvNum.toFixed(2)),
      subtotalSoles: Number(subtotalNum.toFixed(2)),
      coinsAcquired: coinsNum,
      businessName: typeof businessName === "string" && businessName.trim() ? businessName.trim() : "Local Aliado",
      ruc: typeof ruc === "string" && ruc.trim() ? ruc.trim() : "20600000001",
      branchesCount: Math.max(1, Number(branchesCount) || 1),
      planName: typeof planName === "string" && planName.trim() ? planName.trim() : "Plan Mensual Empresas",
      renewsAtFormatted,
      address: typeof address === "string" && address.trim() ? address.trim() : "Lima, Perú",
      methodDisplayName,
      formattedDate,
      reference: typeof reference === "string" && reference.trim() ? reference.trim() : undefined,
      paymentDetailsSummary:
        typeof paymentDetailsSummary === "string" && paymentDetailsSummary.trim()
          ? paymentDetailsSummary.trim()
          : undefined,
    };

    const pdfBuffer = buildReceiptPdfBuffer(templateParams);
    const pdfBase64 = pdfBuffer.toString("base64");
    const filename = `Boleta_${templateParams.receiptNumber}.pdf`;

    const subject =
      finalType === "venue"
        ? `Boleta de Suscripción ${templateParams.receiptNumber} (${templateParams.businessName}) - ¿Qué Sale?`
        : `Boleta de Venta ${templateParams.receiptNumber} (+${templateParams.coinsAcquired} SaleCoins) - ¿Qué Sale?`;

    const html =
      finalType === "venue"
        ? buildVenueReceiptHtml(templateParams)
        : buildUserReceiptHtml(templateParams);

    const textBody = buildReceiptText(templateParams);

    // Prioridad 1: Gmail SMTP (Gratis para enviar a cualquier correo sin dominio propio)
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        const info = await transporter.sendMail({
          from: `"¿Qué Sale? Perú" <${gmailUser}>`,
          to: cleanEmail,
          subject,
          html,
          text: textBody,
          attachments: [
            {
              filename,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });

        return res.status(200).json({
          ok: true,
          mode: "live",
          provider: "gmail_smtp",
          id: info.messageId,
          filename,
          pdfBase64,
        });
      } catch (gmailErr: any) {
        console.error("Error enviando por Gmail SMTP:", gmailErr);
        return res.status(200).json({
          ok: false,
          mode: "resend_error",
          provider: "gmail_smtp",
          filename,
          pdfBase64,
          error: gmailErr?.message || "Error al enviar el correo con Gmail SMTP.",
        });
      }
    }

    // Prioridad 2: Resend (Respaldo si está configurado y no se configuró Gmail SMTP)
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("Sin GMAIL_USER/GMAIL_APP_PASSWORD ni RESEND_API_KEY; envío simulado para:", cleanEmail);
      return res.status(200).json({
        ok: true,
        mode: "simulated",
        filename,
        pdfBase64,
        message: "Configura GMAIL_USER y GMAIL_APP_PASSWORD en Vercel para envío real a cualquier correo.",
      });
    }

    const resend = new Resend(apiKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "¿Qué Sale? Perú <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [cleanEmail],
      subject,
      html,
      text: textBody,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Error de Resend al enviar boleta PDF:", error);
      return res.status(200).json({
        ok: false,
        mode: "resend_error",
        provider: "resend",
        filename,
        pdfBase64,
        error: error.message || "Error al enviar el correo con Resend.",
      });
    }

    return res.status(200).json({
      ok: true,
      mode: "live",
      provider: "resend",
      id: data?.id,
      filename,
      pdfBase64,
    });
  } catch (err: any) {
    console.error("Error inesperado en /api/send-receipt:", err);
    return res.status(200).json({
      ok: false,
      mode: "resend_error",
      error: err?.message || "Error interno al procesar el envío del comprobante PDF.",
    });
  }
}
