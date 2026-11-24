@echo off
rem Launcher (Windows): deploys the skill(s) of this repo with deploy-skill.mjs of the gam-engineering skill.
rem Template: gam-engineering skills/gam-engineering/templates/deploy_skill_wrapper.cmd (Linux: deploy_skill_wrapper.sh).
rem Arguments go through: --what-if, --skills-root <folder>. Needs Node and the installed gam-engineering skill.
rem Success: wait 5 seconds, then close. Error: stay open until a key is pressed.
setlocal
set "TOOL=%~dp0skills\gam-engineering\scripts\deploy-skill.mjs"
if not exist "%TOOL%" if defined CLAUDE_CONFIG_DIR set "TOOL=%CLAUDE_CONFIG_DIR%\skills\gam-engineering\scripts\deploy-skill.mjs"
if not exist "%TOOL%" set "TOOL=%USERPROFILE%\.claude\skills\gam-engineering\scripts\deploy-skill.mjs"
if not exist "%TOOL%" (
    echo ERROR: deploy-skill.mjs not found - deploy the gam-engineering skill first.
    pause
    exit /b 1
)
node "%TOOL%" --root "%~dp0." %*
if errorlevel 1 (
    echo.
    echo Deploy failed - see the error above.
    pause
    exit /b 1
)
echo.
echo Closing in 5 seconds...
rem timeout needs a console; fall back to ping when input is redirected.
timeout /t 5 /nobreak >nul 2>&1 || ping -n 6 127.0.0.1 >nul
exit /b 0
