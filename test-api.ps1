$base = "http://127.0.0.1:4000/api"
$pass = 0; $fail = 0
function Check($name, $ok, $detail) {
  if ($ok) { $script:pass++; Write-Host "PASS  $name" }
  else { $script:fail++; Write-Host "FAIL  $name  --> $detail" }
}

# 1. Health
$r = Invoke-RestMethod "$base/health" -TimeoutSec 5
Check "Health check" ($r.ok -eq $true) ($r | ConvertTo-Json -Compress)

# 2. Products list
$products = Invoke-RestMethod "$base/products" -TimeoutSec 5
Check "Products list (8 items)" ($products.Count -eq 8) "count=$($products.Count)"

# 3. Product detail
$p1 = Invoke-RestMethod "$base/products/p1" -TimeoutSec 5
Check "Product detail p1" ($p1.name -eq "Aurora Wireless Headphones") ($p1 | ConvertTo-Json -Compress)

# 4. Product 404
try { Invoke-RestMethod "$base/products/xyz" -TimeoutSec 5; Check "Product 404" $false "no error" }
catch { Check "Product 404" ($_.Exception.Response.StatusCode.value__ -eq 404) "status=$($_.Exception.Response.StatusCode.value__)" }

# 5. Categories
$cats = Invoke-RestMethod "$base/products/categories" -TimeoutSec 5
Check "Categories" ($cats -contains "Audio" -and $cats -contains "Apparel") ($cats -join ",")

# 6. Search / filter
$search = Invoke-RestMethod "$base/products?q=headphones" -TimeoutSec 5
Check "Search q=headphones" ($search.Count -ge 1) "count=$($search.Count)"
$byCat = Invoke-RestMethod "$base/products?category=Wearables" -TimeoutSec 5
Check "Filter category=Wearables" ($byCat.Count -ge 1) "count=$($byCat.Count)"

# 7. Login - demo customer
$login = Invoke-RestMethod -Method Post "$base/auth/login" -ContentType "application/json" -Body (@{email="demo@aurora.dev";password="demo123"} | ConvertTo-Json) -TimeoutSec 5
Check "Login demo customer" ($null -ne $login.token -and $login.user.role -eq "customer") ($login | ConvertTo-Json -Compress)
$demoToken = $login.token

# 8. Login - admin
$adminLogin = Invoke-RestMethod -Method Post "$base/auth/login" -ContentType "application/json" -Body (@{email="admin@aurora.dev";password="admin123"} | ConvertTo-Json) -TimeoutSec 5
Check "Login admin" ($adminLogin.user.role -eq "admin") ($adminLogin | ConvertTo-Json -Compress)
$adminToken = $adminLogin.token

# 9. Wrong password rejected
try { Invoke-RestMethod -Method Post "$base/auth/login" -ContentType "application/json" -Body (@{email="demo@aurora.dev";password="wrong"} | ConvertTo-Json) -TimeoutSec 5; Check "Wrong password rejected" $false "no error" }
catch { Check "Wrong password rejected" ($_.Exception.Response.StatusCode.value__ -eq 401) "status=$($_.Exception.Response.StatusCode.value__)" }

# 10. /me with token
$me = Invoke-RestMethod "$base/auth/me" -Headers @{Authorization="Bearer $demoToken"} -TimeoutSec 5
Check "GET /me (auth)" ($me.user.email -eq "demo@aurora.dev") ($me | ConvertTo-Json -Compress)

# 11. /me without token rejected
try { Invoke-RestMethod "$base/auth/me" -TimeoutSec 5; Check "GET /me without token rejected" $false "no error" }
catch { Check "GET /me without token rejected" ($_.Exception.Response.StatusCode.value__ -eq 401) "status=$($_.Exception.Response.StatusCode.value__)" }

# 12. Register new user
$testEmail = "test$([DateTime]::Now.Ticks)@test.dev"
$reg = Invoke-RestMethod -Method Post "$base/auth/register" -ContentType "application/json" -Body (@{name="Test User";email=$testEmail;password="test123"} | ConvertTo-Json) -TimeoutSec 5
Check "Register new user" ($null -ne $reg.token -and $reg.user.role -eq "customer") ($reg | ConvertTo-Json -Compress)
$newToken = $reg.token

# 13. Duplicate email rejected
try { Invoke-RestMethod -Method Post "$base/auth/register" -ContentType "application/json" -Body (@{name="Dup";email=$testEmail;password="test123"} | ConvertTo-Json) -TimeoutSec 5; Check "Duplicate email rejected" $false "no error" }
catch { Check "Duplicate email rejected" ($_.Exception.Response.StatusCode.value__ -eq 409) "status=$($_.Exception.Response.StatusCode.value__)" }

# 14. Short password rejected
try { Invoke-RestMethod -Method Post "$base/auth/register" -ContentType "application/json" -Body (@{name="Short";email="s@s.dev";password="123"} | ConvertTo-Json) -TimeoutSec 5; Check "Short password rejected" $false "no error" }
catch { Check "Short password rejected" ($_.Exception.Response.StatusCode.value__ -eq 400) "status=$($_.Exception.Response.StatusCode.value__)" }

# 15. Place order as new user
$orderBody = @{
  items = @(@{productId="p1"; qty=1}, @{productId="p6"; qty=2})
  shipping = @{name="Test User"; address="123 Main St"; city="Karachi"}
} | ConvertTo-Json -Depth 5
$order = Invoke-RestMethod -Method Post "$base/orders" -ContentType "application/json" -Headers @{Authorization="Bearer $newToken"} -Body $orderBody -TimeoutSec 5
$expectedSubtotal = ($products | Where-Object id -eq "p1").price * 1 + ($products | Where-Object id -eq "p6").price * 2
Check "Place order (created)" ($null -ne $order.id) ($order | ConvertTo-Json -Compress)
Check "Order subtotal correct" ($order.subtotal -eq $expectedSubtotal) "subtotal=$($order.subtotal) expected=$expectedSubtotal"
Check "Free shipping over 100" ($order.shippingFee -eq 0) "shippingFee=$($order.shippingFee)"
Check "Order total = subtotal + tax" ([math]::Abs($order.total - ($order.subtotal + $order.tax)) -lt 0.01) "total=$($order.total)"
$orderId = $order.id

# 16. Empty cart rejected
try { Invoke-RestMethod -Method Post "$base/orders" -ContentType "application/json" -Headers @{Authorization="Bearer $newToken"} -Body (@{items=@();shipping=@{name="x";address="y";city="z"}} | ConvertTo-Json -Depth 5) -TimeoutSec 5; Check "Empty cart rejected" $false "no error" }
catch { Check "Empty cart rejected" ($_.Exception.Response.StatusCode.value__ -eq 400) "status=$($_.Exception.Response.StatusCode.value__)" }

# 17. Orders without auth rejected
try { Invoke-RestMethod "$base/orders" -TimeoutSec 5; Check "Orders without auth rejected" $false "no error" }
catch { Check "Orders without auth rejected" ($_.Exception.Response.StatusCode.value__ -eq 401) "status=$($_.Exception.Response.StatusCode.value__)" }

# 18. My orders visible
$myOrders = Invoke-RestMethod "$base/orders" -Headers @{Authorization="Bearer $newToken"} -TimeoutSec 5
Check "User sees own order" ($myOrders.Count -eq 1 -and $myOrders[0].id -eq $orderId) "count=$($myOrders.Count)"

# 19. Stock decremented
$p1after = Invoke-RestMethod "$base/products/p1" -TimeoutSec 5
$stockBefore = ($products | Where-Object id -eq "p1").stock
Check "Stock decremented after order" ($p1after.stock -eq ($stockBefore - 1)) "before=$stockBefore after=$($p1after.stock)"

# 20. Oversell rejected
try { Invoke-RestMethod -Method Post "$base/orders" -ContentType "application/json" -Headers @{Authorization="Bearer $newToken"} -Body (@{items=@(@{productId="p7"; qty=999}); shipping=@{name="x";address="y";city="z"}} | ConvertTo-Json -Depth 5) -TimeoutSec 5; Check "Oversell rejected" $false "no error" }
catch { Check "Oversell rejected" ($_.Exception.Response.StatusCode.value__ -eq 400) "status=$($_.Exception.Response.StatusCode.value__)" }

# 21. Admin sees all orders
$allOrders = Invoke-RestMethod "$base/orders" -Headers @{Authorization="Bearer $adminToken"} -TimeoutSec 5
Check "Admin sees all orders" ($allOrders.Count -ge $myOrders.Count) "admin sees $($allOrders.Count), user has $($myOrders.Count)"

# 22. Customer cannot add product
try { Invoke-RestMethod -Method Post "$base/products" -ContentType "application/json" -Headers @{Authorization="Bearer $newToken"} -Body (@{name="Hack";category="X";price=1} | ConvertTo-Json) -TimeoutSec 5; Check "Customer cannot add product" $false "no error" }
catch { Check "Customer cannot add product" ($_.Exception.Response.StatusCode.value__ -eq 403) "status=$($_.Exception.Response.StatusCode.value__)" }

# 23. Admin adds product
$newProd = Invoke-RestMethod -Method Post "$base/products" -ContentType "application/json" -Headers @{Authorization="Bearer $adminToken"} -Body (@{name="QA Test Gadget";category="Testing";price=49.99;stock=5;description="temp"} | ConvertTo-Json) -TimeoutSec 5
Check "Admin adds product" ($newProd.id -like "p-*") ($newProd | ConvertTo-Json -Compress)

# 24. Admin updates product
$upd = Invoke-RestMethod -Method Put "$base/products/$($newProd.id)" -ContentType "application/json" -Headers @{Authorization="Bearer $adminToken"} -Body (@{price=39.99} | ConvertTo-Json) -TimeoutSec 5
Check "Admin updates product price" ($upd.price -eq 39.99) "price=$($upd.price)"

# 25. Admin deletes product
$del = Invoke-RestMethod -Method Delete "$base/products/$($newProd.id)" -Headers @{Authorization="Bearer $adminToken"} -TimeoutSec 5
Check "Admin deletes product" ($del.ok -eq $true) ($del | ConvertTo-Json -Compress)

# 26. Admin updates order status
$updOrder = Invoke-RestMethod -Method Patch "$base/orders/$orderId/status" -ContentType "application/json" -Headers @{Authorization="Bearer $adminToken"} -Body (@{status="shipped"} | ConvertTo-Json) -TimeoutSec 5
Check "Admin updates order status" ($updOrder.status -eq "shipped") "status=$($updOrder.status)"

# 27. Frontend served
$web = Invoke-WebRequest "http://[::1]:5173" -UseBasicParsing -TimeoutSec 5
Check "Frontend served (200)" ($web.StatusCode -eq 200) "status=$($web.StatusCode)"

# 28. Frontend proxy /api -> backend
$proxy = Invoke-RestMethod "http://[::1]:5173/api/health" -TimeoutSec 5
Check "Vite proxy /api works" ($proxy.ok -eq $true) ($proxy | ConvertTo-Json -Compress)

Write-Host ""
Write-Host "RESULT: $pass passed, $fail failed" -ForegroundColor $(if ($fail -eq 0) {"Green"} else {"Red"})
