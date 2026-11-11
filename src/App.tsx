import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { ProductionTable } from './components/ProductionTable';
import { PieceModal } from './components/PieceModal';
import { JobWorkModal } from './components/JobWorkModal';
import { PackingModal } from './components/PackingModal';
import { LotRow, ModalType, PieceDetails, JobWorkDetails, PackingDetails, ConnectedUserInfo } from './types';
import { createNewLot, calculateJamaPieces, extractColumnSuggestions } from './utils/lotHelper';

export default function App() {
  const [lots, setLots] = useState<LotRow[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<ConnectedUserInfo[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return localStorage.getItem('textile_user_name') || `User ${Math.floor(100 + Math.random() * 900)}`;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Show transient toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  }, []);

  // Send message through WebSocket if open, with fallback to REST
  const sendWsMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef<string>('user_' + Math.random().toString(36).substring(2, 9));

  // Central event dispatcher for real-time updates (from either WebSocket or SSE)
  const handleRealtimeEvent = useCallback((data: any) => {
    switch (data.type) {
      case 'INIT': {
        if (Array.isArray(data.payload?.lots)) {
          setLots(data.payload.lots);
        }
        if (Array.isArray(data.payload?.users)) {
          setActiveUsers(data.payload.users);
        }
        break;
      }
      case 'USERS_UPDATE': {
        if (Array.isArray(data.payload?.users)) {
          setActiveUsers(data.payload.users);
        }
        break;
      }
      case 'LOT_ADDED': {
        const newLot: LotRow = data.payload;
        setLots(prev => {
          if (prev.some(l => l.id === newLot.id)) return prev;
          return [...prev, newLot];
        });
        showToast(`🔔 नया लॉट #${newLot.lotNo} जोड़ा गया`);
        break;
      }
      case 'LOT_UPDATED': {
        const updatedLot: LotRow = data.payload;
        setLots(prev => prev.map(l => l.id === updatedLot.id ? updatedLot : l));
        break;
      }
      case 'LOT_DELETED': {
        const { lotId } = data.payload;
        setLots(prev => prev.filter(l => l.id !== lotId));
        showToast(`लॉट हटाया गया`);
        break;
      }
      case 'STATE_RESET': {
        if (Array.isArray(data.payload?.lots)) {
          setLots(data.payload.lots);
          showToast('डेमो डेटा रीसेट किया गया');
        }
        break;
      }
      default:
        break;
    }
  }, [showToast]);

  // Setup dual real-time sync: SSE (Server-Sent Events) + WebSocket on /ws
  useEffect(() => {
    let isCancelled = false;

    // 1. Initial data fetch via REST
    fetch('/api/lots')
      .then(res => res.json())
      .then(data => {
        if (!isCancelled && data.success && Array.isArray(data.lots)) {
          setLots(data.lots);
          setIsConnected(true);
        }
      })
      .catch(() => {});

    // 2. Establish Server-Sent Events (SSE) stream (works reliably through all proxies and iframes)
    try {
      const es = new EventSource('/api/events');
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!isCancelled) setIsConnected(true);
      };

      es.onmessage = (event) => {
        if (isCancelled) return;
        try {
          const data = JSON.parse(event.data);
          handleRealtimeEvent(data);
        } catch {}
      };

      es.onerror = () => {
        // SSE reconnects automatically by browser spec
      };
    } catch {}

    // 3. Establish WebSocket on dedicated /ws path for instant bidirectional events
    const connectWebSocket = () => {
      if (isCancelled) return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isCancelled) return;
          setIsConnected(true);
          ws.send(JSON.stringify({
            type: 'SET_USERNAME',
            payload: { userName: currentUserName, userId: clientIdRef.current }
          }));
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            handleRealtimeEvent(data);
          } catch {}
        };

        ws.onclose = () => {
          // SSE keeps the app connected even when WebSocket closes
          if (isCancelled) return;
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = () => {
          // Silent fallback: SSE remains active without polluting console with errors
          try {
            ws.close();
          } catch {}
        };
      } catch {
        // Silent fallback to SSE stream
      }
    };

    connectWebSocket();

    // 4. Heartbeat user presence via HTTP
    const sendPresence = () => {
      fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: clientIdRef.current, userName: currentUserName }),
      })
        .then(res => res.json())
        .then(data => {
          if (!isCancelled && Array.isArray(data.users)) {
            setActiveUsers(data.users);
          }
        })
        .catch(() => {});
    };

    sendPresence();
    const presenceInterval = setInterval(sendPresence, 25000);

    return () => {
      isCancelled = true;
      clearInterval(presenceInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
      if (eventSourceRef.current) {
        try { eventSourceRef.current.close(); } catch {}
      }
    };
  }, [currentUserName, handleRealtimeEvent]);

  // Handle changing user name
  const handleUpdateUserName = (newName: string) => {
    setCurrentUserName(newName);
    localStorage.setItem('textile_user_name', newName);
    sendWsMessage('SET_USERNAME', { userName: newName });
    showToast(`नाम बदलकर "${newName}" किया गया`);
  };

  // Add Row: Automatically increments last row's lot number by 1
  const handleAddRow = () => {
    const lastLot = lots.length > 0 ? lots[lots.length - 1] : undefined;
    const newLot = createNewLot(lastLot?.lotNo, currentUserName);

    // Optimistic client update
    setLots(prev => [...prev, newLot]);

    // Broadcast to server and other clients
    sendWsMessage('ADD_LOT', newLot);

    // Fallback REST call
    fetch('/api/lots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLot),
    }).catch(err => console.error('REST POST error:', err));

    showToast(`नया Lot #${newLot.lotNo} जोड़ा गया`);
  };

  // Update Lot No inline directly
  const handleUpdateLotNo = (lotId: string, newLotNo: string) => {
    setLots(prev => {
      const updated = prev.map(lot => {
        if (lot.id === lotId) {
          const mod = { ...lot, lotNo: newLotNo, updatedAt: new Date().toISOString(), updatedBy: currentUserName };
          sendWsMessage('UPDATE_LOT', mod);
          return mod;
        }
        return lot;
      });
      return updated;
    });
  };

  // Delete Lot Row
  const handleDeleteLot = (lotId: string) => {
    setLots(prev => prev.filter(lot => lot.id !== lotId));
    sendWsMessage('DELETE_LOT', { lotId });
    fetch(`/api/lots/${lotId}`, { method: 'DELETE' }).catch(err => console.error('REST DELETE error:', err));
  };

  // Generic Lot updater
  const updateLotItem = (lotId: string, updater: (lot: LotRow) => LotRow) => {
    setLots(prev => {
      const updated = prev.map(lot => {
        if (lot.id === lotId) {
          const mod = updater(lot);
          mod.updatedAt = new Date().toISOString();
          mod.updatedBy = currentUserName;
          sendWsMessage('UPDATE_LOT', mod);
          // REST backup
          fetch(`/api/lots/${lotId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mod),
          }).catch(err => console.error('REST PUT error:', err));
          return mod;
        }
        return lot;
      });
      return updated;
    });
  };

  // Save Piece Details (Date, Peice, Size, Fabric, Master)
  const handleSavePieceDetails = (lotId: string, details: PieceDetails) => {
    updateLotItem(lotId, lot => ({
      ...lot,
      pieceDetails: details,
    }));
    showToast('पीस एवं कटिंग विवरण सेव हो गया');
  };

  // Save Job Work Stage (Embroidery, Fabrication, Tanki, Washing, Damage/Leser, Print)
  const handleSaveJobWork = (lotId: string, stage: string, data: any) => {
    updateLotItem(lotId, lot => ({
      ...lot,
      [stage]: data,
    }));
    const stageLabel = stage === 'damage' ? 'LESER' : stage.toUpperCase();
    if (data.paymentDone) {
      showToast(`✅ ${stageLabel} का पेमेंट संपन्न (Cell Green)`);
    } else {
      showToast(`${stageLabel} विवरण अपडेट हुआ`);
    }
  };

  // Save Packing 4-Lines
  const handleSavePacking = (lotId: string, packingData: PackingDetails) => {
    updateLotItem(lotId, lot => ({
      ...lot,
      packing: packingData,
    }));
    if (packingData.paymentDone) {
      showToast('✅ पैकिंग पेमेंट संपन्न (Cell Green)');
    } else {
      showToast('पैकिंग 4 लाइन्स विवरण सेव हुआ');
    }
  };

  // Reset demo data
  const handleResetDemo = () => {
    if (window.confirm('क्या आप सभी डेटा को डिफ़ॉल्ट डेमो डेटा पर रीसेट करना चाहते हैं?')) {
      sendWsMessage('RESET_DEMO', {});
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Lot no',
      'peice',
      'size',
      'fabric',
      'Master',
      'Embroidery Name',
      'Embroidery Peice',
      'Embroidery Rate',
      'Embroidery Paid',
      'Fabrication Name',
      'Fabrication Peice',
      'Fabrication Rate',
      'Fabrication Paid',
      'Tanki Name',
      'Tanki Peice',
      'Tanki Rate',
      'Tanki Paid',
      'Washing Name',
      'Washing Peice',
      'Washing Type',
      'Washing Rate',
      'Washing Paid',
      'Packing Total Peice',
      'Packing Paid',
      'Jama',
      'Leser Name',
      'Leser Peice',
      'Leser Paid',
      'Print Name',
      'Print Peice',
      'Print Paid',
    ];

    const rows = lots.map(l => {
      const jama = calculateJamaPieces(l.packing);
      return [
        `"${l.lotNo}"`,
        l.pieceDetails.peice,
        `"${l.pieceDetails.size || ''}"`,
        `"${l.pieceDetails.fabric || ''}"`,
        `"${l.pieceDetails.master || ''}"`,
        `"${l.embroidery.name || ''}"`,
        l.embroidery.peice,
        l.embroidery.rate,
        l.embroidery.paymentDone ? 'YES' : 'NO',
        `"${l.fabrication.name || ''}"`,
        l.fabrication.peice,
        l.fabrication.rate,
        l.fabrication.paymentDone ? 'YES' : 'NO',
        `"${l.tanki.name || ''}"`,
        l.tanki.peice,
        l.tanki.rate,
        l.tanki.paymentDone ? 'YES' : 'NO',
        `"${l.washing.name || ''}"`,
        l.washing.peice,
        `"${l.washing.washingType || ''}"`,
        l.washing.rate,
        l.washing.paymentDone ? 'YES' : 'NO',
        jama,
        l.packing.paymentDone ? 'YES' : 'NO',
        jama,
        `"${l.damage.name || ''}"`,
        l.damage.peice,
        `"${l.print.name || ''}"`,
        l.print.peice,
        l.print.paymentDone ? 'YES' : 'NO',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Textile_Production_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV फ़ाइल डाउनलोड हो गई');
  };

  // Find currently targeted lot for modal
  const targetedLot = activeModal ? lots.find(l => l.id === activeModal.lotId) : null;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <HeaderBar
        onAddRow={handleAddRow}
        isConnected={isConnected}
        activeUsers={activeUsers}
        currentUserName={currentUserName}
        onUpdateUserName={handleUpdateUserName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExportCSV={handleExportCSV}
        onResetDemo={handleResetDemo}
        onPrint={() => window.print()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-3">
        {/* Ledger Table */}
        <ProductionTable
          lots={lots}
          onOpenModal={setActiveModal}
          onUpdateLotNo={handleUpdateLotNo}
          onDeleteLot={handleDeleteLot}
          searchQuery={searchQuery}
        />
      </main>

      {/* Active Modals */}
      {activeModal && targetedLot && (() => {
        const suggestions = extractColumnSuggestions(lots);
        const getDeptSuggestions = (dept: string) => {
          switch (dept) {
            case 'embroidery': return suggestions.embroideryNames;
            case 'fabrication': return suggestions.fabricationNames;
            case 'tanki': return suggestions.tankiNames;
            case 'washing': return suggestions.washingNames;
            case 'damage': return suggestions.damageNames;
            case 'print': return suggestions.printNames;
            default: return [];
          }
        };

        return (
          <>
            {activeModal.type === 'piece' && (
              <PieceModal
                lot={targetedLot}
                onSave={(details) => handleSavePieceDetails(targetedLot.id, details)}
                onClose={() => setActiveModal(null)}
                suggestions={{
                  sizes: suggestions.sizes,
                  fabrics: suggestions.fabrics,
                  masters: suggestions.masters,
                }}
              />
            )}

            {activeModal.type === 'packing' && (
              <PackingModal
                lot={targetedLot}
                onSave={(data) => handleSavePacking(targetedLot.id, data)}
                onClose={() => setActiveModal(null)}
                nameSuggestions={suggestions.packingNames}
                ripitSuggestions={suggestions.packingRipits}
              />
            )}

            {['embroidery', 'fabrication', 'tanki', 'washing', 'damage', 'print'].includes(activeModal.type) && (
              <JobWorkModal
                type={activeModal.type as any}
                lot={targetedLot}
                onSave={(data) => handleSaveJobWork(targetedLot.id, activeModal.type as string, data)}
                onClose={() => setActiveModal(null)}
                nameSuggestions={getDeptSuggestions(activeModal.type)}
                washingTypeSuggestions={activeModal.type === 'washing' ? suggestions.washingTypes : []}
              />
            )}
          </>
        );
      })()}

      {/* Transient Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
