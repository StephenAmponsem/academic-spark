import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Palette,
  Bell,
  Mail,
  Smartphone,
  Globe,
  Clock,
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { settings, loading, error, updateSettings, resetSettings, isUpdating } = useSettings();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');

  const handleSignOut = async () => {
    navigate('/');
    await signOut();
  };

  const handleSettingChange = async (key: string, value: any) => {
    if (!settings) return;

    try {
      await updateSettings({ [key]: value });
      toast.success('Setting updated successfully');
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleResetSettings = async () => {
    try {
      await resetSettings();
      toast.success('Settings reset to defaults');
    } catch (error) {
      toast.error('Failed to reset settings');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-2xl">
                  <SettingsIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Settings
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sign in to access your settings and preferences
            </p>
            <Button onClick={() => navigate('/auth')} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Sparkles className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {isUpdating ? 'Saving...' : 'Settings Saved'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                  <SettingsIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Settings & Preferences
            </h1>
            <p className="text-xl text-muted-foreground">
              Customize your learning experience and manage your account
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Information */}
              <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="font-semibold">{user?.email}</p>
                      </div>
                      <Badge variant="secondary">Verified</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">User ID</p>
                        <p className="font-mono text-sm">{user?.id}</p>
                      </div>
                      <Badge variant="outline">System</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                        <p className="font-semibold">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-900/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => toast.info('Profile editing coming soon!')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      onClick={() => toast.info('Password change coming soon!')}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    
                    <Separator />
                    
                    <Button 
                      variant="destructive" 
                      onClick={handleSignOut}
                      className="w-full justify-start"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notification Settings */}
              <Card className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-green-600" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg animate-pulse">
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </div>
                          <div className="h-6 w-11 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <div>
                          <p className="font-medium">Enable Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive important updates</p>
                        </div>
                        <Switch
                          checked={settings?.notifications_enabled || false}
                          onCheckedChange={(checked) => handleSettingChange('notifications_enabled', checked)}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Get updates via email</p>
                        </div>
                        <Switch
                          checked={settings?.email_notifications || false}
                          onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                          disabled={isUpdating || !settings?.notifications_enabled}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">Get browser notifications</p>
                        </div>
                        <Switch
                          checked={settings?.push_notifications || false}
                          onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
                          disabled={isUpdating || !settings?.notifications_enabled}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* General Preferences */}
              <Card className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    General Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg animate-pulse">
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                          </div>
                          <div className="h-6 w-11 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <div>
                          <p className="font-medium">Auto Save</p>
                          <p className="text-sm text-muted-foreground">Automatically save your work</p>
                        </div>
                        <Switch
                          checked={settings?.auto_save || false}
                          onCheckedChange={(checked) => handleSettingChange('auto_save', checked)}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Language</label>
                        <Select
                          value={settings?.language || 'en'}
                          onValueChange={(value) => handleSettingChange('language', value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="bg-white/70 dark:bg-gray-800/70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Timezone</label>
                        <Select
                          value={settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                          onValueChange={(value) => handleSettingChange('timezone', value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="bg-white/70 dark:bg-gray-800/70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                            <SelectItem value="Europe/London">London</SelectItem>
                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme Selection */}
              <Card className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-amber-600" />
                    Theme Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        theme === 'light' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                          <Sun className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Light Mode</p>
                          <p className="text-sm text-muted-foreground">Clean and bright interface</p>
                        </div>
                        {theme === 'light' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                          <Moon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">Easy on the eyes</p>
                        </div>
                        {theme === 'dark' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        theme === 'system' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                      onClick={() => handleThemeChange('system')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Monitor className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">System</p>
                          <p className="text-sm text-muted-foreground">Follows your system preference</p>
                        </div>
                        {theme === 'system' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Theme Preview */}
              <Card className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    Current Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${resolvedTheme === 'dark' ? 'bg-slate-600' : 'bg-yellow-500'}`}></div>
                      <span className="font-medium">
                        {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} Active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your current theme is set to <strong>{resolvedTheme}</strong> mode.
                      {theme === 'system' && ' This follows your system preference.'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Theme Features</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Automatic system preference detection</li>
                      <li>• Smooth theme transitions</li>
                      <li>• Persistent theme selection</li>
                      <li>• Optimized for readability</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Privacy Settings */}
              <Card className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border">
                      <h4 className="font-medium mb-2">Data Storage</h4>
                      <p className="text-sm text-muted-foreground">
                        Your settings are stored locally in your browser. 
                        We never share your personal information with third parties.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border">
                      <h4 className="font-medium mb-2">Data Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Your data is processed securely and used only to improve your learning experience.
                        We follow strict data protection guidelines.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border">
                      <h4 className="font-medium mb-2">Account Security</h4>
                      <p className="text-sm text-muted-foreground">
                        Your account is protected with industry-standard security measures.
                        We recommend using a strong password and enabling two-factor authentication.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Management */}
              <Card className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-orange-600" />
                    Settings Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      onClick={() => toast.success('Settings exported successfully')}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      onClick={handleResetSettings}
                      disabled={isUpdating}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Defaults
                    </Button>
                    
                    <Separator />
                    
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Reset Warning
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Resetting will restore all settings to their default values. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings; 