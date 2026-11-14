'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  getSmoothStepPath,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';

import AppLogo from '../AppLogo';
import { LAYOUTS, STEPS, labelSpot, loopEdges } from './loopLayout';

// The step that is running. Cards and edges read it from here, so advancing the
// loop never rebuilds the node list (which would undo a card being dragged).
const ActiveStep = createContext(0);

const SIDE = { top: Position.Top, right: Position.Right, bottom: Position.Bottom, left: Position.Left };
/** Which way an edge is travelling when it arrives at a handle on that side. */
const ARRIVAL_ANGLE = { [Position.Left]: 0, [Position.Top]: 90, [Position.Right]: 180, [Position.Bottom]: -90 };

const FIT = {
  ring: { padding: '22px' },
  // Room at the top for the card's two-line label, and on the left for the return rail.
  stack: { padding: { top: '62px', bottom: '20px', left: '46px', right: '16px' } },
};
const SNAP_MS = 420;
// The library's corner credit is hidden at the site owner's request. React Flow is free
// to use this way, and asks sites that hide the credit to support it:
// https://reactflow.dev/remove-attribution
const PRO_OPTIONS = { hideAttribution: true };

function ProductNode({ data }) {
  const active = useContext(ActiveStep);
  const step = STEPS[data.index];
  return (
    <div
      className={`loop-node loop-node-${data.layout}${active === data.index ? ' is-active' : ''}`}
      style={{ '--c': step.color, '--ink': step.ink, '--i': data.index }}
    >
      <Handle type="target" position={SIDE[data.in]} isConnectable={false} className="loop-port loop-port-in" />
      <AppLogo app={step.id} size={30} className="loop-node-icon" />
      <span className="loop-node-name">{step.name}</span>
      <span className="loop-node-no">{`0${data.index + 1}`}</span>
      <span className="loop-node-sub">{step.sub}</span>
      <Handle type="source" position={SIDE[data.out]} isConnectable={false} className="loop-port loop-port-out" />
    </div>
  );
}

/** The caption in the middle of the ring. Not a step: it cannot be dragged or clicked. */
function CoreNode() {
  return <div className="loop-core">Intelligent<br />Commercial<br />Readiness</div>;
}

function LoopEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const active = useContext(ActiveStep) === data.index;
  const step = STEPS[data.index];
  const ends = { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition };
  const [path, midX, midY] = getSmoothStepPath({ ...ends, borderRadius: 18, offset: 22 });
  const spot = labelSpot(ends) ?? { x: midX, y: midY };
  // Both ends on the same side means a rail running up beside the column: the label reads along it.
  const upright = sourcePosition === targetPosition;
  const cls = `loop-edge${data.returns ? ' loop-edge-returns' : ''}${active ? ' is-active' : ''}`;
  return (
    <>
      <g className={cls} style={{ '--c': step.color }}>
        <BaseEdge id={id} path={path} interactionWidth={0} />
        <path
          className="loop-edge-arrow"
          d="M-6 -4.5 L0 0 L-6 4.5"
          transform={`translate(${targetX} ${targetY}) rotate(${ARRIVAL_ANGLE[targetPosition]})`}
        />
        {/* The packet travelling to the next product. pathLength lets the CSS work in fractions of the edge. */}
        {active && <path className="loop-edge-packet" d={path} pathLength={1} />}
      </g>
      <EdgeLabelRenderer>
        <div
          className={`loop-pill${active ? ' is-active' : ''}`}
          style={{
            transform: `translate(-50%, -50%) translate(${spot.x}px, ${spot.y}px)${upright ? ' rotate(-90deg)' : ''}`,
            '--c': step.color,
            '--ink': step.ink,
          }}
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { product: ProductNode, core: CoreNode };
const edgeTypes = { loop: LoopEdge };

function buildNodes(name) {
  const layout = LAYOUTS[name];
  const nodes = layout.nodes.map((n, index) => ({
    id: n.id,
    type: 'product',
    position: { x: n.x, y: n.y },
    width: n.width,
    height: n.height,
    data: { index, in: n.in, out: n.out, layout: name },
  }));
  if (name === 'ring') {
    const [w, h] = [140, 56];
    nodes.push({
      id: 'core',
      type: 'core',
      position: { x: (layout.width - w) / 2, y: (layout.height - h) / 2 },
      width: w,
      height: h,
      draggable: false,
      selectable: false,
      className: 'loop-core-node',
      data: {},
    });
  }
  return nodes;
}

const EDGES = loopEdges().map((edge, index) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  type: 'loop',
  focusable: false,
  selectable: false,
  data: { index, label: edge.label, returns: edge.returns },
}));

/** Keeps the diagram fitted to its box as the page is resized. */
function Refit({ fit }) {
  const { fitView } = useReactFlow();
  const ref = useRef(null);
  useEffect(() => {
    const box = ref.current?.closest('.react-flow');
    if (!box) return undefined;
    const observer = new ResizeObserver(() => fitView(fit));
    observer.observe(box);
    return () => observer.disconnect();
  }, [fitView, fit]);
  return <span ref={ref} hidden />;
}

/**
 * The closed loop as a React Flow canvas. Browser only (see LoopVisual), and
 * remounted when the layout changes.
 * `layout` is 'ring' or 'stack'; `active` is the index of the running step.
 */
export default function LoopCanvas({ layout, active, onSelect }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes(layout));
  // A card can be picked up with a mouse (it springs back when dropped). Dragging
  // with a finger would fight page scrolling, so touch screens only get taps.
  const [draggable] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  const frames = useRef({});
  const fit = FIT[layout];
  const { width, height } = LAYOUTS[layout];

  useEffect(() => {
    const running = frames.current;
    return () => Object.values(running).forEach(cancelAnimationFrame);
  }, []);

  const stopSpring = useCallback((_, node) => {
    cancelAnimationFrame(frames.current[node.id]);
  }, []);

  // A dropped card eases back to its place, so the diagram always ends up composed.
  const springHome = useCallback((_, node) => {
    const home = LAYOUTS[layout].nodes.find((n) => n.id === node.id);
    if (!home) return;
    const from = node.position;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / SNAP_MS));
      const k = 1 - (1 - t) ** 3;
      const position = { x: from.x + (home.x - from.x) * k, y: from.y + (home.y - from.y) * k };
      setNodes((all) => all.map((n) => (n.id === node.id ? { ...n, position } : n)));
      if (t < 1) frames.current[node.id] = requestAnimationFrame(tick);
    };
    frames.current[node.id] = requestAnimationFrame(tick);
  }, [layout, setNodes]);

  const selectStep = useCallback((_, node) => {
    if (node.type === 'product') onSelect(node.data.index);
  }, [onSelect]);

  return (
    <ActiveStep.Provider value={active}>
      <ReactFlow
        className="loop-flow"
        nodes={nodes}
        edges={EDGES}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={selectStep}
        onNodeDragStart={stopSpring}
        onNodeDragStop={springHome}
        fitView
        fitViewOptions={fit}
        minZoom={0.4}
        maxZoom={1.2}
        nodeExtent={[[-12, -12], [width + 12, height + 12]]}
        nodesDraggable={draggable}
        // The canvas itself never moves: without this, a card held against an edge scrolls it.
        autoPanOnNodeDrag={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={PRO_OPTIONS}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.5} color="#bcc4d0" />
        <Refit fit={fit} />
      </ReactFlow>
    </ActiveStep.Provider>
  );
}
