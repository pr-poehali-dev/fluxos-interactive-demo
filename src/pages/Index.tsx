import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

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
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Design FluxOS interface', completed: true, priority: 'high' },
    { id: '2', text: 'Implement gesture controls', completed: false, priority: 'medium' },
    { id: '3', text: 'Test FluxConnect sync', completed: false, priority: 'low' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const touchStartY = useRef(0);

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

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const priorityColors = {
    low: 'bg-green-500/20 border-green-500',
    medium: 'bg-yellow-500/20 border-yellow-500',
    high: 'bg-red-500/20 border-red-500',
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <div className="p-6 pt-20">
            <div className="grid grid-cols-4 gap-4 mb-8">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => app.screen && setCurrentScreen(app.screen)}
                  className="flex flex-col items-center gap-2 ripple-effect touch-highlight transition-transform active:scale-95"
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
          <div className="p-6 pt-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
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

            <div className="mb-4">
              <h3 className="text-sm text-muted-foreground mb-3">Categories</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['All', 'Productivity', 'Creative', 'System'].map((cat) => (
                  <Badge key={cat} variant="secondary" className="px-4 py-2 rounded-full whitespace-nowrap">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => app.screen && setCurrentScreen(app.screen)}
                  className="flex flex-col items-center gap-2 ripple-effect transition-all hover:scale-105"
                >
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg', app.color)}>
                    <Icon name={app.icon as any} size={28} className="text-white" />
                  </div>
                  <span className="text-xs text-white/90 text-center">{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'taskflow':
        return (
          <div className="p-6 pt-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">TaskFlow</h2>
              <Button size="icon" variant="ghost" onClick={() => setCurrentScreen('home')}>
                <Icon name="X" size={20} />
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
                    'p-4 border-l-4 cursor-move transition-all',
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
                        'w-5 h-5 rounded border-2 flex items-center justify-center',
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
          <div className="p-6 pt-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">FluxConnect</h2>
              <Button size="icon" variant="ghost" onClick={() => setCurrentScreen('home')}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              {[
                { name: 'MacBook Pro', icon: 'Laptop', status: 'Connected', online: true },
                { name: 'iPad Air', icon: 'Tablet', status: 'Available', online: true },
                { name: 'Work Desktop', icon: 'Monitor', status: 'Offline', online: false },
              ].map((device) => (
                <Card key={device.name} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Icon name={device.icon as any} size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{device.name}</h3>
                      <p className="text-sm text-muted-foreground">{device.status}</p>
                    </div>
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      device.online ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                    )} />
                  </div>
                  {device.online && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Icon name="Share2" size={14} className="mr-2" />
                        Mirror
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Icon name="ArrowRightLeft" size={14} className="mr-2" />
                        Transfer
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case 'multitask':
        return (
          <div className="p-6 pt-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Multitask</h2>
              <Button size="icon" variant="ghost" onClick={() => setCurrentScreen('home')}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              {['TaskFlow', 'FluxConnect', 'Flux Hub'].map((appName) => (
                <Card key={appName} className="p-4 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{appName}</h3>
                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                  <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                    <Icon name="Square" size={32} className="text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-6 pt-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Bell" size={20} />
                    <span>Notifications</span>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6 pt-20 flex flex-col items-center justify-center h-full">
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
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white">
                    <Icon name="SkipBack" size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white">
                    <Icon name="Play" size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white">
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
              'absolute top-0 left-0 right-0 glassmorphism z-40 transition-transform duration-300',
              notificationOpen ? 'translate-y-0' : '-translate-y-full'
            )}
          >
            <div className="p-6 pt-20">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className="p-4 touch-highlight active:scale-95 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Wifi" size={20} className={wifi ? 'text-primary' : 'text-muted-foreground'} />
                    <Switch checked={wifi} onCheckedChange={setWifi} />
                  </div>
                  <p className="text-sm">Wi-Fi</p>
                </Card>
                <Card className="p-4 touch-highlight active:scale-95 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Bluetooth" size={20} className={bluetooth ? 'text-primary' : 'text-muted-foreground'} />
                    <Switch checked={bluetooth} onCheckedChange={setBluetooth} />
                  </div>
                  <p className="text-sm">Bluetooth</p>
                </Card>
              </div>

              <div className="space-y-2">
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="MessageSquare" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">New Message</p>
                      <p className="text-xs text-muted-foreground">FluxConnect sync completed</p>
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
                  onClick={() => app.screen && setCurrentScreen(app.screen)}
                  className="ripple-effect touch-highlight transition-transform active:scale-90"
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
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
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
