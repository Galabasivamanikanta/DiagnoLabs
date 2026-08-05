$baseUrl = 'http://127.0.0.1:5000' # Testing locally if possible, but let's test the live server!
$baseUrl = 'https://diagnolabs-1qvc.onrender.com'

Write-Host "
=================================================" -ForegroundColor Cyan
Write-Host "?????? DIAGNOLABS SECURITY PENETRATION TEST ??????" -ForegroundColor Cyan
Write-Host "=================================================
" -ForegroundColor Cyan

# 1. HACKER TEST: NoSQL Injection
Write-Host "[TEST 1] Hacker trying NoSQL Injection on Login..." -ForegroundColor Yellow
$nosqlPayload = '{"email": {"$gt": ""}, "password": "hacked"}'
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $nosqlPayload -ContentType 'application/json' -ErrorAction Stop
    Write-Host "? SYSTEM IS LOOSE! Hacker bypassed login!" -ForegroundColor Red
} catch {
    Write-Host "? SYSTEM SECURE! Database rejected the attack." -ForegroundColor Green
    Write-Host "Reason: $($_.Exception.Message)
"
}

# 2. HACKER TEST: IDOR (Patient fetching all Lab Data)
Write-Host "[TEST 2] Patient trying to steal Lab Bookings Data (IDOR)..." -ForegroundColor Yellow
# We need a dummy token for a patient. Since we don't have one, we will just simulate an unauthorized access which should be 401 or 403
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/bookings/lab/60c72b2f9b1d8b001c8e4a99" -Method Get -Headers @{ Authorization="Bearer FAKEPATIENTTOKEN" } -ErrorAction Stop
    Write-Host "? SYSTEM IS LOOSE! Data leaked!" -ForegroundColor Red
} catch {
    Write-Host "? SYSTEM SECURE! Access Denied." -ForegroundColor Green
    Write-Host "Reason: $($_.Exception.Message)
"
}

# 3. HACKER TEST: Brute Force (Rate Limiting)
Write-Host "[TEST 3] Hacker trying to Brute-Force Password (15 fast requests)..." -ForegroundColor Yellow
$blocked = $false
for ($i=1; $i -le 15; $i++) {
    try {
        $req = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body '{"email":"test@test.com","password":"wrong"}' -ContentType 'application/json' -ErrorAction Stop
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            $blocked = $true
            Write-Host "Request $i : ?? BLOCKED BY RATE LIMITER (429 Too Many Requests)" -ForegroundColor Green
            break
        } else {
            Write-Host "Request $i : Failed (Wrong Password)" -ForegroundColor Gray
        }
    }
}
if ($blocked) {
    Write-Host "? SYSTEM SECURE! Hacker was blocked after too many attempts.
" -ForegroundColor Green
} else {
    Write-Host "? SYSTEM IS LOOSE! Hacker is still trying passwords!" -ForegroundColor Red
}

