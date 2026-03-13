$genJsonPath = 'c:\Users\ASUS\OneDrive\Desktop\desare2\generate_response.json'
if (-Not (Test-Path $genJsonPath)) { Write-Host "generate_response.json not found at $genJsonPath"; exit 1 }
$genJson = Get-Content -Raw $genJsonPath
$gen = ConvertFrom-Json $genJson
$payload = @{ document_type = $gen.document_type; document_text = $gen.document_text } | ConvertTo-Json -Depth 6
$outPath = 'c:\Users\ASUS\OneDrive\Desktop\desare2\generated_service_agreement.docx'
try {
    Invoke-WebRequest -Uri 'http://localhost:5000/download-doc' -Method Post -Body $payload -ContentType 'application/json' -OutFile $outPath -ErrorAction Stop
    if (Test-Path $outPath) { Write-Host "Downloaded file: $outPath" } else { Write-Host 'Download failed' }
} catch {
    Write-Host 'Download failed:' $_.Exception.Message
    exit 1
}
