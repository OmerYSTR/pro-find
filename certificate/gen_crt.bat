@echo off

NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: This script must be run as Administrator!
    echo Please right-click the batch file and select "Run as administrator".
    echo.
    pause
    exit /b
)

echo Running with admin rights in %CD%...

copy .\openssl_crt.cnf .\openssl_crt_tmp.cnf
powershell -Command "(Get-Content openssl_crt.cnf) -replace '__SERVER_IP__', '%1' | Set-Content openssl_crt_tmp.cnf"


openssl genrsa -out RootCA.key 4096
openssl req -x509 -new -nodes -key RootCA.key -sha256 -days 3650 -out RootCA.crt
certutil -addstore -f "Root" RootCA.crt

openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -config .\openssl_crt_tmp.cnf
openssl x509 -req -in server.csr -CA RootCA.crt -CAkey RootCA.key -CAcreateserial -out server.crt -days 365 -extfile .\openssl_crt_tmp.cnf
openssl x509 -in server.crt -text -noout

del .\openssl_crt_tmp.cnf
del .\server.csr
del .\RootCA.srl

pause