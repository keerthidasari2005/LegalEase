$req = @{
    document_type = 'service_agreement'
    details = @{
        client_name = 'Amit Sharma'
        client_address = 'Flat 5B, 123 MG Road, New Delhi, 110001'
        client_email = 'amit.sharma@example.com'
        client_phone = '+91-9876543210'
        service_location = 'Flat 5B, 123 MG Road, New Delhi, 110001'
        plan_name = 'Fiber Premium'
        service_speed = '200 Mbps'
        data_limit = 'Unlimited'
        installation_date = '2026-03-01'
        total_amount = '999'
        advance_payment = '2000'
        remaining_due_date = '2026-03-10'
        payment_method = 'UPI'
        agreement_start_date = '2026-03-01'
        agreement_end_date = '2027-03-01'
        jurisdiction = 'New Delhi, Delhi'
    }
}

$req | ConvertTo-Json -Depth 6 | Out-File request.json -Encoding UTF8
Write-Host 'Posting to http://localhost:5000/generate ...'

try {
    $res = Invoke-RestMethod -Uri 'http://localhost:5000/generate' -Method Post -Body (Get-Content -Raw request.json) -ContentType 'application/json' -ErrorAction Stop
} catch {
    Write-Host 'Request failed:' $_.Exception.Message
    exit 1
}

$res | ConvertTo-Json -Depth 5 | Out-File generate_response.json -Encoding UTF8

if ($res.success) {
    $res.document_text | Out-File generated_doc.txt -Encoding UTF8
    Write-Host 'SUCCESS: document_text saved to generated_doc.txt'
} else {
    Write-Host 'ERROR:' $res.error
    exit 1
}

$match = Select-String -Path generated_doc.txt -Pattern '\[','Witness','Witnesses' -SimpleMatch -ErrorAction SilentlyContinue
if ($match) {
    Write-Host 'FOUND potential placeholders/witness references:'
    $match | ForEach-Object { Write-Host $_.Line }
} else {
    Write-Host 'No placeholders or witness references found in generated_doc.txt'
}

Write-Host 'Attempting to download .docx as generated_service_agreement.docx ...'

try {
    $gen = Get-Content -Raw generate_response.json | ConvertFrom-Json
    $payload = @{ document_type = $gen.document_type; document_text = $gen.document_text } | ConvertTo-Json -Depth 6
    Invoke-WebRequest -Uri 'http://localhost:5000/download-doc' -Method Post -Body $payload -ContentType 'application/json' -OutFile generated_service_agreement.docx -ErrorAction Stop
    if (Test-Path generated_service_agreement.docx) { Write-Host 'Downloaded file: generated_service_agreement.docx' } else { Write-Host 'Download failed' }
} catch {
    Write-Host 'Download failed:' $_.Exception.Message
    exit 1
}
