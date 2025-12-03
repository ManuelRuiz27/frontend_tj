const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.MOCK_NEW_LOGIN_PORT ?? 4100);

const identityResponse = {
  nombre: 'MARIA GUADALUPE',
  apellido_paterno: 'SANCHEZ',
  apellido_materno: 'PEREZ',
  curp: 'SAPM900101MBCNRR06',
  discapacidad: false,
  id_ine: '0000000000123',
  municipio: 'Tijuana',
  seccional: '0456',
  calle: 'Av. Siempre Viva',
  numero_ext: '742',
  numero_int: '3B',
  colonia: 'Centro',
};

const submissions = [];

const setCorsHeaders = (req, baseHeaders = {}) => {
  const origin = req.headers.origin;
  if (!origin) {
    return {
      ...baseHeaders,
      'Access-Control-Allow-Origin': '*',
    };
  }

  return {
    ...baseHeaders,
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
};

const sendJson = (req, res, status, payload) => {
  res.writeHead(
    status,
    setCorsHeaders(req, {
      'Content-Type': 'application/json',
    }),
  );
  res.end(JSON.stringify(payload));
};

const handleOptions = (req, res) => {
  res.writeHead(
    204,
    setCorsHeaders(req, {
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }),
  );
  res.end();
};

const collectRequestBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/mock-ine') {
    // Solo consumimos el cuerpo para liberar el socket; no es necesario parsear el multipart.
    try {
      await collectRequestBody(req);
    } catch {
      sendJson(req, res, 500, { message: 'Error al leer los archivos de prueba.' });
      return;
    }

    sendJson(req, res, 200, identityResponse);
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/v1/cardholders') {
    let parsed = null;

    try {
      const body = await collectRequestBody(req);
      const text = body.toString('utf8').trim();
      parsed = text ? JSON.parse(text) : {};
    } catch {
      sendJson(req, res, 400, { message: 'Payload JSON no válido.' });
      return;
    }

    submissions.push({
      receivedAt: new Date().toISOString(),
      ...parsed,
    });

    sendJson(req, res, 201, {
      message: 'Registro simulado almacenado correctamente.',
      totalSubmissions: submissions.length,
    });
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/v1/cardholders') {
    sendJson(req, res, 200, submissions);
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/health') {
    sendJson(req, res, 200, { status: 'ok', submissions: submissions.length });
    return;
  }

  sendJson(req, res, 404, { message: 'Ruta no encontrada en el mock.' });
});

server.listen(PORT, () => {
  console.log(`Mock de nuevo registro escuchando en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log(`  POST http://localhost:${PORT}/mock-ine`);
  console.log(`  POST http://localhost:${PORT}/api/v1/cardholders`);
  console.log(`  GET  http://localhost:${PORT}/api/v1/cardholders`);
});
