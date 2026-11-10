<#
.SYNOPSIS
    Merges by hand, without an AI agent, the way gam-ai-knowledge/WORKFLOW.md prescribes (gam-engineering).

.DESCRIPTION
    Two jobs, both with merge commits only (no squash, no rebase, P-GIT-3):
      - Work merge: a work branch (feature/..., fix/..., concept/..., chore/...) into the integration branch,
                    then the branch is deleted.
      - Release:    dev into main (branch model dev only), the annotated tag v<version> on main, and the
                    release on the git host.

    The integration branch follows env.GAM_ENGINEERING_BRANCHES in .claude/settings.json (P-GIT-9): dev
    when it is missing or 'dev', main when it is 'trunk'. In trunk mode a release is only the tag on main.

    -Via Local merges with git on this computer and pushes. This only works where the target branch accepts a
    direct push. If they are protected (the standard setup), use -Via Host: the open merge request
    (GitLab, needs glab) or pull request (GitHub, needs gh) is merged on the host instead.

    The script cannot judge the Definition of Done; it asks you to confirm it. Without a console to answer on (input
    redirected, as in an agent run) it does not wait: it stops at once unless -Yes is given.

    -Via Host reports success only when the host says the MR/PR is merged. A host that only schedules the merge
    (GitLab "Will auto-merge" while the pipeline runs) is waited for, up to -WaitSeconds; if it is still open then,
    the script says so and ends with exit code 3, never with "Merged".

    Before a work merge (and, in branch model dev, before the release merge) it stops when a commit message would close
    an issue once it reaches main: a closing keyword (close, fix, resolve, implement) before #<n> (P-GIT-10). Reword the
    commit, or pass -AllowClosingKeywords when closing is meant.

    A local work merge also stops when the branch does not contain the tip of the integration branch: the merge result
    would be a state the pipeline never ran on. Merge the integration branch into the work branch and run the pipeline first.

    Exit codes: 0 merged (and, for a release, tagged), 1 failed or stopped, 3 merge scheduled on the host but not
    done within -WaitSeconds. The step-by-step guide, including what to update afterwards, is
    gam-engineering/tools/MERGING.md.

.EXAMPLE
    .\gam-engineering\tools\merge.ps1 feature/12-login
    Merges feature/12-login into the integration branch locally and pushes it.

.EXAMPLE
    .\gam-engineering\tools\merge.ps1 feature/12-login -Via Host
    Merges the open MR/PR of feature/12-login into the integration branch on GitLab or GitHub.

.EXAMPLE
    .\gam-engineering\tools\merge.ps1 -Release 0.3.0 -Via Host -NotesFile notes.md
    Branch model dev: opens (if needed) and merges the release MR/PR dev -> main, tags v0.3.0, and publishes
    the release. Branch model trunk: tags v0.3.0 on main and publishes the release.
#>
[CmdletBinding(DefaultParameterSetName = 'Work')]
param(
    [Parameter(ParameterSetName = 'Work', Mandatory = $true, Position = 0)]
    [string]$Branch,

    [Parameter(ParameterSetName = 'Release', Mandatory = $true)]
    [string]$Release,

    [ValidateSet('Local', 'Host')]
    [string]$Via = 'Local',

    # Release notes (markdown) for the host release; without it a draft from the merge commits is used.
    [Parameter(ParameterSetName = 'Release')]
    [string]$NotesFile,

    # Skips gam-ai-knowledge/tools/doc-check.mjs (e.g. when Node is not installed). The CI pipeline still runs it.
    [switch]$SkipDocCheck,

    # Lets commit messages through that close an issue with a keyword (P-GIT-10); only when closing is meant.
    [switch]$AllowClosingKeywords,

    # Answers every confirmation with yes. Needed without a console (an agent run), after the Definition of Done is checked.
    [switch]$Yes,

    # -Via Host: how long to wait for a merge the host only scheduled (auto-merge after the pipeline), and how often to look.
    [int]$WaitSeconds = 900,
    [int]$PollSeconds = 15,

    # Appends everything the script prints, and every error, to this file (relative to the repository root).
    # The default is in the git-ignored reports folder; an empty string switches the log off.
    [string]$LogFile = 'gam-engineering/reports/merge.log'
)

# 'Continue', not 'Stop': Windows PowerShell 5.1 would abort on git's progress output on stderr.
# Every failure is checked through $LASTEXITCODE and ends the script with throw.
$ErrorActionPreference = 'Continue'
$Production = 'main'

# ---------- log ----------

$script:logging = $false

function Stop-Log {
    if ($script:logging) {
        Stop-Transcript | Out-Null
        $script:logging = $false
    }
}

# A failure is written to the console and the log, then the script ends with exit code 1.
trap {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Stop-Log
    exit 1
}

function Invoke-Git {
    $output = & git @args 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "git $($args -join ' ') failed:`n$($output -join "`n")"
    }
    return $output
}

function Test-GitRef([string]$Ref) {
    & git rev-parse --verify --quiet $Ref *> $null
    return $LASTEXITCODE -eq 0
}

function Confirm-Step([string]$Question) {
    if ($Yes) { return }
    # No console to answer on: stop at once instead of waiting for an answer that never comes.
    if ([Console]::IsInputRedirected) {
        throw "No console to answer '$Question' (input is redirected, as in an agent run). Check it, then run again with -Yes."
    }
    $answer = Read-Host "$Question [y/N]"
    if ($answer -notmatch '^(y|yes|j|ja)$') {
        Write-Host 'Stopped. Nothing more was changed.' -ForegroundColor Yellow
        Stop-Log
        exit 1
    }
}

function Get-GitHost {
    $url = (Invoke-Git remote get-url origin) | Select-Object -First 1
    if ($url -match 'github') { return 'github' }
    if ($url -match 'gitlab') { return 'gitlab' }
    throw "Cannot tell GitLab from GitHub by the remote '$url'. Use -Via Local or merge in the web interface."
}

function Assert-Cli([string]$GitHost) {
    $cli = if ($GitHost -eq 'github') { 'gh' } else { 'glab' }
    if (-not (Get-Command $cli -ErrorAction SilentlyContinue)) {
        throw "-Via Host on $GitHost needs the '$cli' CLI (logged in). Install it or merge in the web interface."
    }
    return $cli
}

# The number of the open MR/PR of a source branch, read before the merge: the branch may be gone afterwards.
function Get-RequestId([string]$Cli, [string]$SourceBranch) {
    if ($Cli -eq 'gh') {
        $id = & gh pr view $SourceBranch --json number --jq '.number' 2>$null
    } else {
        $json = & glab mr view $SourceBranch --output json 2>$null
        $id = if ($LASTEXITCODE -eq 0 -and $json) { ($json -join "`n" | ConvertFrom-Json).iid } else { $null }
    }
    if (-not $id) { throw "No open MR/PR for '$SourceBranch' on the host." }
    return "$id"
}

# The newest MR/PR of a source branch in any state, for the release check after the merge call.
function Get-RequestIdAny([string]$Cli, [string]$SourceBranch) {
    if ($Cli -eq 'gh') {
        $id = & gh pr list --head $SourceBranch --state all --limit 1 --json number --jq '.[0].number' 2>$null
    } else {
        $json = & glab mr list --source-branch $SourceBranch --all --per-page 1 --output json 2>$null
        $id = if ($LASTEXITCODE -eq 0 -and $json) { @($json -join "`n" | ConvertFrom-Json)[0].iid } else { $null }
    }
    if (-not $id) { throw "No MR/PR for '$SourceBranch' on the host." }
    return "$id"
}

# The state of an MR/PR as merged, open, or closed, from the host itself.
function Get-RequestState([string]$Cli, [string]$Id) {
    if ($Cli -eq 'gh') {
        $state = "$(& gh pr view $Id --json state --jq '.state' 2>$null)"
    } else {
        $json = & glab mr view $Id --output json 2>$null
        $state = if ($LASTEXITCODE -eq 0 -and $json) { "$(($json -join "`n" | ConvertFrom-Json).state)" } else { '' }
    }
    switch -Regex ($state.Trim().ToLowerInvariant()) {
        '^merged$' { return 'merged' }
        '^(open|opened|locked)$' { return 'open' }
        '^closed$' { return 'closed' }
        default { return 'unknown' }
    }
}

# After the merge call: success only when the host says merged. A scheduled merge is waited for; still open after
# -WaitSeconds ends the script with exit code 3, a closed MR/PR with an error.
function Wait-Merged([string]$Cli, [string]$Id, [string]$What) {
    $deadline = (Get-Date).AddSeconds($WaitSeconds)
    while ($true) {
        $state = Get-RequestState $Cli $Id
        if ($state -eq 'merged') { return }
        if ($state -eq 'closed') { throw "The host closed $What without merging it." }
        if ((Get-Date) -ge $deadline) {
            $view = if ($Cli -eq 'gh') { "gh pr view $Id" } else { "glab mr view $Id" }
            Write-Host "Not merged yet: the host has scheduled $What (state $state), e.g. to merge when its pipeline is green. Check with '$view'; the steps after the merge wait until it is merged." -ForegroundColor Yellow
            Stop-Log
            exit 3
        }
        Write-Host "Waiting for the host to merge $What (state $state) ..."
        Start-Sleep -Seconds ([Math]::Max(1, $PollSeconds))
    }
}

function Invoke-DocCheck {
    if ($SkipDocCheck) { return $true }
    # gam-ai-knowledge/, or a former folder in a project not yet moved (P-DOC-10, P-DOC-11).
    $docCheck = 'gam-ai-knowledge/tools/doc-check.mjs', 'gam-engineering/tools/doc-check.mjs', 'humanengineering/tools/doc-check.mjs' |
        Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $docCheck) { return $true }
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host 'Node is not installed: doc-check skipped (the pipeline still runs it).' -ForegroundColor Yellow
        return $true
    }
    & node $docCheck
    return $LASTEXITCODE -eq 0
}

function Confirm-DefinitionOfDone([string]$What) {
    Write-Host ''
    Write-Host "Before $What, check by hand (gam-ai-knowledge/WORKFLOW.md, Definition of Done):" -ForegroundColor Cyan
    Write-Host '  - every acceptance criterion has a passing test carrying its AC ID'
    Write-Host '  - the pipeline is green and no review thread is open'
    Write-Host '  - another person reviewed it and left a comment on the content'
    Write-Host '  - concept document and status (ROADMAP, story status, BACKLOG, sprint file) are updated'
    Confirm-Step 'All of this holds?'
}

# A commit message that would close an issue once it reaches the default branch (P-GIT-10): GitLab's default closing
# pattern (close, fix, resolve, implement in their forms) and GitHub's keywords, then an issue reference. Only the
# MR/PR description closes an issue on purpose (Closes #<issue>).
$ClosingPattern = '(?i)\b(?:clos(?:e[sd]?|ing)|fix(?:e[sd]|ing)?|resolv(?:e[sd]?|ing)|implement(?:s|ed|ing)?):? +(?:issues? +)?(?:[\w.-]+(?:/[\w.-]+)*)?#\d+'

function Assert-NoClosingKeyword([string]$Range, [string]$Target) {
    if ($AllowClosingKeywords) { return }
    $records = ((& git log --format='%h %B%x1e' $Range 2>$null) -join "`n") -split [char]0x1e
    $found = @()
    foreach ($record in $records) {
        $text = $record.Trim()
        if (-not $text) { continue }
        $hash = ($text -split ' ', 2)[0]
        foreach ($match in [regex]::Matches($text, $ClosingPattern)) { $found += "  $hash`: $($match.Value)" }
    }
    if ($found.Count -eq 0) { return }
    Write-Host "These commit messages would close issues once they reach ${Target}:" -ForegroundColor Red
    $found | ForEach-Object { Write-Host $_ }
    throw "Reword them on the branch (P-GIT-10), e.g. 'next: issue #2'; only the MR/PR description closes an issue. Pass -AllowClosingKeywords when closing is meant."
}

function Show-StatusReminder([string[]]$Lines) {
    Write-Host ''
    Write-Host 'Still to do by hand unless the MR already carried it (gam-engineering/tools/MERGING.md, "After the merge"):' -ForegroundColor Cyan
    $Lines | ForEach-Object { Write-Host "  - $_" }
}

# ---------- preconditions ----------

if (-not (Test-GitRef 'HEAD')) { throw 'Run this script in the root of a git repository.' }
Set-Location (Invoke-Git rev-parse --show-toplevel | Select-Object -First 1)

if ($LogFile) {
    $logPath = if ([IO.Path]::IsPathRooted($LogFile)) { $LogFile } else { Join-Path (Get-Location) $LogFile }
    $null = New-Item -ItemType Directory -Force -Path (Split-Path -Parent $logPath)
    Start-Transcript -Path $logPath -Append | Out-Null
    $script:logging = $true
}

if (Invoke-Git status --porcelain) {
    throw 'The working tree has uncommitted changes. Commit or stash them first.'
}

Invoke-Git fetch origin --prune --tags | Out-Null

# Branch model (P-GIT-9): only the committed settings file counts, under the current or a former key prefix
# (P-DOC-10); missing or unknown means dev.
$BranchModel = 'dev'
try {
    $settings = Get-Content '.claude/settings.json' -Raw -ErrorAction Stop | ConvertFrom-Json
    $branches = @($settings.env.GAM_ENGINEERING_BRANCHES, $settings.env.HUMANENGINEERING_BRANCHES, $settings.env.ENGINEERING_HUMAN_BRANCHES) |
        Where-Object { $_ } | Select-Object -First 1
    if ($branches -eq 'trunk') { $BranchModel = 'trunk' }
} catch { }
$Integration = if ($BranchModel -eq 'trunk') { $Production } else { 'dev' }
$IntegratedStage = if ($BranchModel -eq 'trunk') { 'merged' } else { 'in dev' }

# ---------- work branch -> integration branch ----------

if ($PSCmdlet.ParameterSetName -eq 'Work') {
    if ($Branch -in @($Integration, $Production)) {
        throw "'$Branch' is not a work branch. For a release use -Release <version>."
    }
    if (-not (Test-GitRef "origin/$Branch") -and -not (Test-GitRef $Branch)) {
        throw "Branch '$Branch' exists neither locally nor on origin."
    }
    # In branch model dev the commits reach the default branch only with the release, which checks them again.
    Assert-NoClosingKeyword "origin/$Integration..$(if (Test-GitRef "origin/$Branch") { "origin/$Branch" } else { $Branch })" $Production

    Confirm-DefinitionOfDone "merging '$Branch' into $Integration"

    if ($Via -eq 'Host') {
        $gitHost = Get-GitHost
        $cli = Assert-Cli $gitHost
        Confirm-Step "Merge the open MR/PR of '$Branch' into $Integration on $gitHost with a merge commit?"
        $requestId = Get-RequestId $cli $Branch
        if ($cli -eq 'gh') {
            & gh pr merge $requestId --merge --delete-branch
        } else {
            & glab mr merge $requestId --remove-source-branch --yes
        }
        if ($LASTEXITCODE -ne 0) { throw "The host refused the merge (see above): missing approval, red pipeline, or no open MR/PR." }
        Wait-Merged $cli $requestId "the MR/PR of '$Branch'"
        Invoke-Git fetch origin --prune | Out-Null
    } else {
        $source = if (Test-GitRef "origin/$Branch") { "origin/$Branch" } else { $Branch }
        Invoke-Git switch $Integration | Out-Null
        Invoke-Git merge --ff-only "origin/$Integration" | Out-Null
        & git merge-base --is-ancestor $source HEAD
        if ($LASTEXITCODE -eq 0) { throw "'$Branch' is already merged into $Integration." }
        & git merge-base --is-ancestor "origin/$Integration" $source
        if ($LASTEXITCODE -ne 0) {
            throw "'$Branch' is behind $Integration, so the merge would produce a state no pipeline ran on. Merge $Integration into the branch, run the pipeline, push, and run again."
        }

        & git merge --no-ff --no-commit $source
        if ($LASTEXITCODE -ne 0) {
            & git merge --abort
            throw "Merge conflict between '$Branch' and $Integration. Merge $Integration into the branch, resolve the conflict there, push, and run again."
        }
        if (-not (Invoke-DocCheck)) {
            & git merge --abort
            throw 'doc-check reports errors on the merge result. Fix them on the branch first.'
        }
        Invoke-Git commit -m "Merge branch '$Branch' into $Integration" | Out-Null

        Confirm-Step "Push $Integration to origin and delete '$Branch'?"
        & git push origin $Integration
        if ($LASTEXITCODE -ne 0) {
            throw "Push refused - $Integration is probably protected. Undo with 'git reset --hard origin/$Integration' and use -Via Host."
        }
        if (Test-GitRef $Branch) { Invoke-Git branch -d $Branch | Out-Null }
        if (Test-GitRef "origin/$Branch") { Invoke-Git push origin --delete $Branch | Out-Null }
    }

    Write-Host "Merged '$Branch' into $Integration." -ForegroundColor Green
    Show-StatusReminder @(
        'position row in ROADMAP-DETAILS.md (or your STATUS.md) closed, log entry added',
        "story status: done, with its rows in work-items/BACKLOG.md and the sprint file",
        "ROADMAP stage '$IntegratedStage' once the epic's last story is merged",
        'close the issue (hosts close issues automatically only on the default branch), and the epic issue after its last story',
        'then: node gam-ai-knowledge/tools/doc-check.mjs --status reports no STATUS error'
    )
    Stop-Log
    exit 0
}

# ---------- release: (dev -> main,) tag, host release ----------

if ($Release -notmatch '^\d+\.\d+\.\d+$') { throw "Version '$Release' is not MAJOR.MINOR.PATCH (e.g. 0.3.0)." }
$tag = "v$Release"
if (Test-GitRef "refs/tags/$tag") { throw "Tag $tag already exists." }

$lastTag = (& git describe --tags --abbrev=0 "origin/$Production" 2>$null)
$range = if ($lastTag) { "$lastTag..origin/$Integration" } else { "origin/$Integration" }
$merges = @(& git log --first-parent --merges --format='- %s' $range)
if ($merges.Count -eq 0) { throw "No merges on $Integration since $(if ($lastTag) { $lastTag } else { 'the start' }) - nothing to release." }

Write-Host "Release $tag - merged into $Integration since $(if ($lastTag) { $lastTag } else { 'the start' }):" -ForegroundColor Cyan
$merges | ForEach-Object { Write-Host "  $_" }
Write-Host 'Version rule (VERSIONING.md): PATCH = only fixes, MINOR = new features, MAJOR = breaks existing use.'
if ($BranchModel -ne 'trunk') { Assert-NoClosingKeyword "origin/$Production..origin/$Integration" $Production }
Confirm-DefinitionOfDone "releasing $tag on $Production (every story since the last release)"

if ($BranchModel -eq 'trunk') {
    # Trunk mode: no release merge; the tag goes on the current main.
    Invoke-Git switch $Production | Out-Null
    Invoke-Git merge --ff-only "origin/$Production" | Out-Null
    if (-not (Invoke-DocCheck)) { throw "doc-check reports errors on $Production. Fix them through a work branch first." }
    Confirm-Step "Tag $tag on $Production and push the tag?"
} elseif ($Via -eq 'Host') {
    $gitHost = Get-GitHost
    $cli = Assert-Cli $gitHost
    Confirm-Step "Open (if needed) and merge the release MR/PR $Integration -> $Production on $gitHost?"
    $title = "Release $tag"
    $body = "Release $tag`n`n" + ($merges -join "`n")
    if ($cli -eq 'gh') {
        $open = & gh pr list --base $Production --head $Integration --state open --json number --jq '.[0].number'
        if (-not $open) { & gh pr create --base $Production --head $Integration --title $title --body $body }
        & gh pr merge $Integration --merge
    } else {
        $open = & glab mr list --source-branch $Integration --target-branch $Production 2>$null | Select-String '^!'
        if (-not $open) { & glab mr create --source-branch $Integration --target-branch $Production --title $title --description $body --yes }
        & glab mr merge $Integration --yes
    }
    if ($LASTEXITCODE -ne 0) { throw 'The host refused the release merge (see above). The MR/PR stays open.' }
    # The tag waits until main really holds the release.
    Wait-Merged $cli (Get-RequestIdAny $cli $Integration) "the release MR/PR $Integration -> $Production"
    Invoke-Git fetch origin --prune | Out-Null
    Invoke-Git switch $Production | Out-Null
    Invoke-Git merge --ff-only "origin/$Production" | Out-Null
} else {
    Invoke-Git switch $Production | Out-Null
    Invoke-Git merge --ff-only "origin/$Production" | Out-Null
    & git merge --no-ff --no-commit "origin/$Integration"
    if ($LASTEXITCODE -ne 0) {
        & git merge --abort
        throw "Merge conflict between $Integration and $Production. $Production should only ever receive $Integration - find out who committed on $Production."
    }
    if (-not (Invoke-DocCheck)) {
        & git merge --abort
        throw "doc-check reports errors on the release. Fix them on $Integration first."
    }
    Invoke-Git commit -m "Release $tag" | Out-Null
    Confirm-Step "Push $Production to origin?"
    & git push origin $Production
    if ($LASTEXITCODE -ne 0) {
        throw "Push refused - $Production is probably protected. Undo with 'git reset --hard origin/$Production' and use -Via Host."
    }
}

Invoke-Git tag -a $tag -m "Release $tag" | Out-Null
Invoke-Git push origin $tag | Out-Null
Write-Host "$(if ($BranchModel -eq 'trunk') { 'Tagged' } else { "Merged $Integration into $Production and tagged" }) $tag on $Production and pushed the tag." -ForegroundColor Green

$notesPath = $NotesFile
if (-not $notesPath) {
    $notesPath = Join-Path ([IO.Path]::GetTempPath()) "release-notes-$tag.md"
    Set-Content -Path $notesPath -Encoding UTF8 -Value (@("## $tag", '') + $merges)
    Write-Host "No -NotesFile: draft notes from the merge commits written to $notesPath - edit the release on the host so it lists the stories with ID and title." -ForegroundColor Yellow
}

$cliForRelease = $null
try { $cliForRelease = Assert-Cli (Get-GitHost) } catch { Write-Host $_.Exception.Message -ForegroundColor Yellow }
if ($cliForRelease -eq 'gh') {
    & gh release create $tag --title $tag --notes-file $notesPath
} elseif ($cliForRelease -eq 'glab') {
    & glab release create $tag --name $tag --notes-file $notesPath
}
if (-not $cliForRelease -or $LASTEXITCODE -ne 0) {
    Write-Host "Publish the release for $tag in the web interface of the git host (Releases -> New release)." -ForegroundColor Yellow
}

Show-StatusReminder @(
    "ROADMAP.md: stage 'released' for every included feature",
    "epic.md of every completed epic: shipped: `"$tag`"",
    'position rows closed, log entry added',
    'then: node gam-ai-knowledge/tools/doc-check.mjs --status reports no STATUS error'
)

Stop-Log
