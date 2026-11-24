<#
.SYNOPSIS
    Wrapper (gam-engineering): runs local-pipeline.mjs, the local pipeline, with every argument given.

.DESCRIPTION
    The local pipeline is the Node script local-pipeline.mjs next to this file, so it runs the same on Windows, macOS, and
    Linux. This wrapper stays for one migration: a project whose pipeline.json still names local-pipeline.ps1, or a person
    who calls it by hand, keeps working. It does nothing but forward the arguments (-Tier, -Skip, -Jobs, -ChangedFiles,
    which the script reads as it reads --tier, --skip, --jobs, --changed-files) and the exit code. Call the script itself:
        node gam-engineering/local-pipeline.mjs
    A later release removes this wrapper.
#>
$script = Join-Path $PSScriptRoot 'local-pipeline.mjs'
if (-not (Get-Command -Name node -CommandType Application -ErrorAction SilentlyContinue)) {
    [Console]::Error.WriteLine('local-pipeline.ps1: node was not found on the search path; the local pipeline needs Node (node gam-engineering/local-pipeline.mjs).')
    exit 1
}
& node $script @args
exit $LASTEXITCODE
