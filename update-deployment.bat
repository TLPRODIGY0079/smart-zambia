@echo off
echo Updating deployment files...

REM Copy main files
copy "smart-zambia-frontend\index.html" "public\index.html" /Y

REM Copy JS folder
xcopy "smart-zambia-frontend\js" "public\js" /E /I /Y

REM Copy CSS folder if exists
if exist "smart-zambia-frontend\css" (
    xcopy "smart-zambia-frontend\css" "public\css" /E /I /Y
)

REM Copy assets folder if exists
if exist "smart-zambia-frontend\assets" (
    xcopy "smart-zambia-frontend\assets" "public\assets" /E /I /Y
)

echo ✅ Deployment files updated!
echo Ready to deploy to Netlify
pause