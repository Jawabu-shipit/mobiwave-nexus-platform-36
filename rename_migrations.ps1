Get-ChildItem -Path "supabase/migrations" -Filter "*-*.sql" | ForEach-Object {
  $newName = $_.Name -replace '(\d+)-', '$1_'
  Rename-Item -Path $_.FullName -NewName $newName
  Write-Host "Renamed '$($_.Name)' to '$newName'"
}