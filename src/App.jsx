import React, { useState, useRef } from 'react';

/**
 * AI Reasoning Architect
 * A tool for designing Goal-Oriented Action Planning (GOAP) trees
 * specifically for the TTT: Evolved AI.
 */

const NODE_TYPES = {
  GOAL: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50' },
  CONDITION: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/50' },
  ACTION: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/50' },
  LOGIC: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50' }
};

export default function App() {
  const [nodes, setNodes] = useState([
    { id: '1', type: 'GOAL', label: 'Win Match', x: 100, y: 100, data: { priority: 10000 } },
    { id: '2', type: 'CONDITION', label: 'Can Score 3-in-a-row', x: 400, y: 100, data: {} },
    { id: '3', type: 'ACTION', label: 'Complete Sequence', x: 700, y: 100, data: { utility: 500 } },
  ]);
  const [connections, setConnections] = useState([
    { from: '1', to: '2' },
    { from: '2', to: '3' }
  ]);
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  // --- NODE LOGIC ---
  const addNode = (type) => {
    const newNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `New ${type}`,
      x: (window.innerWidth / 2 - pan.x - 80) / zoom,
      y: (window.innerHeight / 2 - pan.y - 40) / zoom,
      data: {}
    };
    setNodes([...nodes, newNode]);
  };

  const deleteSelected = () => {
    if (!selectedNodeId) return;
    setNodes(nodes.filter(n => n.id !== selectedNodeId));
    setConnections(connections.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const removeConnection = (e, index) => {
    e.preventDefault();
    setConnections(connections.filter((_, i) => i !== index));
  };

  const updateNodeLabel = (id, label) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, label } : n));
  };

  // --- INTERACTION ---
  const handlePointerDown = (e) => {
    lastMouse.current = { x: e.clientX, y: e.clientY };
    if (e.target === canvasRef.current) {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsDraggingCanvas(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      } else {
        setSelectedNodeId(null);
      }
    }
  };

  const handlePointerMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    if (isDraggingCanvas) {
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    }

    if (draggedNode) {
      setNodes(nodes.map(n => n.id === draggedNode ? {
        ...n,
        x: n.x + dx / zoom,
        y: n.y + dy / zoom
      } : n));
    }
  };

  const handlePointerUp = (e) => {
    setIsDraggingCanvas(false);
    setDraggedNode(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.max(0.2, Math.min(zoom + delta, 3));
    
    // Zoom toward cursor
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const wx = (mouseX - pan.x) / zoom;
    const wy = (mouseY - pan.y) / zoom;
    
    setPan({
      x: mouseX - wx * newZoom,
      y: mouseY - wy * newZoom
    });
    setZoom(newZoom);
  };

  const startConnection = (id, e) => {
    e.stopPropagation();
    setConnectingFrom(id);
  };

  const endConnection = (id) => {
    if (connectingFrom && connectingFrom !== id) {
      const exists = connections.find(c => c.from === connectingFrom && c.to === id);
      if (!exists) {
        setConnections([...connections, { from: connectingFrom, to: id }]);
      }
    }
    setConnectingFrom(null);
  };

  // --- FILE I/O ---
  const loadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.nodes && data.connections) {
          setNodes(data.nodes);
          setConnections(data.connections);
        } else {
          alert('Invalid JSON structure. Missing nodes or connections array.');
        }
      } catch (err) {
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input so the same file can be loaded again if needed
  };

  const exportJSON = () => {
    const data = { nodes, connections };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_reasoning_cycle.json';
    a.click();
  };

  const copyToClipboard = () => {
    const text = JSON.stringify({ nodes, connections }, null, 2);
    navigator.clipboard.writeText(text);
  };

  // --- RENDERING HELPERS ---
  const nodeStyles = (type, isSelected) => {
    const base = NODE_TYPES[type];
    return `
      ${base.bg} ${base.border} ${base.color}
      ${isSelected ? 'ring-2 ring-white border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}
    `;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-tighter text-white">AI REASONING ARCHITECT</h1>
          <div className="flex gap-1">
            {Object.keys(NODE_TYPES).map(type => (
              <button 
                key={type}
                onClick={() => addNode(type)}
                className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors ${NODE_TYPES[type].bg} ${NODE_TYPES[type].border} hover:bg-white/10`}
              >
                + {type}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded border border-slate-700 cursor-pointer text-center">
            LOAD JSON
            <input type="file" accept=".json" className="hidden" onChange={loadJSON} />
          </label>
          <button onClick={copyToClipboard} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded border border-slate-700">COPY JSON</button>
          <button onClick={exportJSON} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded">EXPORT .JSON</button>
          <button onClick={deleteSelected} className="px-3 py-1.5 bg-rose-900/40 text-rose-400 hover:bg-rose-900/60 text-xs font-bold rounded border border-rose-900/50">DELETE NODE</button>
        </div>
      </header>

      {/* CANVAS */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-hidden transition-cursor ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        style={{ 
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', 
          backgroundSize: `${30 * zoom}px ${30 * zoom}px`, 
          backgroundPosition: `${pan.x}px ${pan.y}px` 
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
        >
          {/* CONNECTIONS (SVG) */}
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orientation="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
            </defs>
            {connections.map((conn, i) => {
              const from = nodes.find(n => n.id === conn.from);
              const to = nodes.find(n => n.id === conn.to);
              if (!from || !to) return null;
              return (
                <g key={i}>
                  <line 
                    x1={from.x + 80} y1={from.y + 40}
                    x2={to.x + 80} y2={to.y + 40}
                    stroke="transparent" strokeWidth="15"
                    className="pointer-events-auto cursor-pointer"
                    onContextMenu={(e) => removeConnection(e, i)}
                  />
                  <line 
                    x1={from.x + 80} y1={from.y + 40}
                    x2={to.x + 80} y2={to.y + 40}
                    stroke="#475569" strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}
            {connectingFrom && (
              <line 
                x1={nodes.find(n => n.id === connectingFrom).x + 80}
                y1={nodes.find(n => n.id === connectingFrom).y + 40}
                x2={(mousePos.x - pan.x) / zoom} y2={(mousePos.y - pan.y) / zoom}
                stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5"
              />
            )}
          </svg>

          {/* NODES */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={`absolute w-40 p-4 rounded-xl border flex flex-col gap-2 pointer-events-auto select-none transition-transform ${nodeStyles(node.type, selectedNodeId === node.id)}`}
              style={{ left: node.x, top: node.y }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
                setDraggedNode(node.id);
              }}
              onPointerUp={() => endConnection(node.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest">{node.type}</span>
                <div 
                  className="w-4 h-4 rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer flex items-center justify-center text-[10px] text-white"
                  onPointerDown={(e) => startConnection(node.id, e)}
                >
                  +
                </div>
              </div>
              <textarea 
                className="bg-transparent text-sm font-bold border-none outline-none resize-none h-12 custom-scrollbar"
                value={node.label}
                onChange={(e) => updateNodeLabel(node.id, e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER / INSPECTOR */}
      {selectedNodeId && (
        <div className="absolute bottom-6 right-6 w-64 bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl z-50">
          <h3 className="text-xs font-black uppercase tracking-tighter mb-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${NODE_TYPES[nodes.find(n => n.id === selectedNodeId).type].bg.replace('/10', '')}`} />
            Node Properties
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">DATA PAYLOAD (JSON)</label>
              <textarea 
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono h-24 outline-none"
                value={JSON.stringify(nodes.find(n => n.id === selectedNodeId).data, null, 2)}
                onChange={(e) => {
                  try {
                    const data = JSON.parse(e.target.value);
                    setNodes(nodes.map(n => n.id === selectedNodeId ? { ...n, data } : n));
                  } catch(e) {}
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* INSTRUCTIONS */}
      <div className="absolute bottom-6 left-6 text-[10px] text-slate-500 font-mono bg-slate-950/80 p-2 rounded backdrop-blur-md border border-slate-800">
        Middle-Click or Alt+Drag to Pan. Click nodes to select. Drag [+] to connect. Right-click connections to delete.
      </div>
    </div>
  );
}
