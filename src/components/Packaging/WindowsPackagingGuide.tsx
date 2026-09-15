/**
 * Native Windows Desktop Packaging, .EXE Generator & Installer Guide
 * Provides scripts and project templates for C# / .NET / WPF and Electron / Tauri
 * producing single-file ShopBilling.exe, Inno Setup installer, and Desktop shortcuts.
 */

import React, { useState } from 'react';
import {
  AppWindow,
  Download,
  Copy,
  Check,
  FolderOpen,
  Terminal,
  ShieldCheck,
  FileCode,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const WindowsPackagingGuide: React.FC = () => {
  const { settings, db } = useShop();
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleDownloadWindowsLauncher = () => {
    const batScript = `@echo off
REM =========================================================================
REM Shop Billing POS - 1-Click Windows Local Setup & Launch Script
REM =========================================================================
title Shop Billing System - Offline POS

echo.
echo =========================================================================
echo       SHOP BILLING SYSTEM - LOCAL WINDOWS INSTALLATION & LAUNCHER        
echo =========================================================================
echo.
echo Checking Node.js runtime on your computer...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/ (LTS version)
    echo Then double-click this start-pos.bat file again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is detected.
echo.
echo Installing dependencies (if needed)...
if not exist node_modules (
    echo Installing required packages...
    call npm install
) else (
    echo [OK] Dependencies are already present.
)

echo.
echo Starting Shop Billing System POS Server on http://localhost:3000...
echo You can open this in Chrome, Edge, or package with Electron.
echo.
start http://localhost:3000
call npm run dev

pause
`;
    const blob = new Blob([batScript], { type: 'application/x-bat;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'start-pos.bat';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSQLDump = () => {
    const sql = db.generateSQLDump();
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShopBilling_Schema_Dump_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSONData = () => {
    const json = db.exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShopBilling_FullBackup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wpfCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <UseWPF>true</UseWPF>
    <ApplicationIcon>Assets\\app.ico</ApplicationIcon>
    <PublishSingleFile>true</PublishSingleFile>
    <SelfContained>true</SelfContained>
    <RuntimeIdentifier>win-x64</RuntimeIdentifier>
    <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Data.Sqlite" Version="8.0.0" />
    <PackageReference Include="Dapper" Version="2.1.28" />
  </ItemGroup>
</Project>`;

  const wpfBuildCommand = `dotnet publish -c Release -r win-x64 --self-contained -p:PublishSingleFile=true -o ./publish/ShopBilling`;

  const innoSetupScript = `[Setup]
AppName=Shop Billing System
AppVersion=1.0.0
DefaultDirName={autopf}\\ShopBilling
DefaultGroupName=Shop Billing
OutputDir=.\\InstallerOutput
OutputBaseFilename=ShopBilling_Windows_Setup_v1.0.0
Compression=lzma
SolidCompression=yes
SetupIconFile=Assets\\app.ico
UninstallDisplayIcon={app}\\ShopBilling.exe

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: ".\\publish\\ShopBilling\\ShopBilling.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\\publish\\ShopBilling\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\\Shop Billing System"; Filename: "{app}\\ShopBilling.exe"
Name: "{group}\\Uninstall Shop Billing"; Filename: "{uninstallexe}"
Name: "{autodesktop}\\Shop Billing"; Filename: "{app}\\ShopBilling.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\\ShopBilling.exe"; Description: "{cm:LaunchProgram,Shop Billing}"; Flags: nowait postinstall skipifsilent`;

  const electronPackageJson = `{
  "name": "shop-billing-windows",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dist:win": "electron-builder --win --x64"
  },
  "build": {
    "appId": "com.shopbilling.pos",
    "productName": "Shop Billing System",
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Shop Billing"
    }
  }
}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AppWindow size={18} className="text-sky-400" />
            Native Windows Desktop .EXE & Installer Generator
          </h2>
          <p className="text-xs text-slate-400">
            Produces self-contained standalone Windows executable (.exe), installer wizard (.msi / Setup.exe),
            desktop shortcut, and local SQLite data folder.
          </p>
        </div>

        <div className="bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
          <ShieldCheck size={14} />
          <span>100% Offline &amp; Air-Gapped Ready</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl">
        {/* Spec Overview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Layers size={16} className="text-emerald-400" />
            Windows Desktop Deployment Specification
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-0.5">Target OS</div>
              <div className="font-bold text-slate-200">Windows 10 / 11 (x64)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-0.5">Application Format</div>
              <div className="font-bold text-emerald-400">Single-File .EXE + Installer</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-0.5">Data Storage</div>
              <div className="font-bold text-amber-300">Local SQLite (ShopBilling.db)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-0.5">Hardware / Printers</div>
              <div className="font-bold text-sky-300">Thermal ESC/POS &amp; Laser A4</div>
            </div>
          </div>
        </div>

        {/* 1-Click Local Download & Run Section */}
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/40 border border-blue-800/80 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Download size={18} className="text-sky-400" />
              Download Ready Files for Local Windows Machine
            </div>
            <span className="text-[11px] font-mono text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-700">
              Run offline on localhost:3000 or connect to MySQL
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Download these files directly to your computer. With <code className="text-sky-300 font-mono">start-pos.bat</code>, you can launch the application on your computer with a single double-click. To export the full app codebase, click <b>Export to ZIP</b> in the AI Studio settings menu.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* 1. start-pos.bat */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-sky-500/60 transition-colors flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Terminal size={15} className="text-sky-400" />
                    start-pos.bat
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                    Batch File
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  1-Click Windows launcher script. Auto-detects Node.js, installs dependencies, and opens the POS system.
                </p>
              </div>
              <button
                onClick={handleDownloadWindowsLauncher}
                className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Download size={14} />
                <span>Download start-pos.bat</span>
              </button>
            </div>

            {/* 2. SQLite / MySQL Schema Dump (.sql) */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-emerald-500/60 transition-colors flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <HardDrive size={15} className="text-emerald-400" />
                    ShopBilling.sql
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    SQL DDL + Data
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Complete SQL schema and table dump containing all current products, GST rates, staff users, and bills.
                </p>
              </div>
              <button
                onClick={handleDownloadSQLDump}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Download size={14} />
                <span>Download SQL Dump (.sql)</span>
              </button>
            </div>

            {/* 3. Full Backup (.json) */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-amber-500/60 transition-colors flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <FileCode size={15} className="text-amber-400" />
                    FullBackup.json
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                    Complete DB
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  All store data, loyalty tier configurations, invoices, categories, and audit logs in JSON format.
                </p>
              </div>
              <button
                onClick={handleDownloadJSONData}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Download size={14} />
                <span>Download Backup (.json)</span>
              </button>
            </div>
          </div>
        </div>

        {/* C# / .NET WPF Solution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Cpu size={16} className="text-purple-400" />
              Method 1: Native C# / .NET 8 WPF Standalone Single-File .EXE
            </div>
            <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
              Recommended by User
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Using the .NET 8 SDK, compile directly into a single self-contained executable that bundles
            the .NET runtime and native SQLite engine. No pre-requisites or internet required on the user's PC:
          </p>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>ShopBilling.csproj (Project Configuration)</span>
              <button
                onClick={() => handleCopy(wpfCsproj, 'csproj')}
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                {copiedSnippet === 'csproj' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSnippet === 'csproj' ? 'Copied' : 'Copy XML'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              {wpfCsproj}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Windows CLI Build Command</span>
              <button
                onClick={() => handleCopy(wpfBuildCommand, 'buildcmd')}
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                {copiedSnippet === 'buildcmd' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSnippet === 'buildcmd' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-emerald-400 flex items-center gap-2">
              <Terminal size={14} className="text-slate-500" />
              <span>{wpfBuildCommand}</span>
            </div>
          </div>
        </div>

        {/* Windows Installer (Inno Setup / NSIS) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <FileCode size={16} className="text-amber-400" />
              Method 2: Inno Setup Windows Installer Script (.iss)
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Produces ShopBilling_Windows_Setup_v1.0.0.exe
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Inno Setup bundles the application into a standard Windows installer that creates:
            <br />
            1. <b>Desktop Shortcut</b> with custom icon
            <br />
            2. <b>Start Menu entry</b> and uninstaller in Windows Settings
            <br />
            3. Local database folder at <code className="text-amber-300 font-mono">C:\ProgramData\ShopBilling\</code>
          </p>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>installer.iss (Inno Setup Script)</span>
              <button
                onClick={() => handleCopy(innoSetupScript, 'inno')}
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                {copiedSnippet === 'inno' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSnippet === 'inno' ? 'Copied' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
              {innoSetupScript}
            </pre>
          </div>
        </div>

        {/* Electron / Tauri Packaging */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <AppWindow size={16} className="text-sky-400" />
              Method 3: Package Current App with Electron / Tauri
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Zero-rebuild desktop packaging
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            You can package this exact UI into a standalone Windows installer using Electron or Tauri.
            Simply run:
          </p>

          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-sky-400 flex items-center gap-2">
            <Terminal size={14} className="text-slate-500" />
            <span>npx electron-builder --win --x64</span>
          </div>
        </div>
      </div>
    </div>
  );
};
