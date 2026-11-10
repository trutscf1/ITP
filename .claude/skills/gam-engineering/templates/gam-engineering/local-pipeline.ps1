<#
.SYNOPSIS
    Local pipeline (gam-engineering): runs every check recorded in gam-engineering/pipeline.json.

.DESCRIPTION
    Copied into the project by /gam-engineering pipeline (P-PIPE-1); do not edit it per project - a new check
    changes the decision or the check catalog, never this script.
      - reads the decision gam-engineering/pipeline.json and the catalog gam-engineering/tools/pipeline-catalog.json
      - runs each recorded check in order: lint, tests, and the catalog's projectCommand kinds (stack-lint, custom) as
        their recorded command line, every other kind with the catalog's calls for its kind and language
      - cwd of a check (PP-F-32): a project command runs in that folder; a catalog call gets --cwd=<folder> through
        {cwdFlag}; {versionFlag} becomes --version=<version>, {checkIndex} the place of the check in pipeline.json
      - lintOnCommitted on a lint or format check (PP-F-40) runs it through gam-engineering/tools/committed-copy.mjs, on
        the committed state with LF line endings
      - a check whose tool is not on the search path fails with the catalog's install hint; a check that needs a
        container is skipped when no container runtime answers (docker info), which is red only at location local
      - flow quick (env.GAM_ENGINEERING_FLOW in .claude/settings.json, P-PIPE-3): runs nothing when no changed file has
        an extension in the catalog's codeExtensions, otherwise only the checks of kind tests, architecture, limits, guard,
        format, and types (PP-F-23); -ChangedFiles names the changed files instead of asking git (tests)
      - flow full, tier merge, docsOnly not 'full' in pipeline.json (P-PIPE-6, PP-F-49): when every changed file is a document
        (the catalog's docsOnly: document path, no code extension, no stack file, not in a data folder) only the checks of
        the catalog's docsOnly kinds run; the others show as 'skipped by choice' with the reason. Git unable to answer, no
        changed file, or one doubtful file gives the full run
      - -Tier merge|release (default merge, PP-F-27): release runs every check, merge only the checks whose catalog tier is
        merge; lint and tests are always merge. The release command calls the runner with -Tier release
      - -Skip <kind>[,<kind>] leaves out the checks of those kinds; the report shows them as 'skipped by choice', which is not red (PP-F-26)
      - a call whose exit code is the catalog entry's skipExit makes the state 'not run', which is not red (PP-F-25)
      - writes one folder per run, gam-engineering/reports/local-pipeline/<yyyy-MM-dd-HHmmss>/ (git-ignored, PP-F-28): report.md
        with the overview table and one link per check, and <kind>-<tool>.md with the output of each check; the last 10
        folders are kept, older ones are deleted. The folder exists from the start (PP-F-46): report.md ends with
        'running' and shows each check waiting, running since, or its result; an output file appears as soon as its check
        ends, and a running check of a parallel run writes its output to <kind>-<tool>.running.txt. No time limit
    Exit code 0 (green) only when every check passed, or was skipped while the location is both; otherwise 1 (red).
      - -Jobs <n> runs up to n checks at the same time (PP-F-43), each in its own PowerShell process; the default is
        GAM_PIPELINE_JOBS, else the number of processors, at most 4; -Jobs 1 runs them one after the other in this
        process. A check waits for the checks of the kinds its catalog entry or the decision names in after (the
        SonarQube scan after the tests). A console shows one live table (check, state, seconds); without one, a line per
        change. The report keeps the decision's order and adds the seconds of each check
      - the sast checks of several languages run as one semgrep call with every rule set, so the repo is read once
    Runs the same under Windows PowerShell 5.1 and PowerShell 7.

.EXAMPLE
    pwsh -File gam-engineering/local-pipeline.ps1
#>
[CmdletBinding()]
param(
    [string[]]$ChangedFiles, [string[]]$Skip, [ValidateSet('merge', 'release')][string]$Tier = 'merge', [int]$Jobs = 0,
    # Internal: one check run by a parallel run in its own process; the result goes to -ResultPath as JSON.
    [int]$RunIndex = -1, [string]$ResultPath = '', [string]$GroupIndexes = ''
)
$ErrorActionPreference = 'Continue'
$script:changedGiven = $PSBoundParameters.ContainsKey('ChangedFiles')
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot

# {docCheck} is the project's copy of doc-check: gam-ai-knowledge/tools/, or a former folder in a project not yet moved
# (P-DOC-10, P-DOC-11).
$docCheck = @('gam-ai-knowledge/tools/doc-check.mjs', 'gam-engineering/tools/doc-check.mjs', 'humanengineering/tools/doc-check.mjs' |
    Where-Object { Test-Path -LiteralPath (Join-Path $repoRoot $_) })[0]
if (-not $docCheck) { $docCheck = 'gam-ai-knowledge/tools/doc-check.mjs' }
$utf8 = New-Object System.Text.UTF8Encoding $false
$dash = [string][char]0x2014

function Read-Json([string]$path) {
    return [System.IO.File]::ReadAllText($path, $utf8) | ConvertFrom-Json
}

# The flow of the project: quick only when .claude/settings.json says so; anything else, or a file that cannot be read, is full.
function Get-Flow {
    $path = Join-Path $repoRoot '.claude/settings.json'
    if (-not (Test-Path -LiteralPath $path)) { return 'full' }
    try { $flow = (Read-Json $path).env.GAM_ENGINEERING_FLOW } catch { return 'full' }
    if ("$flow" -eq 'quick') { return 'quick' }
    return 'full'
}

# The files changed against the integration branch and the upstream, plus uncommitted and untracked ones; $null when git
# cannot name them (A126): the caller then counts every file as changed.
function Get-GitLines([string[]]$gitArgs) {
    $lines = & git @gitArgs 2>$null
    if ($LASTEXITCODE -ne 0) { return $null }
    return @($lines | Where-Object { $_ })
}

function Get-ChangedFiles {
    # With -File a list arrives as one comma-separated string.
    if ($script:changedGiven) { return @($ChangedFiles | ForEach-Object { $_ -split ',' } | Where-Object { $_ }) }
    if (-not (Test-Application 'git')) { return $null }
    $status = Get-GitLines @('status', '--porcelain', '--untracked-files=all')
    if ($null -eq $status) { return $null }
    # A rename lists both names, so a test renamed to a non-code name still counts as a changed code file.
    $files = @($status | ForEach-Object { ($_.Substring(3) -split ' -> ') | ForEach-Object { $_.Trim('"') } })
    $branches = ''
    $settings = Join-Path $repoRoot '.claude/settings.json'
    if (Test-Path -LiteralPath $settings) { try { $branches = (Read-Json $settings).env.GAM_ENGINEERING_BRANCHES } catch { } }
    $integration = if ("$branches" -eq 'trunk') { 'main' } else { 'dev' }
    $current = Get-GitLines @('rev-parse', '--abbrev-ref', 'HEAD')
    $upstream = Get-GitLines @('rev-parse', '--abbrev-ref', '@{u}')
    $bases = @()
    if ($current -and "$current" -ne $integration) { $bases += $integration }
    if ($upstream) { $bases += $upstream }
    if ($bases.Count -eq 0) { return $null }
    foreach ($base in $bases) {
        $diff = Get-GitLines @('diff', '--name-only', '--no-renames', "$base...HEAD")
        if ($null -eq $diff) { return $null }
        $files += $diff
    }
    return @($files | Select-Object -Unique)
}

# The weakening guard cannot be dropped silently (P-PIPE-7): when the integration branch records the check and this
# decision does not, it runs anyway and reports the removed check.
function Get-DroppedGuard($checks) {
    if ($script:changedGiven -or -not (Test-Application 'git')) { return $null }
    if (@($checks | Where-Object { $_.kind -eq 'guard' }).Count -gt 0) { return $null }
    $branches = ''
    $settings = Join-Path $repoRoot '.claude/settings.json'
    if (Test-Path -LiteralPath $settings) { try { $branches = (Read-Json $settings).env.GAM_ENGINEERING_BRANCHES } catch { } }
    $candidates = if ("$branches" -eq 'trunk') { @('main', 'master', 'origin/main', 'origin/master') } else { @('dev', 'main', 'master', 'origin/dev', 'origin/main') }
    $recorded = $null
    foreach ($candidate in $candidates) {
        $shown = & git show "$($candidate):gam-engineering/pipeline.json" 2>$null
        if ($LASTEXITCODE -eq 0) { $recorded = "$($shown -join ' ')"; break }
    }
    if (-not $recorded -or $recorded -notmatch '"kind"[ ]*:[ ]*"guard"') { return $null }
    return [pscustomobject]@{ kind = 'guard'; language = ''; tool = 'floor-guard'; threshold = ''; native = $false }
}

# Slim pipeline (P-PIPE-3): the checks to run and a note, or the note alone when no code changed.
function Select-QuickChecks($checks, $catalog) {
    $extensions = @($catalog.codeExtensions | ForEach-Object { "$_".ToLowerInvariant() })
    $changed = Get-ChangedFiles
    if ($null -ne $changed) {
        # The decision itself counts as code: loosening it is what the weakening guard reads (P-PIPE-7).
        $code = @($changed | Where-Object { ($extensions -contains [System.IO.Path]::GetExtension($_).ToLowerInvariant()) -or ($_.Replace([string][char]92, '/') -eq 'gam-engineering/pipeline.json') })
        if ($code.Count -eq 0) { return @{ Checks = @(); Note = 'flow quick: no code changed, no check run' } }
    }
    # The short test, the architecture checks, and the formatter and type checks (PP-F-23); every other kind waits for the full flow.
    $selected = @($checks | Where-Object { @('tests', 'architecture', 'limits', 'format', 'types', 'guard') -contains $_.kind })
    $hasTest = @($selected | Where-Object { $_.kind -eq 'tests' }).Count -gt 0
    $hasArchitecture = @($selected | Where-Object { @('architecture', 'limits') -contains $_.kind }).Count -gt 0
    $hasGuard = @($selected | Where-Object { $_.kind -eq 'guard' }).Count -gt 0
    $guardNote = if ($hasGuard) { ' (plus the weakening guard)' } else { '' }
    if ($selected.Count -eq 0) { return @{ Checks = @(); Note = 'flow quick: code changed, but no short test is recorded (kind tests)' } }
    if (-not $hasTest -and -not $hasArchitecture) { return @{ Checks = $selected; Note = 'flow quick: code changed, only the weakening guard ran; no short test is recorded (kind tests)' } }
    if (-not $hasArchitecture) { return @{ Checks = $selected; Note = "flow quick: code changed, only the short test ran$guardNote" } }
    if (-not $hasTest) { return @{ Checks = $selected; Note = "flow quick: code changed, the architecture checks ran$guardNote; no short test is recorded (kind tests)" } }
    return @{ Checks = $selected; Note = "flow quick: code changed, the short test and the architecture checks ran$guardNote" }
}

# Docs-only run (P-PIPE-6): true only when git names at least one changed file and every one is a document. One doubtful file
# (code, stack file, data folder, anything outside the document paths) makes it false, and so the run full.
function Test-DocsOnly($catalog) {
    $changed = Get-ChangedFiles
    if ($null -eq $changed -or @($changed).Count -eq 0) { return $false }
    $rules = $catalog.docsOnly
    $extensions = @($catalog.codeExtensions | ForEach-Object { "$_".ToLowerInvariant() })
    foreach ($file in @($changed)) {
        $path = ("$file" -replace '[\\]', '/').TrimStart('/')
        $leaf = $path.Substring($path.LastIndexOf('/') + 1)
        if ($extensions -contains [System.IO.Path]::GetExtension($path).ToLowerInvariant()) { return $false }
        foreach ($pattern in @($rules.stackFiles)) {
            if ("$pattern".EndsWith('/')) { if ($path.StartsWith("$pattern") -or $path.Contains("/$pattern")) { return $false } }
            elseif ($leaf -like "$pattern" -or $path -like "$pattern") { return $false }
        }
        foreach ($folder in @($rules.dataFolders)) { if ($path.StartsWith("$folder") -or $path.Contains("/$folder")) { return $false } }
        $isDocument = $false
        foreach ($pattern in @($rules.documentPaths)) {
            if ("$pattern".EndsWith('/')) { if ($path.StartsWith("$pattern")) { $isDocument = $true } }
            elseif ($path -like "$pattern") { $isDocument = $true }
        }
        if (-not $isDocument) { return $false }
    }
    return $true
}

function New-Run($check, [string]$state, [string]$detail, [string]$output = '') {
    return New-Object PSObject -Property @{ Kind = "$($check.kind)"; Language = "$($check.language)"; Tool = "$($check.tool)"; State = $state; Detail = $detail; Output = $output; File = ''; Name = ''; Seconds = 0 }
}

# The tier of a check: the recorded check's own tier (PP-F-42), else its catalog entry; lint and tests run on a merge (PP-F-27).
function Get-Tier($check, $catalog) {
    # The weakening guard always runs with the merge (P-PIPE-7): a tier written on its entry cannot move it to the release run.
    if ("$($check.kind)" -eq 'guard') { return 'merge' }
    if (@('merge', 'release') -contains "$($check.tier)") { return "$($check.tier)" }
    $entry = Get-Entry $check $catalog
    if ($entry -and $entry.tier) { return "$($entry.tier)" }
    return 'merge'
}

# The exit code that makes a check 'not run': the catalog entry's, for lint and tests the language's (PP-F-25, PP-F-29).
function Get-SkipExit($check, $entry, $catalog) {
    if ($entry -and $entry.skipExit) { return [int]$entry.skipExit }
    if ($check.kind -eq 'lint' -or $check.kind -eq 'tests') {
        $language = @($catalog.languages | Where-Object { $_.name -eq "$($check.language)" })[0]
        if ($language -and $language.skipExit) { return [int]$language.skipExit }
    }
    return $null
}

# {threshold} becomes the decision's threshold and every later level of the catalog's thresholds, upper case.
function Expand-Threshold([string]$threshold, $catalog) {
    $levels = @($catalog.thresholds)
    $index = [array]::IndexOf($levels, $threshold)
    if ($index -lt 0) { return $null }
    return (($levels[$index..($levels.Count - 1)] | ForEach-Object { $_.ToUpperInvariant() }) -join ',')
}

# The catalog entry of one check; lint and tests have none, they run the project's own command line, as the entries
# marked projectCommand do.
function Get-Entry($check, $catalog) {
    if ($check.kind -eq 'lint' -or $check.kind -eq 'tests') { return $null }
    return @($catalog.checks | Where-Object { $_.kind -eq $check.kind -and "$($_.language)" -eq "$($check.language)" })[0]
}

# A project command line: lint, tests, and the projectCommand entries without calls of their own.
function Test-ProjectCommand($check, $entry) {
    if ($check.kind -eq 'lint' -or $check.kind -eq 'tests') { return $true }
    return [bool]($entry -and $entry.projectCommand -and @($entry.localCalls).Count -eq 0)
}

# {cwdFlag}, {versionFlag}, and {checkIndex} of one argument; $null when the argument vanishes (PP-F-32).
function Expand-Placeholder([string]$arg, $check, [int]$index) {
    if ($arg -eq '{cwdFlag}') { if ("$($check.cwd)") { return "--cwd=$($check.cwd)" } else { return $null } }
    if ($arg -eq '{versionFlag}') { if ("$($check.version)") { return "--version=$($check.version)" } else { return $null } }
    return $arg.Replace('{checkIndex}', "$index")
}

# The calls of one check as a list of argument lists, or a string naming why none could be built.
function Get-Calls($check, $entry, $catalog, [int]$index) {
    if (Test-ProjectCommand $check $entry) {
        if (-not "$($check.tool)") { return "no command line recorded for $($check.kind) $($check.language)".Trim() }
        $words = @("$($check.tool)" -split ' ' | Where-Object { $_ } | ForEach-Object { Expand-Placeholder $_ $check $index } | Where-Object { $null -ne $_ })
        return , @(, $words)
    }
    if (-not $entry) { return "no catalog entry for $($check.kind) $($check.language)".Trim() }
    $calls = @()
    foreach ($call in @($entry.localCalls)) {
        $callArgs = @()
        foreach ($arg in @($call)) {
            $arg = Expand-Placeholder $arg $check $index
            if ($null -eq $arg) { continue }
            if ($arg -like '*{threshold}*') {
                $expanded = Expand-Threshold "$($check.threshold)" $catalog
                if ($null -eq $expanded) { return "unknown threshold: $($check.threshold)" }
                $arg = $arg.Replace('{threshold}', $expanded)
            }
            $callArgs += $arg.Replace('{repoRoot}', $repoRoot).Replace('{docCheck}', $docCheck)
        }
        $calls += , $callArgs
    }
    return , $calls
}

function Test-Application([string]$name) {
    return [bool](Get-Command -Name $name -CommandType Application -ErrorAction SilentlyContinue)
}

# A container runtime answers when docker is on the search path and docker info exits with 0; asked once per run.
$script:containerAnswers = $null
function Test-ContainerRuntime {
    if ($null -eq $script:containerAnswers) {
        $script:containerAnswers = $false
        if (Test-Application 'docker') {
            & docker info *> $null
            $script:containerAnswers = ($LASTEXITCODE -eq 0)
        }
    }
    return $script:containerAnswers
}

# The rule sets of the other sast checks of a group, added to the first check's semgrep call (PP-F-43).
function Add-RuleSets($calls, $others, $catalog) {
    $extra = @()
    foreach ($other in $others) {
        $entry = Get-Entry $other $catalog
        $words = @(@($entry.localCalls)[0])
        for ($i = 0; $i -lt $words.Count - 1; $i++) { if ($words[$i] -eq '--config') { $extra += '--config', $words[$i + 1] } }
    }
    $first = @($calls[0])
    $at = [array]::IndexOf($first, '--config')
    if ($at -lt 0 -or $extra.Count -eq 0) { return , $calls }
    $merged = @($first[0..($at + 1)]) + $extra + @($first[($at + 2)..($first.Count - 1)])
    return , @(, $merged)
}

function Invoke-Check($check, $catalog, [int]$index, $group = @()) {
    $label = "$($check.kind) $($check.language) $(if ("$($check.cwd)") { "($($check.cwd))" })".Trim()
    Write-Host "== $label" -ForegroundColor Cyan
    $entry = Get-Entry $check $catalog
    $calls = Get-Calls $check $entry $catalog $index
    if (@($group).Count -gt 0 -and $calls -isnot [string]) { $calls = Add-RuleSets $calls $group $catalog }
    # A project command runs in the check's folder unless it is told the folder itself ({cwdFlag}).
    $inFolder = "$($check.cwd)" -and (Test-ProjectCommand $check $entry) -and -not ("$($check.tool)" -match '{cwdFlag}')
    if ($inFolder -and -not (Test-Path -LiteralPath (Join-Path $repoRoot "$($check.cwd)") -PathType Container)) {
        return New-Run $check 'failed' "folder not found: $($check.cwd)"
    }
    # lintOnCommitted: every call runs in a copy of HEAD with LF line endings (PP-F-40).
    if ($check.lintOnCommitted -eq $true -and @('lint', 'format') -contains $check.kind -and $calls -isnot [string]) {
        $prefix = @('node', 'gam-engineering/tools/committed-copy.mjs')
        if ($inFolder) { $prefix += "--dir=$($check.cwd)" }
        $wrapped = @()
        foreach ($call in $calls) { $wrapped += , @($prefix + '--' + @($call)) }
        $calls = $wrapped
        $inFolder = $false
    }
    if ($calls -is [string]) { return New-Run $check 'failed' $calls }
    # The container probe comes first: a missing Docker gives skipped, never failed (PP-E-4).
    if ($entry -and $entry.needsContainer -and -not (Test-ContainerRuntime)) {
        return New-Run $check 'skipped' 'container runtime missing'
    }
    # Every call's tool must be found before the first one runs (PP-E-3).
    foreach ($call in $calls) {
        $word = $call[0]
        if (-not (Test-Application $word)) {
            if ($entry) { return New-Run $check 'failed' "$($entry.installHint)" }
            return New-Run $check 'failed' "command not found: $word"
        }
    }
    $skipExit = Get-SkipExit $check $entry $catalog
    $output = @()
    foreach ($call in $calls) {
        $word = $call[0]
        $rest = @($call | Select-Object -Skip 1)
        if ($inFolder) { Push-Location -LiteralPath (Join-Path $repoRoot "$($check.cwd)") }
        try { $captured = @(& $word @rest 2>&1 | ForEach-Object { "$_" }); $code = $LASTEXITCODE }
        finally { if ($inFolder) { Pop-Location } }
        $captured | Out-Host
        $output += @($captured)
        if ($null -ne $skipExit -and $code -eq $skipExit) { return New-Run $check 'not run' "exit code ${code}: see the output" ($output -join "`n") }
        if ($code -ne 0) { return New-Run $check 'failed' "exit code ${code}: $($call -join ' ')" ($output -join "`n") }
    }
    return New-Run $check 'passed' '' ($output -join "`n")
}

# <kind>-<tool>.md: the tool's first word, or the ts-check command, in a form safe as a file name; a second check with the same name gets -2.
function Get-OutputName($run, $used) {
    $tool = @("$($run.Tool)" -split ' ' | Where-Object { $_ })[0]
    if ("$($run.Tool)" -match 'ts-check\.mjs\s+(\S+)') { $tool = $Matches[1] }
    $name = ("$($run.Kind)-$tool" -replace '[^A-Za-z0-9._-]', '-')
    $candidate = $name
    $number = 2
    while ($used -contains $candidate) { $candidate = "$name-$number"; $number++ }
    return $candidate
}

# The last 10 run folders stay; older ones, and the date-only folders of earlier versions, are deleted (PP-F-28).
function Remove-OldReports([string]$root) {
    $folders = @(Get-ChildItem -LiteralPath $root -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '^\d{4}-\d{2}-\d{2}(-\d{6})?$' } | Sort-Object Name -Descending)
    foreach ($old in @($folders | Select-Object -Skip 10)) { Remove-Item -LiteralPath $old.FullName -Recurse -Force -ErrorAction SilentlyContinue }
}

# The run folder exists from the start of a run, so a long or hanging check can be watched there (PP-F-46).
$script:runFolder = ''
$script:runStamp = ''
function New-RunFolder {
    $script:runStamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
    $script:runFolder = Join-Path (Join-Path $repoRoot 'gam-engineering/reports/local-pipeline') $script:runStamp
    New-Item -ItemType Directory -Force -Path $script:runFolder | Out-Null
    # Checks write extra files next to report.md (the SonarQube report, PP-F-52); the parallel children inherit this.
    $env:GAM_PIPELINE_RUN_FOLDER = $script:runFolder
}

# The output names in the decision's order, fixed before the first check starts, so the order the checks end in never swaps them.
$script:outputNames = @{}
function Set-OutputNames($checks) {
    $used = @()
    foreach ($check in $checks) {
        $name = Get-OutputName (New-Run $check '' '') $used
        $used += $name
        $script:outputNames[$check] = $name
    }
}

function Write-RunOutput($run, [string]$name) {
    $run.File = "$name.md"
    $body = @("# $($run.Kind) $($run.Language) - $($run.State)", '', '~~~text', $(if ($run.Output) { $run.Output } else { '(no output)' }), '~~~', '')
    [System.IO.File]::WriteAllText((Join-Path $script:runFolder $run.File), ($body -join "`n"), $utf8)
}

# report.md while the run lasts: each check waiting, running since, or its result, under the line running.
function Write-InterimReport($units, $states, $started) {
    if (-not $script:runFolder) { return }
    $lines = @("# Local pipeline $($script:runStamp)", '', '| Kind | Language | State |', '| --- | --- | --- |')
    for ($i = 0; $i -lt $units.Count; $i++) {
        $state = if ($states[$i] -eq 'running' -and $started.ContainsKey($i)) { "running since $($started[$i].ToString('HH:mm:ss'))" } else { $states[$i] }
        foreach ($check in @($units[$i].Checks)) {
            $language = if ("$($check.language)") { "$($check.language)" } else { $dash }
            $lines += "| $($check.kind) | $language | $state |"
        }
    }
    $lines += '', 'running'
    [System.IO.File]::WriteAllText((Join-Path $script:runFolder 'report.md'), (($lines -join "`n") + "`n"), $utf8)
}

function Write-Report($runs, [bool]$green, [string]$note, [string]$info) {
    if (-not $script:runFolder) { New-RunFolder }
    $stamp = $script:runStamp
    $root = Split-Path -Parent $script:runFolder
    $used = @($runs | Where-Object { $_.Name } | ForEach-Object { $_.Name })
    foreach ($run in $runs) {
        if (@('skipped', 'skipped by choice') -contains $run.State) { continue }
        $name = $run.Name
        if (-not $name) {
            $name = Get-OutputName $run $used
            $used += $name
        }
        Write-RunOutput $run $name
    }
    $lines = @("# Local pipeline $stamp", '')
    if ($note) { $lines += $note, '' }
    if ($info) { $lines += $info, '' }
    if (@($runs).Count -gt 0) {
        $lines += '| Kind | Language | State | Detail | Output | Seconds |', '| --- | --- | --- | --- | --- | --- |'
        foreach ($run in $runs) {
            $language = if ($run.Language) { $run.Language } else { $dash }
            $detail = if ($run.Detail) { $run.Detail.Replace('|', '\|') } else { $dash }
            $link = if ($run.File) { "[$($run.File)]($($run.File))" } else { $dash }
            $seconds = if ($run.Seconds) { "$($run.Seconds)" } else { $dash }
            $lines += "| $($run.Kind) | $language | $($run.State) | $detail | $link | $seconds |"
        }
        $lines += ''
    }
    $lines += $(if ($green) { 'green' } else { 'red' })
    $path = Join-Path $script:runFolder 'report.md'
    [System.IO.File]::WriteAllText($path, (($lines -join "`n") + "`n"), $utf8)
    Remove-OldReports $root
    return $path
}

# ---------- running the selected checks (PP-F-43) ----------

# The kinds a check waits for: the decision's after, else its catalog entry's.
function Get-After($check, $catalog) {
    if ($check.after) { return @($check.after) }
    $entry = Get-Entry $check $catalog
    if ($entry -and $entry.after) { return @($entry.after) }
    return @()
}

# Units of work in the decision's order: one per check, the sast checks of several languages as one unit.
function Get-Units($checks, $allChecks, $catalog) {
    $units = @()
    $sast = @($checks | Where-Object { $_.kind -eq 'sast' -and -not $_.native })
    foreach ($check in $checks) {
        $index = [array]::IndexOf($allChecks, $check)
        if ($sast.Count -gt 1 -and $sast -contains $check) {
            if ($check -ne $sast[0]) { continue }
            $units += New-Object PSObject -Property @{ Checks = $sast; Index = $index; Group = @($sast | Select-Object -Skip 1) }
            continue
        }
        $units += New-Object PSObject -Property @{ Checks = @($check); Index = $index; Group = @() }
    }
    return , $units
}

function Get-Label($check) { return "$($check.kind) $($check.language) $(if ("$($check.cwd)") { "($($check.cwd))" })".Trim() }

# The live table on a console, or one line per change without one.
$script:tableTop = -1
function Show-Progress($units, $states, $changed) {
    if ([Console]::IsOutputRedirected) {
        foreach ($i in $changed) { Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $(($units[$i].Checks | ForEach-Object { Get-Label $_ }) -join ', '): $($states[$i])" }
        return
    }
    try {
        if ($script:tableTop -ge 0) { [Console]::SetCursorPosition(0, $script:tableTop) }
        $width = [Math]::Max(40, [Console]::WindowWidth - 1)
        for ($i = 0; $i -lt $units.Count; $i++) {
            $line = "{0,-12} {1}" -f $states[$i], (($units[$i].Checks | ForEach-Object { Get-Label $_ }) -join ', ')
            Write-Host ($line.PadRight($width).Substring(0, $width))
        }
        # Counted back from where the table ends, so a window that scrolled while drawing keeps one table, not two.
        $script:tableTop = [Math]::Max(0, [Console]::CursorTop - $units.Count)
    } catch {
        # A host without cursor control gets one line per change instead.
        foreach ($i in $changed) { Write-Host "$(($units[$i].Checks | ForEach-Object { Get-Label $_ }) -join ', '): $($states[$i])" }
    }
}

# One check in this process: its run object(s) with the seconds it took.
function Invoke-Unit($unit, $catalog) {
    $start = Get-Date
    $run = Invoke-Check $unit.Checks[0] $catalog $unit.Index $unit.Group
    $seconds = [int][Math]::Round(((Get-Date) - $start).TotalSeconds)
    return , @($unit.Checks | ForEach-Object {
            $copy = New-Run $_ $run.State $run.Detail $run.Output
            $copy.Seconds = $seconds
            $copy
        })
}

# The output files of a unit that ended, written at once under the names of the final report (PP-F-46).
function Write-UnitOutput($unit, $unitRuns) {
    $checks = @($unit.Checks)
    for ($c = 0; $c -lt $checks.Count; $c++) {
        $run = @($unitRuns)[$c]
        $run.Name = "$($script:outputNames[$checks[$c]])"
        if ($script:runFolder -and $run.Name -and @('skipped', 'skipped by choice') -notcontains $run.State) { Write-RunOutput $run $run.Name }
    }
}

# One check after the other in this process, with report.md rewritten before and after each.
function Invoke-Sequential($units, $catalog) {
    $states = @($units | ForEach-Object { 'waiting' })
    $started = @{}
    $perUnit = @()
    for ($i = 0; $i -lt $units.Count; $i++) {
        $states[$i] = 'running'
        $started[$i] = Get-Date
        Write-InterimReport $units $states $started
        $unitRuns = Invoke-Unit $units[$i] $catalog
        Write-UnitOutput $units[$i] $unitRuns
        $states[$i] = "$(@($unitRuns)[0].State) $(@($unitRuns)[0].Seconds) s"
        $perUnit += , @($unitRuns)
    }
    return , $perUnit
}

# Several checks at the same time, each in its own PowerShell process that runs this script with -RunIndex.
function Invoke-Parallel($units, $catalog, [int]$limit) {
    $exe = (Get-Process -Id $PID).Path
    $temp = Join-Path ([IO.Path]::GetTempPath()) "gam-pipeline-$PID"
    New-Item -ItemType Directory -Force -Path $temp | Out-Null
    $states = @($units | ForEach-Object { 'waiting' })
    $results = @{}
    $running = @{}
    $started = @{}
    # The live output of a running check: <name>.running.txt in the run folder, removed when the check ends (PP-F-46).
    $live = @{}
    for ($i = 0; $i -lt $units.Count; $i++) {
        $name = "$($script:outputNames[@($units[$i].Checks)[0]])"
        $live[$i] = if ($script:runFolder -and $name) { Join-Path $script:runFolder "$name.running.txt" } else { Join-Path $temp "$i.out" }
    }
    Show-Progress $units $states @()
    Write-InterimReport $units $states $started
    try {
        while ($results.Count -lt $units.Count) {
            $changed = @()
            foreach ($i in @($running.Keys)) {
                if (-not $running[$i].HasExited) { continue }
                $running.Remove($i)
                $file = Join-Path $temp "$i.json"
                $seconds = [int][Math]::Round(((Get-Date) - $started[$i]).TotalSeconds)
                $result = if (Test-Path -LiteralPath $file) { Read-Json $file } else { $null }
                $results[$i] = @($units[$i].Checks | ForEach-Object {
                        $run = if ($result) { New-Run $_ "$($result.State)" "$($result.Detail)" "$($result.Output)" } else { New-Run $_ 'failed' 'the check process ended without a result' }
                        $run.Seconds = $seconds
                        $run
                    })
                $states[$i] = "$($results[$i][0].State) $seconds s"
                $changed += $i
                Write-UnitOutput $units[$i] $results[$i]
                if ([Console]::IsOutputRedirected) { Get-Content -LiteralPath $live[$i] -ErrorAction SilentlyContinue | Out-Host }
                Remove-Item -LiteralPath $live[$i] -Force -ErrorAction SilentlyContinue
            }
            for ($i = 0; $i -lt $units.Count -and $running.Count -lt $limit; $i++) {
                if ($results.ContainsKey($i) -or $running.ContainsKey($i)) { continue }
                $after = @(Get-After $units[$i].Checks[0] $catalog)
                # Ready when every other unit holding a check of a kind it waits for has its result.
                $blocking = @(for ($j = 0; $j -lt $units.Count; $j++) { if ($j -ne $i -and -not $results.ContainsKey($j) -and @($units[$j].Checks | Where-Object { $after -contains $_.kind }).Count -gt 0) { $j } })
                if ($blocking.Count -gt 0) { continue }
                $arguments = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"", '-RunIndex', $units[$i].Index, '-ResultPath', "`"$(Join-Path $temp "$i.json")`"")
                if (@($units[$i].Group).Count -gt 0) { $arguments += '-GroupIndexes', ((@($units[$i].Group) | ForEach-Object { [array]::IndexOf(@($decision.checks), $_) }) -join ',') }
                $started[$i] = Get-Date
                $running[$i] = Start-Process -FilePath $exe -ArgumentList $arguments -NoNewWindow -PassThru -RedirectStandardOutput $live[$i] -RedirectStandardError (Join-Path $temp "$i.err")
                $states[$i] = 'running'
                $changed += $i
            }
            if ($changed.Count -gt 0) {
                Show-Progress $units $states $changed
                Write-InterimReport $units $states $started
            }
            if ($results.Count -lt $units.Count) { Start-Sleep -Milliseconds 200 }
        }
    } finally {
        foreach ($process in $running.Values) { if (-not $process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue } }
        foreach ($path in $live.Values) { Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue }
        Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
    }
    return , @(for ($i = 0; $i -lt $units.Count; $i++) { , @($results[$i]) })
}

# Child mode: one check (or one sast group) of a parallel run; the parent reads the result file.
if ($RunIndex -ge 0) {
    $decision = Read-Json (Join-Path $repoRoot 'gam-engineering/pipeline.json')
    $catalog = Read-Json (Join-Path $repoRoot 'gam-engineering/tools/pipeline-catalog.json')
    # The same guard the parent added, so both read the checks in one order.
    $guardBack = Get-DroppedGuard @($decision.checks)
    if ($guardBack) { $decision | Add-Member -NotePropertyName checks -NotePropertyValue (@($decision.checks) + $guardBack) -Force }
    $all = @($decision.checks)
    $group = @($GroupIndexes -split ',' | Where-Object { $_ -ne '' } | ForEach-Object { $all[[int]$_] })
    $run = Invoke-Check $all[$RunIndex] $catalog $RunIndex $group
    $json = @{ State = $run.State; Detail = $run.Detail; Output = $run.Output } | ConvertTo-Json -Compress
    [System.IO.File]::WriteAllText($ResultPath, $json, $utf8)
    exit 0
}

$decisionPath = Join-Path $repoRoot 'gam-engineering/pipeline.json'
$catalogPath = Join-Path $repoRoot 'gam-engineering/tools/pipeline-catalog.json'
$runs = @()
$note = ''
$info = ''
if (-not (Test-Path -LiteralPath $decisionPath)) {
    $note = 'gam-engineering/pipeline.json missing; run /gam-engineering pipeline'
} elseif (-not (Test-Path -LiteralPath $catalogPath)) {
    $note = 'gam-engineering/tools/pipeline-catalog.json missing; run /gam-engineering migrate tools'
} else {
    try { $decision = Read-Json $decisionPath } catch { $note = 'pipeline.json is not valid JSON' }
    if (-not $note) {
        try { $catalog = Read-Json $catalogPath } catch { $note = 'pipeline-catalog.json is not valid JSON' }
    }
    if (-not $note) {
        $guardBack = Get-DroppedGuard @($decision.checks)
        if ($guardBack) { $decision | Add-Member -NotePropertyName checks -NotePropertyValue (@($decision.checks) + $guardBack) -Force; Write-Host 'weakening guard: recorded on the integration branch, missing here; it runs anyway' -ForegroundColor Yellow }
        $checks = @($decision.checks)
        if ((Get-Flow) -eq 'quick') {
            $quick = Select-QuickChecks $checks $catalog
            $checks = @($quick.Checks)
            $info = $quick.Note
            Write-Host $info -ForegroundColor Cyan
        }
        if ($Tier -eq 'merge') {
            $left = @($checks | Where-Object { (Get-Tier $_ $catalog) -ne 'merge' })
            $checks = @($checks | Where-Object { (Get-Tier $_ $catalog) -eq 'merge' })
            if ($left.Count -gt 0) {
                $tierNote = "tier merge: $($left.Count) check(s) of tier release wait for the release run"
                $info = if ($info) { "$info; $tierNote" } else { $tierNote }
            }
        }
        $skipKinds = @($Skip | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
        $skipReason = @{}
        foreach ($kind in $skipKinds) { $skipReason[$kind] = '-Skip' }
        # Only documents changed (P-PIPE-6): the checks outside the catalog's docsOnly kinds are left out, named in the report.
        if ((Get-Flow) -eq 'full' -and $Tier -eq 'merge' -and "$($decision.docsOnly)" -ne 'full' -and $catalog.docsOnly -and (Test-DocsOnly $catalog)) {
            $keep = @($catalog.docsOnly.kinds)
            $dropped = @($checks | Where-Object { $keep -notcontains $_.kind } | ForEach-Object { $_.kind } | Select-Object -Unique)
            foreach ($kind in $dropped) { if (-not $skipReason.ContainsKey($kind)) { $skipReason[$kind] = 'only documents changed (P-PIPE-6)' } }
            $skipKinds = @($skipReason.Keys)
            if ($dropped.Count -gt 0) {
                $docsNote = "docs-only: only documents changed, so only $($keep -join ', ') ran; skipped: $($dropped -join ', ')"
                $info = if ($info) { "$info; $docsNote" } else { $docsNote }
                Write-Host $docsNote -ForegroundColor Cyan
            }
        }
        $allChecks = @($decision.checks)
        $toRun = @($checks | Where-Object { $skipKinds -notcontains $_.kind })
        $units = Get-Units $toRun $allChecks $catalog
        if ($Jobs -lt 1) {
            $Jobs = if ($env:GAM_PIPELINE_JOBS -match '^\d+$') { [int]$env:GAM_PIPELINE_JOBS } else { [Math]::Min(4, [Environment]::ProcessorCount) }
        }
        Set-OutputNames @($checks | Where-Object { $skipKinds -notcontains $_.kind })
        New-RunFolder
        $perUnit = if ($Jobs -gt 1 -and $units.Count -gt 1) { Invoke-Parallel $units $catalog $Jobs } else { Invoke-Sequential $units $catalog }
        # The report keeps the decision's order: each check gets the run of its unit, skipped checks stay where they stand.
        $runFor = @{}
        for ($u = 0; $u -lt $units.Count; $u++) { for ($c = 0; $c -lt @($units[$u].Checks).Count; $c++) { $runFor[@($units[$u].Checks)[$c]] = @($perUnit[$u])[$c] } }
        foreach ($check in $checks) {
            if ($skipKinds -contains $check.kind) { $runs += New-Run $check 'skipped by choice' "$($skipReason[$check.kind])"; continue }
            $runs += $runFor[$check]
        }
    }
}

# A skipped run is green only while the location is both: the host pipeline still runs that check.
$skipAllowed = (-not $note) -and ("$($decision.location)" -eq 'both')
$red = @($runs | Where-Object { @('passed', 'not run', 'skipped by choice') -notcontains $_.State -and -not ($_.State -eq 'skipped' -and $skipAllowed) })
$green = (-not $note) -and ($red.Count -eq 0)
$report = Write-Report $runs $green $note $info
if ($note) { Write-Host $note -ForegroundColor Red }
foreach ($run in @($runs | Where-Object { $_.State -ne 'passed' })) {
    $color = if ($red -contains $run) { 'Red' } else { 'Yellow' }
    Write-Host "$($run.Kind) $($run.Language): $($run.State) - $($run.Detail)" -ForegroundColor $color
}
Write-Host "Report: $report"
if ($green) {
    Write-Host 'Local pipeline green.' -ForegroundColor Green
    exit 0
}
Write-Host 'Local pipeline red.' -ForegroundColor Red
exit 1
