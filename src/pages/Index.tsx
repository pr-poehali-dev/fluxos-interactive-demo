import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

type Screen = 'home' | 'fluxhub' | 'taskflow' | 'fluxconnect' | 'multitask' | 'settings' | 'camera' | 'gallery' | 'phone';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface AppIcon {
  id: string;
  name: string;
  icon: string;
  color: string;
  screen?: Screen;
}

interface Device {
  id: string;
  name: string;
  icon: string;
  status: 'connected' | 'available' | 'offline';
  battery?: number;
  lastSeen?: string;
}

interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'tasks' | 'music';
  title: string;
  position: number;
}

interface OpenApp {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const apps: AppIcon[] = [
  { id: 'phone', name: 'Phone', icon: 'Phone', color: 'bg-green-500', screen: 'phone' },
  { id: 'camera', name: 'Camera', icon: 'Camera', color: 'bg-gray-700', screen: 'camera' },
  { id: 'gallery', name: 'Gallery', icon: 'Image', color: 'bg-purple-500', screen: 'gallery' },
  { id: 'settings', name: 'Settings', icon: 'Settings', color: 'bg-gray-600', screen: 'settings' },
  { id: 'fluxhub', name: 'Flux Hub', icon: 'Grid3x3', color: 'bg-indigo-500', screen: 'fluxhub' },
  { id: 'taskflow', name: 'TaskFlow', icon: 'CheckSquare', color: 'bg-blue-500', screen: 'taskflow' },
  { id: 'fluxconnect', name: 'FluxConnect', icon: 'Laptop', color: 'bg-cyan-500', screen: 'fluxconnect' },
  { id: 'multitask', name: 'Multitask', icon: 'Square', color: 'bg-orange-500', screen: 'multitask' },
];

const dockApps = apps.slice(0, 4);

const FluxOS = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState(false);
  const [customizeMode, setCustomizeMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Design FluxOS interface', completed: true, priority: 'high' },
    { id: '2', text: 'Implement gesture controls', completed: false, priority: 'medium' },
    { id: '3', text: 'Test FluxConnect sync', completed: false, priority: 'low' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [brightness, setBrightness] = useState([70]);
  const [volume, setVolume] = useState([50]);
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'MacBook Pro', icon: 'Laptop', status: 'connected', battery: 85, lastSeen: 'Now' },
    { id: '2', name: 'iPad Air', icon: 'Tablet', status: 'available', battery: 62, lastSeen: '5 min ago' },
    { id: '3', name: 'Work Desktop', icon: 'Monitor', status: 'offline', lastSeen: '2 hours ago' },
  ]);
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', type: 'clock', title: 'Clock', position: 0 },
    { id: '2', type: 'tasks', title: 'Tasks', position: 1 },
  ]);
  const [openApps, setOpenApps] = useState<OpenApp[]>([
    { id: 'taskflow', name: 'TaskFlow', icon: 'CheckSquare', color: 'bg-blue-500' },
    { id: 'fluxconnect', name: 'FluxConnect', icon: 'Laptop', color: 'bg-cyan-500' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const touchStartY = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchEndY - touchStartY.current;
    
    if (diff > 100 && touchStartY.current < 100) {
      setNotificationOpen(true);
    } else if (diff < -100 && notificationOpen) {
      setNotificationOpen(false);
    }
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setCustomizeMode(true);
      toast.success('Customize mode activated');
    }, 800);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const connectDevice = (deviceId: string) => {
    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, status: 'connected' as const, lastSeen: 'Now' } : d
    ));
    toast.success('Device connected successfully');
  };

  const disconnectDevice = (deviceId: string) => {
    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, status: 'available' as const } : d
    ));
    toast.info('Device disconnected');
  };

  const mirrorDevice = (deviceName: string) => {
    toast.success(`Mirroring to ${deviceName}`);
  };

  const transferToDevice = (deviceName: string) => {
    toast.success(`Transferring content to ${deviceName}`);
  };

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      position: widgets.length,
    };
    setWidgets([...widgets, newWidget]);
    toast.success('Widget added');
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    toast.info('Widget removed');
  };

  const closeApp = (appId: string) => {
    setOpenApps(openApps.filter(app => app.id !== appId));
    toast.info('App closed');
  };

  const openApp = (screen: Screen) => {
    const app = apps.find(a => a.screen === screen);
    if (app && !openApps.find(a => a.id === app.id)) {
      setOpenApps([...openApps, { id: app.id, name: app.name, icon: app.icon, color: app.color }]);
    }
    setCurrentScreen(screen);
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const priorityColors = {
    low: 'bg-green-500/20 border-green-500',
    medium: 'bg-yellow-500/20 border-yellow-500',
    high: 'bg-red-500/20 border-red-500',
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'clock':
        return (
          <Card className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20">
            <div className="text-4xl font-bold">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          </Card>
        );
      case 'tasks':
        return (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Today's Tasks</h3>
            <div className="space-y-1 text-sm">
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', task.completed ? 'bg-green-500' : 'bg-yellow-500')} />
                  <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.text}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      case 'weather':
        return (
          <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <div className="flex items-center gap-3">
              <Icon name="Cloud" size={32} />
              <div>
                <div className="text-2xl font-bold">22°C</div>
                <div className="text-sm text-muted-foreground">Partly Cloudy</div>
              </div>
            </div>
          </Card>
        );
      case 'music':
        return (
          <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <div className="flex items-center gap-3">
              <Icon name="Music" size={24} />
              <div className="flex-1">
                <div className="font-semibold text-sm">FluxOS Theme</div>
                <div className="text-xs text-muted-foreground">Now Playing</div>
              </div>
            </div>
          </Card>
        );
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <div 
            className="p-6 pt-20 pb-32"
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
          >
            {customizeMode && (
              <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Customize Home</h3>
                  <Button size="sm" onClick={() => setCustomizeMode(false)}>Done</Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button size="sm" variant="outline" onClick={() => addWidget('clock')}>
                    <Icon name="Clock" size={16} className="mr-2" />
                    Clock
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addWidget('weather')}>
                    <Icon name="Cloud" size={16} className="mr-2" />
                    Weather
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addWidget('tasks')}>
                    <Icon name="CheckSquare" size={16} className="mr-2" />
                    Tasks
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addWidget('music')}>
                    <Icon name="Music" size={16} className="mr-2" />
                    Music
                  </Button>
                </div>
              </div>
            )}

            {widgets.length > 0 && (
              <div className="mb-6 space-y-3">
                {widgets.map((widget) => (
                  <div key={widget.id} className="relative group">
                    {renderWidget(widget)}
                    {customizeMode && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeWidget(widget.id)}
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => app.screen && openApp(app.screen)}
                  className={cn(
                    'flex flex-col items-center gap-2 ripple-effect touch-highlight transition-transform active:scale-95',
                    customizeMode && 'animate-wiggle'
                  )}
                >
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg', app.color)}>
                    <Icon name={app.icon as any} size={28} className="text-white" />
                  </div>
                  <span className="text-xs text-white/90">{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'fluxhub':
        return (
          <div className="p-6 pt-20 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-6">
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps..."
                  className="pl-10 bg-card/50 border-border/50 rounded-2xl"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm text-muted-foreground mb-3">Categories</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['All', 'Productivity', 'Creative', 'System', 'Communication'].map((cat) => (
                  <Badge 
                    key={cat} 
                    variant={selectedCategory === cat ? 'default' : 'secondary'} 
                    className="px-4 py-2 rounded-full whitespace-nowrap cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm text-muted-foreground mb-3">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Apps'}
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => app.screen && openApp(app.screen)}
                  className="flex flex-col items-center gap-2 ripple-effect transition-all hover:scale-105 active:scale-95"
                >
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg', app.color)}>
                    <Icon name={app.icon as any} size={28} className="text-white" />
                  </div>
                  <span className="text-xs text-white/90 text-center">{app.name}</span>
                </button>
              ))}
            </div>

            {filteredApps.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No apps found</p>
              </div>
            )}
          </div>
        );

      case 'taskflow':
        return (
          <div className="p-6 pt-20 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">TaskFlow</h2>
              <Button size="icon" variant="ghost" onClick={() => setCurrentScreen('home')}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="mb-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const newTask: Task = {
                    id: Date.now().toString(),
                    text: 'New task',
                    completed: false,
                    priority: 'medium',
                  };
                  setTasks([...tasks, newTask]);
                  toast.success('Task added');
                }}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Add Task
              </Button>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedTask(task.id)}
                  onDragEnd={() => setDraggedTask(null)}
                  className={cn(
                    'p-4 border-l-4 cursor-move transition-all hover:shadow-lg',
                    priorityColors[task.priority],
                    draggedTask === task.id && 'opacity-50 scale-95'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="ripple-effect"
                    >
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        task.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
                      )}>
                        {task.completed && <Icon name="Check" size={14} />}
                      </div>
                    </button>
                    <span className={cn('flex-1', task.completed && 'line-through text-muted-foreground')}>
                      {task.text}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {task.priority}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'fluxconnect':
        return (
          <div className="p-6 pt-20 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">FluxConnect</h2>
              <Button size="icon" variant="ghost" onClick={() => setCurrentScreen('home')}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="mb-6">
              <Card className="p-4 bg-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon name="Smartphone" size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">This Device</h3>
                    <p className="text-sm text-muted-foreground">FluxOS Phone · 89%</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </Card>
            </div>

            <h3 className="text-sm text-muted-foreground mb-3">Available Devices</h3>

            <div className="space-y-3">
              {devices.map((device) => (
                <Card key={device.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Icon name={device.icon as any} size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{device.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{device.status}</span>
                        {device.battery && (
                          <>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                              <Icon name="Battery" size={14} />
                              <span>{device.battery}%</span>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{device.lastSeen}</p>
                    </div>
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      device.status === 'connected' ? 'bg-green-500 animate-pulse' : 
                      device.status === 'available' ? 'bg-yellow-500' : 'bg-gray-500'
                    )} />
                  </div>
                  
                  {device.status !== 'offline' && (
                    <div className="space-y-2">
                      {device.status === 'connected' ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => mirrorDevice(device.name)}
                            >
                              <Icon name="Share2" size={14} className="mr-2" />
                              Mirror
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => transferToDevice(device.name)}
                            >
                              <Icon name="ArrowRightLeft" size={14} className="mr-2" />
                              Transfer
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => disconnectDevice(device.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="w-full"
                          onClick={() => connectDevice(device.id)}
                        >
                          <Icon name="Link" size={14} className="mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {device.status === 'offline' && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      Device is offline
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case 'multitask':
        return (
          <div className="p-6 pt-20 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Multitask</h2>
              <Button size="icon" variant="ghost" onClick={() => setCurrentScreen('home')}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            {openApps.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Square" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No open apps</p>
                <Button variant="outline" className="mt-4" onClick={() => setCurrentScreen('home')}>
                  Open an app
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {openApps.map((app) => (
                  <Card 
                    key={app.id} 
                    className="p-4 relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    onClick={() => setCurrentScreen(app.id as Screen)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', app.color)}>
                          <Icon name={app.icon as any} size={20} className="text-white" />
                        </div>
                        <h3 className="font-semibold">{app.name}</h3>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeApp(app.id);
                        }}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                    <div className="h-40 bg-muted/20 rounded-lg flex items-center justify-center overflow-hidden">
                      <div className="text-center">
                        <Icon name={app.icon as any} size={48} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Tap to open</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="p-6 pt-20 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <Button size="icon" variant="ghost" onClick={() => setCurrentScreen('home')}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Wifi" size={20} />
                    <span>Wi-Fi</span>
                  </div>
                  <Switch checked={wifi} onCheckedChange={setWifi} />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Bluetooth" size={20} />
                    <span>Bluetooth</span>
                  </div>
                  <Switch checked={bluetooth} onCheckedChange={setBluetooth} />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon name="Sun" size={20} />
                    <span>Brightness</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{brightness[0]}%</span>
                </div>
                <Slider value={brightness} onValueChange={setBrightness} max={100} step={1} />
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon name="Volume2" size={20} />
                    <span>Volume</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                </div>
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
              </Card>

              <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Bell" size={20} />
                    <span>Notifications</span>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="User" size={20} />
                    <span>Account</span>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6 pt-20 pb-32 flex flex-col items-center justify-center h-full">
            <Icon name="Package" size={48} className="text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{currentScreen}</h2>
            <p className="text-muted-foreground text-center mb-6">This app is coming soon</p>
            <Button onClick={() => setCurrentScreen('home')}>Back to Home</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div
          className="relative bg-card rounded-[3rem] shadow-2xl overflow-hidden"
          style={{ height: '844px', maxHeight: '90vh' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={cn(
              'absolute top-6 left-1/2 -translate-x-1/2 bg-black rounded-full transition-all duration-300 z-50 cursor-pointer touch-highlight',
              dynamicIslandExpanded ? 'w-64 h-32' : 'w-32 h-8'
            )}
            onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
          >
            {dynamicIslandExpanded ? (
              <div className="p-4 text-white animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Icon name="Music" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Now Playing</p>
                    <p className="text-xs text-white/60">FluxOS Theme</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                    <Icon name="SkipBack" size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                    <Icon name="Play" size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                    <Icon name="SkipForward" size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            )}
          </div>

          <div
            className={cn(
              'absolute top-0 left-0 right-0 glassmorphism z-40 transition-transform duration-300 overflow-y-auto max-h-[60vh]',
              notificationOpen ? 'translate-y-0' : '-translate-y-full'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pt-20 pb-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="p-4 touch-highlight active:scale-95 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Wifi" size={20} className={wifi ? 'text-primary' : 'text-muted-foreground'} />
                    <Switch checked={wifi} onCheckedChange={setWifi} />
                  </div>
                  <p className="text-sm font-medium">Wi-Fi</p>
                  <p className="text-xs text-muted-foreground">{wifi ? 'Connected' : 'Off'}</p>
                </Card>
                
                <Card className="p-4 touch-highlight active:scale-95 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Bluetooth" size={20} className={bluetooth ? 'text-primary' : 'text-muted-foreground'} />
                    <Switch checked={bluetooth} onCheckedChange={setBluetooth} />
                  </div>
                  <p className="text-sm font-medium">Bluetooth</p>
                  <p className="text-xs text-muted-foreground">{bluetooth ? 'On' : 'Off'}</p>
                </Card>

                <Card className="p-4 touch-highlight active:scale-95 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Plane" size={20} className="text-muted-foreground" />
                    <Switch />
                  </div>
                  <p className="text-sm font-medium">Airplane</p>
                  <p className="text-xs text-muted-foreground">Off</p>
                </Card>

                <Card className="p-4 touch-highlight active:scale-95 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Volume2" size={20} className="text-primary" />
                    <span className="text-xs text-muted-foreground">{volume[0]}%</span>
                  </div>
                  <p className="text-sm font-medium">Volume</p>
                  <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="mt-2" />
                </Card>
              </div>

              <Card className="p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Sun" size={20} className="text-primary" />
                  <span className="text-sm text-muted-foreground">{brightness[0]}%</span>
                </div>
                <Slider value={brightness} onValueChange={setBrightness} max={100} step={1} />
              </Card>

              <div className="space-y-2">
                <h3 className="text-xs text-muted-foreground uppercase font-semibold">Notifications</h3>
                
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="MessageSquare" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">FluxConnect</p>
                      <p className="text-xs text-muted-foreground">Device sync completed successfully</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">2 min ago</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="CheckSquare" size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">TaskFlow</p>
                      <p className="text-xs text-muted-foreground">You completed 3 tasks today!</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className="h-full overflow-auto">
            {renderScreen()}
          </div>

          <div className="absolute bottom-0 left-0 right-0 glassmorphism p-4 z-30">
            <div className="flex items-center justify-around">
              {dockApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => app.screen && openApp(app.screen)}
                  className="ripple-effect touch-highlight transition-transform active:scale-90 hover:scale-110"
                >
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg', app.color)}>
                    <Icon name={app.icon as any} size={28} className="text-white" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="Zap" size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FluxOS
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Next-gen mobile experience</p>
        </div>
      </div>
    </div>
  );
};

export default FluxOS;
