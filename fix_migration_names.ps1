Get-ChildItem -Path "supabase/migrations" -Filter "*_*.sql" | ForEach-Object {
  $newName = $_.Name -replace '(\d+)_', '$1-'
  $newName = $newName -replace '(\d+)-', '$1_'
  if ($_.Name -ne $newName) {
    Rename-Item -Path $_.FullName -NewName $newName
    Write-Host "Renamed '$($_.Name)' to '$newName'"
  }
}