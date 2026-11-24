<#
.SYNOPSIS
    Wrapper (gam-engineering): runs merge.mjs, the merge script, with every argument given.

.DESCRIPTION
    The merge script is the Node script merge.mjs next to this file, so it runs the same on Windows, macOS, and Linux. This
    wrapper stays for one migration: a person or a document that still calls merge.ps1 keeps working. It does nothing but
    forward the arguments (-Branch or the branch as the first word, -Release, -Via, -NotesFile, -SkipDocCheck,
    -AllowClosingKeywords, -Yes, -WaitSeconds, -PollSeconds, -LogFile, which the script reads as it reads --branch,
    --release, --via, and so on) and the exit code. Call the script itself:
        node gam-engineering/tools/merge.mjs <branch> [--via Host]
        node gam-engineering/tools/merge.mjs --release <version> [--via Host] [--notes-file <file>]
    A later release removes this wrapper.
#>
$script = Join-Path $PSScriptRoot 'merge.mjs'
if (-not (Get-Command -Name node -CommandType Application -ErrorAction SilentlyContinue)) {
    [Console]::Error.WriteLine('merge.ps1: node was not found on the search path; the merge script needs Node (node gam-engineering/tools/merge.mjs).')
    exit 1
}
# Windows PowerShell 5.1 drops an empty argument when it starts a program; "-LogFile ''" (the log off) is forwarded as "-LogFile=".
$forward = New-Object System.Collections.Generic.List[string]
foreach ($word in $args) {
    if ($word -eq '' -and $forward.Count -gt 0 -and $forward[$forward.Count - 1] -match '^--?[A-Za-z][A-Za-z-]*$') {
        $forward[$forward.Count - 1] += '='
    } else {
        $forward.Add($word)
    }
}
& node $script @forward
exit $LASTEXITCODE
