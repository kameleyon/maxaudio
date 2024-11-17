# Download Python 3.9.13 installer
$url = "https://www.python.org/ftp/python/3.9.13/python-3.9.13-amd64.exe"
$output = "$PSScriptRoot\python-3.9.13-amd64.exe"

Write-Host "Downloading Python 3.9.13..."
Invoke-WebRequest -Uri $url -OutFile $output

# Install Python 3.9.13 with pip and add to PATH
Write-Host "Installing Python 3.9.13..."
Start-Process -FilePath $output -ArgumentList "/quiet", "InstallAllUsers=1", "PrependPath=1", "Include_pip=1" -Wait

# Clean up installer
Remove-Item $output

# Verify installation
Write-Host "Verifying Python 3.9.13 installation..."
$python39Path = "C:\Python39\python.exe"
if (Test-Path $python39Path) {
    Write-Host "Python 3.9.13 installed successfully!"
    
    # Create virtual environment for the project
    Write-Host "Creating virtual environment..."
    & $python39Path -m venv "$PSScriptRoot\..\venv39"
    
    # Activate virtual environment and install requirements
    Write-Host "Installing requirements..."
    & "$PSScriptRoot\..\venv39\Scripts\activate.ps1"
    & "$PSScriptRoot\..\venv39\Scripts\pip.exe" install -r "$PSScriptRoot\..\requirements.txt"
    
    Write-Host "Setup complete! Use 'venv39\Scripts\activate.ps1' to activate the virtual environment."
} else {
    Write-Host "Error: Python 3.9.13 installation failed."
    exit 1
}
