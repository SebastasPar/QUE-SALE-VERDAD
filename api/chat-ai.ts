import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { planId, planTitle, planDescription, messages = [], userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: "Falta el mensaje de usuario (userMessage)." });
    }

    if (!ai) {
      // Offline fallback: Use a simple deterministic rule-based generator
      console.log("Gemini API key not found. Triggering mock fallback.");
      return res.json({ replies: getOfflineReplies(planId, userMessage, planTitle, planDescription) });
    }

    const messagesContext = messages
      .slice(-12) // Last 12 messages for decent context limit
      .map((msg: any) => `${msg.senderName} (${msg.senderId === 'system' ? 'Aviso' : msg.senderId}): "${msg.content}"`)
      .join("\n");

    const systemInstruction = `
Eres la simulación inteligente de un chat grupal de coordinación para una actividad en Lima, Perú llamada "${planTitle}".
Descripción de la actividad: "${planDescription}".

Debes simular la conversación respondiendo de manera sumamente natural en español peruano (casual, amigable, usando expresiones limeñas oportunas como "buenazo", "de todas", "habla", "chelas", "pichanga", "gente", etc. de forma sutil y orgánica, no exagerada).

Personajes disponibles del grupo que PUEDEN responder (Elige 1 o 2 personajes que tengan sentido según el contexto del mensaje más reciente, exceptuando al usuario que acaba de escribir):
1. Alejandro Vargas (host-1, organizador, entusiasta de la bici, amable): "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "host-1"
2. Andrea Torres (user_andrea, alegre, proactiva): "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "user_andrea"
3. Mateo Silva (user_mateo, deportista, práctico, buena onda): "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "user_mateo"
4. Luciana Méndez (host-2, organizadora de caminatas fotográficas, detallista): "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "host-2"
5. Valeria Rivas (user_valeria, extrovertida, foodie/cultural, le encanta el café/postre): "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "user_valeria"
6. Carlos Mendoza (user_carlos, fotógrafo amateur, pausado, servicial): "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "user_carlos"
7. Renato Castillo (host-3, organizador de pichangas, directo, animado): "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "host-3"
8. Diego Barreda (user_diego, aficionado al fútbol y deportes, bromista): "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "user_diego"
9. Gonzalo Quispe (user_gonzalo, responsable, solidario, colaborador): "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "user_gonzalo"
10. Camila Torres (host-5, instructora de yoga, calmada, reflexiva, buena onda): "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "host-5"
11. Gabriela Díaz (user_gabriela, amante de la vida sana, relajada, sociable): "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "user_gabriela"
12. Lucía Benavides (user_lucia, detallista, le encanta llevar cosas para compartir): "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150&q=80" -> ID: "user_lucia"

Si la actividad es creada por el usuario (no es una de las 5 actividades por defecto), puedes usar cualquiera de estos personajes de soporte para interactuar de forma amigable (Carlos, Valeria, Diego, Lucía).

Analiza detalladamente toda la conversación histórica recibida, el tono del mensaje más reciente del usuario y genera de una a dos respuestas cortas que encajen fluidamente en la discusión. No contestes de forma aburrida. Haz que se sient como personas reales respondiendo en un chat grupal, a veces coincidiendo, a veces proponiendo algo útil o divertido relacionado directamente con la actividad, clima o lugar de encuentro mencionado en Lima.

Define para cada mensaje:
- senderId: ID del personaje seleccionado.
- senderName: Nombre del personaje seleccionado.
- content: Mensaje natural corto en español (máximo 2 oraciones, de estilo chat).
- senderAvatarUrl: URL de la foto del avatar correspondiente.
- delay: Intervalo de simulación de tipeo en milisegundos (por ejemplo, el primero entre 1000 y 2500, el segundo entre 4000 y 6000 para que aparezcan escalonados).
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
Historial de mensajes previos del grupo de chat:
${messagesContext || "(Aún no hay mensajes previos en este chat)"}

Mensaje enviado por el usuario que acaba de ingresar al chat:
"${userMessage}"

Genera las respuestas inteligentes que sigan este diálogo de forma fluida.
`.trim(),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              senderId: { type: Type.STRING },
              senderName: { type: Type.STRING },
              content: { type: Type.STRING },
              senderAvatarUrl: { type: Type.STRING },
              delay: { type: Type.INTEGER }
            },
            required: ["senderId", "senderName", "content", "delay", "senderAvatarUrl"]
          }
        }
      }
    });

    const textResult = response.text || "[]";
    const parsedResponse = JSON.parse(textResult.trim());
    return res.json({ replies: parsedResponse });
  } catch (err: any) {
    console.error("Error calling Gemini API:", err);
    return res.json({ replies: getOfflineReplies(req.body.planId, req.body.userMessage, req.body.planTitle, req.body.planDescription) });
  }
});

// Offline backup responses
function getOfflineReplies(planId: string, userMessage: string, planTitle: string = '', planDescription: string = '') {
  const norm = userMessage.toLowerCase().trim();
  const title = (planTitle || 'este plan').trim();
  
  // Choose characters
  let char1 = {
    senderId: 'user_mateo',
    senderName: 'Mateo Silva',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&h=150&q=80'
  };
  
  let char2 = {
    senderId: 'user_valeria',
    senderName: 'Valeria Rivas',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80'
  };

  // Give them personality for this plan
  if (planId === '1') {
    char1 = {
      senderId: 'host-1',
      senderName: 'Alejandro Vargas',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80'
    };
    char2 = {
      senderId: 'user_andrea',
      senderName: 'Andrea Torres',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'
    };
  } else if (planId === '2') {
    char1 = {
      senderId: 'host-2',
      senderName: 'Luciana Méndez',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
    };
    char2 = {
      senderId: 'user_carlos',
      senderName: 'Carlos Mendoza',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
    };
  } else if (planId === '3') {
    char1 = {
      senderId: 'host-3',
      senderName: 'Renato Castillo',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80'
    };
    char2 = {
      senderId: 'user_diego',
      senderName: 'Diego Barreda',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
    };
  }

  // Generate extremely clever context responses
  let msg1 = '';
  let msg2 = '';
  
  if (norm.includes('hora') || norm.includes('cuándo') || norm.includes('cuando') || norm.includes('fecha') || norm.includes('dia') || norm.includes('día') || norm.includes('tiempo')) {
    msg1 = `¡Holaaa! En la descripción de "${title}" indica la hora programada, ¿crees que te quede bien o mejor nos retrasamos unos minutos más?`;
    msg2 = `Para mí está perfecto encontrarnos ahí directo, no se preocupen. ¡Vayan coordinando el grupo!`;
  } else if (norm.includes('dónde') || norm.includes('donde') || norm.includes('lugar') || norm.includes('sitio') || norm.includes('dirección') || norm.includes('encuentro') || norm.includes('ubica')) {
    msg1 = `Nos vemos exactamente en el punto que se indica para "${title}". ¡No hay pierde! Igual aviso por aquí apenas llegue.`;
    msg2 = `Buenazo. Yo salgo un ratito antes para separar espacio y les comparto mi ubicación en vivo por el chat.`;
  } else if (norm.includes('llevo') || norm.includes('llevar') || norm.includes('traigo') || norm.includes('traer') || norm.includes('cosa') || norm.includes('mochila') || norm.includes('pelota') || norm.includes('agua') || norm.includes('comida') || norm.includes('bici')) {
    msg1 = `No hace falta llevar muchas cosas, lo básico para "${title}". Pero si quieres llevar eso extra ¡será recontra bienvenido!`;
    msg2 = `¡Excelente idea! Yo llevaré unos piqueos clásicos para el camino, así compartimos entre todos hoy.`;
  } else if (norm.includes('precio') || norm.includes('plata') || norm.includes('costo') || norm.includes('pago') || norm.includes('pagar') || norm.includes('yape') || norm.includes('plin') || norm.includes('gratis') || norm.includes('cuánto') || norm.includes('cuanto')) {
    msg1 = `En verdad el plan para "${title}" es súper económico o libre. Cada uno paga lo suyo o si hay gasto en común dividimos por Yape.`;
    msg2 = `Exacto, tranquilos por el presupuesto que no es nada caro. ¡La idea es pasarla bien juntos!`;
  } else if (norm.includes('hola') || norm.includes('saludos') || norm.includes('buenos') || norm.includes('buenas') || norm.includes('que tal') || norm.includes('qué tal')) {
    msg1 = `¡Hola! Qué buenavibra tenerte para coordinar "${title}". ¿Ya estás listo para la salida?`;
    msg2 = `¡Hola, habla bien! Qué gusto que te sumes al grupo, se va a poner súper divertido hoy de todas maneras.`;
  } else {
    msg1 = `¡Excelente! Me parece espectacular lo que comentas para "${title}". Totalmente apuntado.`;
    msg2 = `Coincido al 100% contigo, gente. Vamos definiendo lo último para vernos en el punto de encuentro.`;
  }

  return [
    {
      ...char1,
      content: msg1,
      delay: 1500
    },
    {
      ...char2,
      content: msg2,
      delay: 4500
    }
  ];
}