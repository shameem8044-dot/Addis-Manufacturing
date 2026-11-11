import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'production_data.json');

// Interface types
export interface PieceDetails {
  date: string;
  peice: number | '';
  size: string;
  fabric: string;
  master: string;
}

export interface JobWorkDetails {
  date: string;
  peice: number | '';
  rate: number | '';
  name: string;
  paymentDone: boolean;
  washingType?: string; // for washing
}

export interface PackingLine {
  id: string;
  date: string;
  peice: number | '';
  rate: number | '';
  ripit: string;
  name: string;
}

export interface PackingDetails {
  lines: PackingLine[];
  paymentDone: boolean;
}

export interface DamageDetails {
  date: string;
  peice: number | '';
  name: string;
  paymentDone: boolean;
}

export interface PrintDetails {
  date: string;
  peice: number | '';
  name: string;
  paymentDone: boolean;
}

export interface LotRow {
  id: string;
  lotNo: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  
  // Piece details & derived direct fields
  pieceDetails: PieceDetails;
  
  // Job Work Sections
  embroidery: JobWorkDetails;
  fabrication: JobWorkDetails;
  tanki: JobWorkDetails;
  washing: JobWorkDetails;
  packing: PackingDetails;
  damage: DamageDetails;
  print: PrintDetails;
}

export interface AppState {
  lots: LotRow[];
}

// Initial default demo lots so the factory owner immediately sees a working ledger
const defaultLots: LotRow[] = [
  {
    id: 'lot_101',
    lotNo: '101',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin',
    pieceDetails: {
      date: new Date().toISOString().slice(0, 10),
      peice: 1200,
      size: 'M, L, XL',
      fabric: 'Cotton Twill 240 GSM',
      master: 'Master Aslam',
    },
    embroidery: {
      date: new Date().toISOString().slice(0, 10),
      peice: 1200,
      rate: 4.5,
      name: 'Raju Embroidery',
      paymentDone: true,
    },
    fabrication: {
      date: new Date().toISOString().slice(0, 10),
      peice: 1200,
      rate: 18,
      name: 'Shabbir Tailor',
      paymentDone: false,
    },
    tanki: {
      date: new Date().toISOString().slice(0, 10),
      peice: 1200,
      rate: 1.5,
      name: 'Salim Tanki Wala',
      paymentDone: false,
    },
    washing: {
      date: new Date().toISOString().slice(0, 10),
      peice: 1195,
      rate: 6.0,
      name: 'Star Washing Plant',
      washingType: 'Soft Enzyme Wash',
      paymentDone: false,
    },
    packing: {
      paymentDone: false,
      lines: [
        { id: 'p1', date: new Date().toISOString().slice(0, 10), peice: 500, rate: 3, ripit: 'Box Pack', name: 'Munna Pack' },
        { id: 'p2', date: new Date().toISOString().slice(0, 10), peice: 450, rate: 3, ripit: 'Poly Bag', name: 'Munna Pack' },
        { id: 'p3', date: '', peice: '', rate: '', ripit: '', name: '' },
        { id: 'p4', date: '', peice: '', rate: '', ripit: '', name: '' },
      ],
    },
    damage: {
      date: new Date().toISOString().slice(0, 10),
      peice: 1200,
      name: 'Super Laser Tech',
      paymentDone: true,
    },
    print: {
      date: new Date().toISOString().slice(0, 10),
      peice: 1200,
      name: 'Om Screen Print',
      paymentDone: true,
    },
  },
  {
    id: 'lot_102',
    lotNo: '102',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin',
    pieceDetails: {
      date: new Date().toISOString().slice(0, 10),
      peice: 850,
      size: 'S, M, L',
      fabric: 'Rayon Slub',
      master: 'Master Dinesh',
    },
    embroidery: {
      date: new Date().toISOString().slice(0, 10),
      peice: 850,
      rate: 6,
      name: 'Kalam Designer',
      paymentDone: false,
    },
    fabrication: {
      date: '',
      peice: '',
      rate: '',
      name: '',
      paymentDone: false,
    },
    tanki: {
      date: '',
      peice: '',
      rate: '',
      name: '',
      paymentDone: false,
    },
    washing: {
      date: '',
      peice: '',
      rate: '',
      name: '',
      washingType: '',
      paymentDone: false,
    },
    packing: {
      paymentDone: false,
      lines: [
        { id: 'p1', date: '', peice: '', rate: '', ripit: '', name: '' },
        { id: 'p2', date: '', peice: '', rate: '', ripit: '', name: '' },
        { id: 'p3', date: '', peice: '', rate: '', ripit: '', name: '' },
        { id: 'p4', date: '', peice: '', rate: '', ripit: '', name: '' },
      ],
    },
    damage: {
      date: '',
      peice: '',
      name: '',
      paymentDone: false,
    },
    print: {
      date: '',
      peice: '',
      name: '',
      paymentDone: false,
    },
  },
];

// Helper to load state
function loadState(): AppState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.lots)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  const initialState: AppState = { lots: defaultLots };
  saveState(initialState);
  return initialState;
}

// Helper to save state
function saveState(state: AppState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

let appState = loadState();

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  app.use(express.json({ limit: '10mb' }));

  // Track connected clients
  interface ConnectedUser {
    id: string;
    userName: string;
    connectedAt: string;
    lastSeen: number;
    ws?: WebSocket;
  }
  const connectedClients = new Map<string, ConnectedUser>();
  const sseClients = new Set<express.Response>();

  function getActiveUsers() {
    const now = Date.now();
    // Prune users inactive for > 60 seconds
    for (const [id, user] of connectedClients) {
      if (now - user.lastSeen > 60000 && !user.ws) {
        connectedClients.delete(id);
      }
    }
    return Array.from(connectedClients.values()).map(u => ({
      id: u.id,
      userName: u.userName,
      connectedAt: u.connectedAt,
    }));
  }

  function broadcast(type: string, payload: any, senderWs?: WebSocket) {
    const message = JSON.stringify({ type, payload });
    // Broadcast to WebSocket clients
    for (const [, user] of connectedClients) {
      if (user.ws && user.ws.readyState === WebSocket.OPEN && user.ws !== senderWs) {
        try {
          user.ws.send(message);
        } catch (err) {
          console.error('Error sending ws broadcast:', err);
        }
      }
    }
    // Broadcast to SSE clients
    const sseMessage = `data: ${message}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(sseMessage);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  function broadcastUsers() {
    const users = getActiveUsers();
    broadcast('USERS_UPDATE', { users, count: users.length });
  }

  // Handle HTTP upgrade specifically for /ws path to avoid collision with Vite
  server.on('upgrade', (request, socket, head) => {
    try {
      const host = request.headers.host || 'localhost';
      const url = new URL(request.url || '', `http://${host}`);
      if (url.pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch (err) {
      console.error('Upgrade handling error:', err);
      socket.destroy();
    }
  });

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket) => {
    const clientId = 'user_' + Math.random().toString(36).substring(2, 9);
    const user: ConnectedUser = {
      id: clientId,
      userName: 'User ' + clientId.slice(-4),
      connectedAt: new Date().toISOString(),
      lastSeen: Date.now(),
      ws,
    };
    connectedClients.set(clientId, user);

    // Send initial state & user ID to newly connected client
    try {
      ws.send(JSON.stringify({
        type: 'INIT',
        payload: {
          lots: appState.lots,
          clientId,
          userCount: connectedClients.size,
        },
      }));
    } catch (err) {
      console.error('Error sending init message:', err);
    }

    broadcastUsers();

    ws.on('message', (data: string) => {
      try {
        user.lastSeen = Date.now();
        const msg = JSON.parse(data.toString());
        switch (msg.type) {
          case 'SET_USERNAME': {
            if (msg.payload?.userName) {
              user.userName = msg.payload.userName;
              broadcastUsers();
            }
            break;
          }
          case 'ADD_LOT': {
            const newLot: LotRow = msg.payload;
            if (!appState.lots.some(l => l.id === newLot.id)) {
              appState.lots.push(newLot);
              saveState(appState);
              broadcast('LOT_ADDED', newLot, ws);
            }
            break;
          }
          case 'UPDATE_LOT': {
            const updatedLot: LotRow = msg.payload;
            const index = appState.lots.findIndex(l => l.id === updatedLot.id);
            if (index !== -1) {
              appState.lots[index] = updatedLot;
            } else {
              appState.lots.push(updatedLot);
            }
            saveState(appState);
            broadcast('LOT_UPDATED', updatedLot, ws);
            break;
          }
          case 'DELETE_LOT': {
            const { lotId } = msg.payload;
            appState.lots = appState.lots.filter(l => l.id !== lotId);
            saveState(appState);
            broadcast('LOT_DELETED', { lotId }, ws);
            break;
          }
          case 'RESET_DEMO': {
            appState.lots = JSON.parse(JSON.stringify(defaultLots));
            saveState(appState);
            broadcast('STATE_RESET', { lots: appState.lots });
            try {
              ws.send(JSON.stringify({ type: 'STATE_RESET', payload: { lots: appState.lots } }));
            } catch {}
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error('Error handling ws message:', err);
      }
    });

    ws.on('close', () => {
      connectedClients.delete(clientId);
      broadcastUsers();
    });

    ws.on('error', () => {
      connectedClients.delete(clientId);
      broadcastUsers();
    });
  });

  // Server-Sent Events (SSE) endpoint for bulletproof proxy/iframe real-time sync
  app.get('/api/events', (_req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Send initial snapshot
    res.write(`data: ${JSON.stringify({ type: 'INIT', payload: { lots: appState.lots, users: getActiveUsers() } })}\n\n`);
    sseClients.add(res);

    // Keep-alive heartbeat every 20 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(heartbeat);
      }
    }, 20000);

    res.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // Presence endpoint for HTTP sync
  app.post('/api/presence', (req, res) => {
    const { userId, userName } = req.body || {};
    if (userId) {
      const existing = connectedClients.get(userId);
      if (existing) {
        existing.userName = userName || existing.userName;
        existing.lastSeen = Date.now();
      } else {
        connectedClients.set(userId, {
          id: userId,
          userName: userName || 'User ' + userId.slice(-4),
          connectedAt: new Date().toISOString(),
          lastSeen: Date.now(),
        });
      }
      broadcastUsers();
    }
    res.json({ success: true, users: getActiveUsers() });
  });

  // REST API Endpoints as reliable backup and for direct data access
  app.get('/api/lots', (_req, res) => {
    res.json({ success: true, lots: appState.lots, activeUsers: connectedClients.size });
  });

  app.post('/api/lots', (req, res) => {
    const lot: LotRow = req.body;
    if (!lot || !lot.id || !lot.lotNo) {
      return res.status(400).json({ error: 'Invalid lot data' });
    }
    const exists = appState.lots.some(l => l.id === lot.id);
    if (!exists) {
      appState.lots.push(lot);
      saveState(appState);
      broadcast('LOT_ADDED', lot);
    }
    res.json({ success: true, lot });
  });

  app.put('/api/lots/:id', (req, res) => {
    const lotId = req.params.id;
    const updatedLot: LotRow = req.body;
    const index = appState.lots.findIndex(l => l.id === lotId);
    if (index !== -1) {
      appState.lots[index] = updatedLot;
    } else {
      appState.lots.push(updatedLot);
    }
    saveState(appState);
    broadcast('LOT_UPDATED', updatedLot);
    res.json({ success: true, lot: updatedLot });
  });

  app.delete('/api/lots/:id', (req, res) => {
    const lotId = req.params.id;
    appState.lots = appState.lots.filter(l => l.id !== lotId);
    saveState(appState);
    broadcast('LOT_DELETED', { lotId });
    res.json({ success: true, lotId });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} with WebSockets & SSE enabled`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
