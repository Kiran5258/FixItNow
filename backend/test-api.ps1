# FixItNow API Test Script for Windows PowerShell
# Run this script from PowerShell to test your Auth APIs

$baseUrl = "http://localhost:8081/api/auth"

Write-Host "=== FixItNow API Testing Script ===" -ForegroundColor Green
Write-Host "Testing endpoints: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Function to make HTTP requests
function Invoke-ApiTest {
    param(
        [string]$Endpoint,
        [string]$Method,
        [string]$Body,
        [string]$Description
    )
    
    Write-Host "🧪 Testing: $Description" -ForegroundColor Cyan
    Write-Host "URL: $Method $baseUrl$Endpoint" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Body $Body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ SUCCESS:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
    }
    catch {
        Write-Host "❌ ERROR:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Yellow
        }
    }
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
}

# Registration Tests
Write-Host "=== REGISTRATION TESTS ===" -ForegroundColor Magenta

# Test 1: Register Customer
$customerData = @{
    name = "John Doe"
    email = "john.doe@example.com"
    password = "password123"
    role = "CUSTOMER"
    location = "New York, NY"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/register" -Method "POST" -Body $customerData -Description "Register Customer"

# Test 2: Register Provider (without initial service)
$providerData = @{
    name = "Jane Smith"
    email = "jane.smith@example.com"
    password = "password123"
    role = "PROVIDER"
    location = "Los Angeles, CA"
    skills = "Plumbing, electrical work"
    serviceArea = "LA County"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/register" -Method "POST" -Body $providerData -Description "Register Provider (no initial service)"

# Test 3: Register Provider (with initial service)
$providerWithServiceData = @{
    name = "Mike Johnson New"
    email = "mike.johnson.new@example.com"
    password = "password123"
    role = "PROVIDER"
    location = "Chicago, IL"
    category = "Home Repair"
    subcategory = "Plumbing"
    skills = "Expert plumber with 10 years experience"
    serviceArea = "Chicago Metro Area"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/register" -Method "POST" -Body $providerWithServiceData -Description "Register Provider (with initial service)"

# Test 4: Register Admin
$adminData = @{
    name = "Admin User"
    email = "admin@fixitnow.com"
    password = "admin123"
    role = "ADMIN"
    location = "Head Office"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/register" -Method "POST" -Body $adminData -Description "Register Admin"

# Test 5: Duplicate email registration (should fail)
$duplicateData = @{
    name = "Another John"
    email = "john.doe@example.com"  # Same email as first test
    password = "password456"
    role = "CUSTOMER"
    location = "Boston, MA"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/register" -Method "POST" -Body $duplicateData -Description "Register with duplicate email (should fail)"

# LOGIN TESTS
Write-Host "=== LOGIN TESTS ===" -ForegroundColor Magenta

# Test 1: Login as Customer
$customerLogin = @{
    email = "john.doe@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/login" -Method "POST" -Body $customerLogin -Description "Login as Customer"

# Test 2: Login as Provider
$providerLogin = @{
    email = "jane.smith@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/login" -Method "POST" -Body $providerLogin -Description "Login as Provider"

# Test 3: Login as Admin
$adminLogin = @{
    email = "admin@fixitnow.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/login" -Method "POST" -Body $adminLogin -Description "Login as Admin"

# Test 4: Invalid password
$invalidPasswordLogin = @{
    email = "john.doe@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/login" -Method "POST" -Body $invalidPasswordLogin -Description "Login with invalid password (should fail)"

# Test 5: Non-existent user
$nonexistentLogin = @{
    email = "nonexistent@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-ApiTest -Endpoint "/login" -Method "POST" -Body $nonexistentLogin -Description "Login with non-existent user (should fail)"

Write-Host "=== TEST COMPLETED ===" -ForegroundColor Green
Write-Host "If all tests passed, your Auth APIs are working correctly!" -ForegroundColor Yellow