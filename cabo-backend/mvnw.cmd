@REM Maven Wrapper startup batch script
@REM This script downloads Maven if it doesn't exist

@IF "%MAVEN_HOME%"=="" (
    @SET MAVEN_CMD=mvn
) ELSE (
    @SET MAVEN_CMD=%MAVEN_HOME%\bin\mvn
)

@REM Check if Maven is available
@WHERE mvn >nul 2>nul
@IF %ERRORLEVEL% NEQ 0 (
    @ECHO Maven not found. Please install Maven or set MAVEN_HOME.
    @ECHO Download from: https://maven.apache.org/download.cgi
    @ECHO.
    @ECHO Alternative: Use the Spring Boot JAR directly.
    @EXIT /B 1
)

@%MAVEN_CMD% %*
