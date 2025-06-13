Write-Host "🧹 Cleaning Expo / Gradle caches..."
Remove-Item -Recurse -Force .gradle, .expo, .expo-shared, .\android\.gradle -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:Temp\eas-cli-nodejs" -ErrorAction SilentlyContinue
Write-Host "✅ Clean complete!"
