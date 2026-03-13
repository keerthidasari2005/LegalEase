$req = @{
    document_type = 'employment_contract'
    details = @{
        employer_name = 'Acme Solutions Pvt. Ltd.'
        employee_name = 'Rekha Kumar, daughter of Fictional Parent, residing at No. 123, Gandhi Nagar, Ballari, Karnataka, India - 58310'
        position = 'Software Engineer'
        start_date = '2026-03-01'
        salary = 'INR 600000 per annum'
        work_location = 'Bengaluru, Karnataka'
        employment_type = 'Full-Time'
        authorized_signatory_name = 'Sanjay Mehta'
        authorized_signatory_designation = 'HR Manager'
    }
}

$req | ConvertTo-Json -Depth 6 | Out-File request_employment.json -Encoding UTF8
Write-Host 'Posting to http://localhost:5000/generate ...'

try {
    $res = Invoke-RestMethod -Uri 'http://localhost:5000/generate' -Method Post -Body (Get-Content -Raw request_employment.json) -ContentType 'application/json' -ErrorAction Stop
} catch {
    Write-Host 'Request failed:' $_.Exception.Message
    exit 1
}

$res | ConvertTo-Json -Depth 5 | Out-File generate_response_employment.json -Encoding UTF8

if ($res.success) {
    $res.document_text | Out-File generated_employment_doc.txt -Encoding UTF8
    Write-Host 'SUCCESS: document_text saved to generated_employment_doc.txt'
} else {
    Write-Host 'ERROR:' $res.error
    exit 1
}

# Scan for the specific address and any bracketed placeholders
$patterns = @('No. 123, Gandhi Nagar, Ballari, Karnataka, India - 58310','Gandhi Nagar, Ballari, Karnataka, India - 58310','\[.*\]')
$found = $false
foreach ($pat in $patterns) {
    $match = Select-String -Path generated_employment_doc.txt -Pattern $pat -SimpleMatch -ErrorAction SilentlyContinue
    if ($match) { Write-Host "FOUND pattern '$pat':"; $match | ForEach-Object { Write-Host $_.Line }; $found = $true }
}
if (-not $found) { Write-Host 'No unwanted address or bracketed placeholders found in generated_employment_doc.txt' }

# Attempt to download .docx
Write-Host 'Attempting to download employment .docx as generated_employment_contract.docx ...'
try {
    $gen = Get-Content -Raw generate_response_employment.json | ConvertFrom-Json
    $payload = @{ document_type = $gen.document_type; document_text = $gen.document_text } | ConvertTo-Json -Depth 6
    Invoke-WebRequest -Uri 'http://localhost:5000/download-doc' -Method Post -Body $payload -ContentType 'application/json' -OutFile generated_employment_contract.docx -ErrorAction Stop
    if (Test-Path generated_employment_contract.docx) { Write-Host 'Downloaded file: generated_employment_contract.docx' } else { Write-Host 'Download failed' }
} catch {
    Write-Host 'Download failed:' $_.Exception.Message
    exit 1
}
