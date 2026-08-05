$baseUrl = 'https://diagnolabs-1qvc.onrender.com'

function Test-Api {
    param($name, $method, $endpoint, $body)
    
    Write-Host "
==== Test: $name ===="
    
    $url = "$baseUrl$endpoint"
    $params = @{
        Uri = $url
        Method = $method
        ContentType = 'application/json'
        ErrorAction = 'SilentlyContinue'
    }
    
    if ($body) {
        $params.Body = ($body | ConvertTo-Json -Depth 10)
    }

    try {
        $response = Invoke-RestMethod @params -TimeoutSec 10
        Write-Host "SUCCESS: Request passed." -ForegroundColor Green
        Write-Host "Response: "
        $response | ConvertTo-Json -Depth 2 | Write-Host
    } catch {
        Write-Host "EXPECTED ERROR (Blackbox):" -ForegroundColor Yellow
        $errorDetails = $_.ErrorDetails.Message
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
        Write-Host "Body: $errorDetails"
    }
}

Test-Api -name 'Patient Login with Wrong Password' -method 'POST' -endpoint '/api/auth/login' -body @{ email='test@example.com'; password='wrongpassword123' }

Test-Api -name 'Admin Login with Invalid Employee ID' -method 'POST' -endpoint '/api/auth/admin-login' -body @{ employeeId='EMP-UNKNOWN'; password='password123' }

Test-Api -name 'Admin Provisioning with Missing Data' -method 'POST' -endpoint '/api/auth/admin-register' -body @{ email='staff@example.com' }

