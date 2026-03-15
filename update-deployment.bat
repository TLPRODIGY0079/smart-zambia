@echo off
echo Updating deployment files...

REM Copy main files
copy "smart-zambia-frontend\index.html" "public\index.html" /Y

REM Copy JS folder completely
if exist "public\js" rmdir /s /q "public\js"
xcopy "smart-zambia-frontend\js" "public\js" /E /I /Y

REM Copy CSS folder if exists
if exist "smart-zambia-frontend\css" (
    if exist "public\css" rmdir /s /q "public\css"
    xcopy "smart-zambia-frontend\css" "public\css" /E /I /Y
)

REM Copy assets folder if exists
if exist "smart-zambia-frontend\assets" (
    if exist "public\assets" rmdir /s /q "public\assets"
    xcopy "smart-zambia-frontend\assets" "public\assets" /E /I /Y
)

echo ✅ Deployment files updated!
echo Ready to deploy to Netlify
pause