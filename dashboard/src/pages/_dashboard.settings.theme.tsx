import { useTheme, type ColorTheme, type Radius } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { CheckCircle2, Monitor, Moon, Palette, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const colorThemeData = [
  { name: 'default', label: 'theme.default', dot: '#2563eb' },
  { name: 'red', label: 'theme.red', dot: '#ef4444' },
  { name: 'rose', label: 'theme.rose', dot: '#e11d48' },
  { name: 'orange', label: 'theme.orange', dot: '#f97316' },
  { name: 'green', label: 'theme.green', dot: '#22c55e' },
  { name: 'blue', label: 'theme.blue', dot: '#3b82f6' },
  { name: 'yellow', label: 'theme.yellow', dot: '#eab308' },
  { name: 'violet', label: 'theme.violet', dot: '#8b5cf6' },
] as const

const radiusOptions = [
  { value: '0', label: 'theme.radiusNone', description: '0px' },
  { value: '0.3rem', label: 'theme.radiusSmall', description: '0.3rem' },
  { value: '0.5rem', label: 'theme.radiusMedium', description: '0.5rem' },
  { value: '0.75rem', label: 'theme.radiusLarge', description: '0.75rem' },
] as const

export default function ThemeSettings() {
  const { t } = useTranslation()
  const { theme, colorTheme, radius, resolvedTheme, setTheme, setColorTheme, setRadius, resetToDefaults, isSystemTheme } = useTheme()

  const [isResetting, setIsResetting] = useState(false)

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)

    // Get the appropriate icon for the toast
    const getThemeIcon = (theme: string) => {
      switch (theme) {
        case 'light':
          return '☀️'
        case 'dark':
          return '🌙'
        case 'system':
          return '💻'
        default:
          return '🎨'
      }
    }

    toast.success(t('success'), {
      description: `${getThemeIcon(newTheme)} ${t('theme.themeChanged')}`,
      duration: 2000,
    })
  }

  const handleColorChange = (colorName: string) => {
    // if (Object.keys(colorThemes).includes(colorName)) {
    setColorTheme(colorName as ColorTheme)

    // Get the color dot for the toast
    const colorData = colorThemeData.find(c => c.name === colorName)
    const colorEmoji = '🎨'

    toast.success(t('success'), {
      description: `${colorEmoji} ${t('theme.themeSaved')} - ${t(colorData?.label || '')}`,
      duration: 2000,
    })
    // }
  }

  const handleRadiusChange = (radiusValue: string) => {
    if (['0', '0.3rem', '0.5rem', '0.75rem'].includes(radiusValue)) {
      setRadius(radiusValue as Radius)

      const radiusData = radiusOptions.find(r => r.value === radiusValue)

      toast.success(t('success'), {
        description: `📐 ${t('theme.radiusSaved')} - ${t(radiusData?.label || '')}`,
        duration: 2000,
      })
    }
  }

  const handleResetToDefaults = async () => {
    setIsResetting(true)
    try {
      resetToDefaults()
      toast.success(t('success'), {
        description: '🔄 ' + t('theme.resetSuccess'),
        duration: 3000,
      })
    } catch (error) {
      toast.error(t('error'), {
        description: '❌ ' + t('theme.resetFailed'),
        duration: 3000,
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-6 pb-8">
      {/* Header Section */}
      <div className="space-y-1 px-4">
        <h2 className="text-2xl font-semibold tracking-tight">{t('theme.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('theme.description')}</p>
      </div>

      {/* Theme Mode Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/20">
              <Palette className="h-3 w-3 text-primary" />
            </div>
            <CardTitle className="text-lg">{t('theme.mode')}</CardTitle>
          </div>
          <CardDescription className="text-sm">{t('theme.modeDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <RadioGroup value={theme} onValueChange={handleThemeChange} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="relative">
              <RadioGroupItem value="light" id="light" className="peer sr-only" />
              <Label
                htmlFor="light"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 transition-all hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
              >
                <div className="mb-3 rounded-md bg-gradient-to-br from-orange-400 to-orange-600 p-2 text-white">
                  <Sun className="h-5 w-5" />
                </div>
                <span className="font-medium">{t('theme.light')}</span>
                <span className="mt-1 text-xs text-muted-foreground">{t('theme.lightDescription')}</span>
                {theme === 'light' && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />}
              </Label>
            </div>

            <div className="relative">
              <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
              <Label
                htmlFor="dark"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 transition-all hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
              >
                <div className="mb-3 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 p-2 text-white">
                  <Moon className="h-5 w-5" />
                </div>
                <span className="font-medium">{t('theme.dark')}</span>
                <span className="mt-1 text-xs text-muted-foreground">{t('theme.darkDescription')}</span>
                {theme === 'dark' && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />}
              </Label>
            </div>

            <div className="relative">
              <RadioGroupItem value="system" id="system" className="peer sr-only" />
              <Label
                htmlFor="system"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 transition-all hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
              >
                <div className="mb-3 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 p-2 text-white">
                  <Monitor className="h-5 w-5" />
                </div>
                <span className="font-medium">{t('theme.system')}</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {isSystemTheme ? `${t('theme.systemDescription')} (${resolvedTheme === 'dark' ? t('theme.dark') : t('theme.light')})` : t('theme.systemDescription')}
                </span>
                {theme === 'system' && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />}
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Color Theme Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
            </div>
            <CardTitle className="text-lg">{t('theme.color')}</CardTitle>
          </div>
          <CardDescription className="text-sm">{t('theme.colorDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {colorThemeData.map(color => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.name)}
                className={cn(
                  'group relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all duration-200 hover:scale-[1.02]',
                  colorTheme === color.name ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background hover:border-primary/50 hover:bg-accent/50',
                )}
                aria-label={color.label}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn('h-6 w-6 rounded-full border-2 shadow-sm transition-transform group-hover:scale-110', colorTheme === color.name ? 'border-white shadow-md' : 'border-border')}
                    style={{ background: color.dot }}
                  />
                  {colorTheme === color.name && <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />}
                </div>
                <span className="text-sm font-medium">{t(color.label)}</span>
                {colorTheme === color.name && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="18" height="18" x="3" y="3" rx="6" />
              </svg>
            </div>
            <CardTitle className="text-lg">{t('theme.radius')}</CardTitle>
          </div>
          <CardDescription className="text-sm">{t('theme.radiusDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <RadioGroup value={radius} onValueChange={handleRadiusChange} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {radiusOptions.map(option => (
              <div key={option.value} className="relative">
                <RadioGroupItem value={option.value} id={`radius-${option.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`radius-${option.value}`}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-4 transition-all hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                >
                  <div className="mb-3 border bg-muted p-3" style={{ borderRadius: option.value }}>
                    <div className="h-4 w-4 bg-primary/20" style={{ borderRadius: option.value }} />
                  </div>
                  <span className="text-sm font-medium">{t(option.label)}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                  {radius === option.value && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-3-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <CardTitle className="text-lg">{t('theme.preview')}</CardTitle>
          </div>
          <CardDescription className="text-sm">{t('theme.previewDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 rounded-lg border bg-card p-6" style={{ borderRadius: radius }}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold">{t('theme.dashboardPreview')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('theme.currentTheme')}: {t(colorThemeData.find(c => c.name === colorTheme)?.label || '')} • {resolvedTheme === 'dark' ? t('theme.dark') : t('theme.light')}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <div className="h-3 w-3 rounded-full bg-muted" />
                <div className="h-3 w-3 rounded-full bg-accent" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 rounded bg-primary" style={{ borderRadius: radius }} />
                <div className="h-4 rounded bg-muted" style={{ borderRadius: radius }} />
                <div className="h-4 rounded bg-accent" style={{ borderRadius: radius }} />
              </div>
              <div className="space-y-2">
                <div className="flex h-8 items-center rounded border bg-background px-3" style={{ borderRadius: radius }}>
                  <span className="text-sm text-muted-foreground">{t('theme.sampleInput')}</span>
                </div>
                <div className="flex h-8 items-center justify-center rounded bg-primary text-primary-foreground" style={{ borderRadius: radius }}>
                  <span className="text-sm font-medium">{t('theme.primaryButton')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">{t('theme.resetToDefaults')}</h4>
              <p className="text-sm text-muted-foreground">{t('theme.resetDescription')}</p>
            </div>
            <Button variant="outline" onClick={handleResetToDefaults} disabled={isResetting}>
              {isResetting ? t('theme.resetting') : t('theme.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
