# Download espeak-ng from SourceForge
$url = "https://sourceforge.net/projects/espeak-ng/files/espeak-ng-win/espeak-ng-20171128/espeak-ng-x64.msi/download"
$output = "espeak-ng-x64.msi"

Write-Host "Downloading espeak-ng..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$webClient = New-Object System.Net.WebClient
$webClient.DownloadFile($url, $output)

Write-Host "Installing espeak-ng..."
Start-Process msiexec.exe -Wait -ArgumentList "/i $output /quiet"

Write-Host "Cleaning up..."
Remove-Item $output

Write-Host "espeak-ng installation completed"

# Add espeak-ng to PATH
$espeakPath = "C:\Program Files\eSpeak NG"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if (-not $currentPath.Contains($espeakPath)) {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$espeakPath", "Machine")
    Write-Host "Added espeak-ng to system PATH"
}
