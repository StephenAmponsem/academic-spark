import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  ArrowRight,
  Type,
  Undo,
  Redo,
  Download,
  Upload,
  Trash2,
  Users,
  Share2,
  Lock,
  Unlock,
  Palette,
  Minus,
  MousePointer,
  Hand,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Image as ImageIcon,
  StickyNote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

interface DrawingPath {
  id: string;
  tool: Tool;
  points: DrawingPoint[];
  color: string;
  size: number;
  timestamp: number;
  userId: string;
  userName: string;
}

interface WhiteboardShape {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'text' | 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  timestamp: number;
  userId: string;
  userName: string;
}

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'select' | 'hand' | 'sticky';

interface VirtualWhiteboardProps {
  roomId: string;
  isReadOnly?: boolean;
  showParticipants?: boolean;
  className?: string;
}

export function VirtualWhiteboard({ 
  roomId, 
  isReadOnly = false, 
  showParticipants = true,
  className 
}: VirtualWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeSize, setStrokeSize] = useState(2);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [shapes, setShapes] = useState<WhiteboardShape[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPoint[]>([]);
  
  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  
  // Collaboration state
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; color: string; active: boolean }>>([
    { id: '1', name: 'You', color: '#3b82f6', active: true },
    { id: '2', name: 'Alice Johnson', color: '#ef4444', active: true },
    { id: '3', name: 'Bob Smith', color: '#22c55e', active: false }
  ]);
  const [isLocked, setIsLocked] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState<Array<{ paths: DrawingPath[]; shapes: WhiteboardShape[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Colors palette
  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', 
    '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  // Sizes
  const sizes = [1, 2, 4, 6, 8, 12, 16];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set transform
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw background grid
    drawGrid(ctx);

    // Draw all paths
    paths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      
      ctx.stroke();
    });

    // Draw shapes
    shapes.forEach(shape => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      
      switch (shape.type) {
        case 'rectangle':
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.ellipse(
            shape.x + shape.width / 2, 
            shape.y + shape.height / 2, 
            Math.abs(shape.width / 2), 
            Math.abs(shape.height / 2), 
            0, 0, 2 * Math.PI
          );
          ctx.stroke();
          break;
        case 'text':
          ctx.font = `${shape.fontSize || 16}px Arial`;
          ctx.fillStyle = shape.color;
          ctx.fillText(shape.text || '', shape.x, shape.y);
          break;
        case 'sticky':
          // Draw sticky note
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
          ctx.strokeStyle = '#f59e0b';
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          
          // Draw text
          if (shape.text) {
            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.fillText(shape.text, shape.x + 8, shape.y + 20);
          }
          break;
      }
    });

    ctx.restore();
  }, [paths, shapes, zoom, pan]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 20;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }
  };

  // Handle mouse events
  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom - pan.x,
      y: (e.clientY - rect.top) / zoom - pan.y
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isReadOnly || isLocked) return;
    
    const pos = getMousePos(e);
    setIsDrawing(true);
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      setCurrentPath([pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || isReadOnly || isLocked) return;
    
    const pos = getMousePos(e);
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      setCurrentPath(prev => [...prev, pos]);
      
      // Draw current path in real-time
      const canvas = canvasRef.current;
      if (canvas) {
        redrawCanvas();
        
        const ctx = canvas.getContext('2d');
        if (ctx && currentPath.length > 0) {
          ctx.save();
          ctx.scale(zoom, zoom);
          ctx.translate(pan.x, pan.y);
          
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
          }
          
          ctx.beginPath();
          const allPoints = [...currentPath, pos];
          ctx.moveTo(allPoints[0].x, allPoints[0].y);
          
          for (let i = 1; i < allPoints.length; i++) {
            ctx.lineTo(allPoints[i].x, allPoints[i].y);
          }
          
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || isReadOnly || isLocked) return;
    
    setIsDrawing(false);
    
    if ((currentTool === 'pen' || currentTool === 'eraser') && currentPath.length > 0) {
      const newPath: DrawingPath = {
        id: Date.now().toString(),
        tool: currentTool,
        points: currentPath,
        color: strokeColor,
        size: strokeSize,
        timestamp: Date.now(),
        userId: user?.id || 'anonymous',
        userName: user?.user_metadata?.full_name || 'Anonymous'
      };
      
      setPaths(prev => [...prev, newPath]);
      saveToHistory();
    }
    
    setCurrentPath([]);
  };

  const saveToHistory = () => {
    const newState = { paths, shapes };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(prev => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPaths(prevState.paths);
      setShapes(prevState.shapes);
      setHistoryIndex(prev => prev - 1);
      redrawCanvas();
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPaths(nextState.paths);
      setShapes(nextState.shapes);
      setHistoryIndex(prev => prev + 1);
      redrawCanvas();
    }
  };

  const clearCanvas = () => {
    setPaths([]);
    setShapes([]);
    saveToHistory();
    redrawCanvas();
    toast.success('Canvas cleared');
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Whiteboard exported');
  };

  const addStickyNote = () => {
    const text = prompt('Enter sticky note text:');
    if (!text) return;

    const newSticky: WhiteboardShape = {
      id: Date.now().toString(),
      type: 'sticky',
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      color: '#fbbf24',
      strokeWidth: 1,
      text,
      timestamp: Date.now(),
      userId: user?.id || 'anonymous',
      userName: user?.user_metadata?.full_name || 'Anonymous'
    };

    setShapes(prev => [...prev, newSticky]);
    saveToHistory();
    redrawCanvas();
  };

  // Redraw when dependencies change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Toolbar */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Tools */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { tool: 'select' as Tool, icon: MousePointer, label: 'Select' },
                  { tool: 'pen' as Tool, icon: Pen, label: 'Pen' },
                  { tool: 'eraser' as Tool, icon: Eraser, label: 'Eraser' },
                  { tool: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
                  { tool: 'circle' as Tool, icon: Circle, label: 'Circle' },
                  { tool: 'arrow' as Tool, icon: ArrowRight, label: 'Arrow' },
                  { tool: 'text' as Tool, icon: Type, label: 'Text' },
                  { tool: 'hand' as Tool, icon: Hand, label: 'Pan' }
                ].map(({ tool, icon: Icon, label }) => (
                  <Button
                    key={tool}
                    variant={currentTool === tool ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentTool(tool)}
                    className="h-8 w-8 p-0"
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              <Separator orientation="vertical" className="h-8" />

              {/* Colors */}
              <div className="flex items-center gap-1">
                <Palette className="h-4 w-4 text-gray-500" />
                <div className="flex gap-1">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setStrokeColor(color)}
                      className={cn(
                        "w-6 h-6 rounded border-2 transition-all",
                        strokeColor === color ? "border-gray-400 scale-110" : "border-gray-200"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Separator orientation="vertical" className="h-8" />

              {/* Sizes */}
              <div className="flex items-center gap-1">
                <Minus className="h-4 w-4 text-gray-500" />
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setStrokeSize(size)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                      strokeSize === size ? "border-gray-400 bg-gray-100" : "border-gray-200"
                    )}
                  >
                    <div 
                      className="rounded-full bg-gray-600"
                      style={{ width: Math.min(size, 12), height: Math.min(size, 12) }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-8" />

              <Button variant="ghost" size="sm" onClick={addStickyNote}>
                <StickyNote className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}>
                <ZoomOut className="h-4 w-4" />
              </Button>

              <Badge variant="outline" className="text-xs">
                {Math.round(zoom * 100)}%
              </Badge>

              <Separator orientation="vertical" className="h-8" />

              <Button variant="ghost" size="sm" onClick={clearCanvas}>
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={exportCanvas}>
                <Download className="h-4 w-4" />
              </Button>

              <Button 
                variant={isLocked ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setIsLocked(!isLocked)}
              >
                {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Canvas */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gray-50">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          {/* Status indicator */}
          {isLocked && (
            <div className="absolute top-4 left-4 bg-red-100 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Whiteboard is locked</span>
            </div>
          )}
        </div>

        {/* Participants Panel */}
        {showParticipants && (
          <Card className="w-64 rounded-none border-y-0 border-r-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="text-sm flex-1">{participant.name}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    participant.active ? "bg-green-500" : "bg-gray-300"
                  )} />
                </div>
              ))}
              
              <Separator />
              
              <Button variant="outline" size="sm" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Invite Others
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default VirtualWhiteboard;