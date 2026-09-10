const {app,BrowserWindow,Menu,ipcMain}=require('electron');
const path=require('path');
function createWindow(){
  const win=new BrowserWindow({width:1280,height:720,minWidth:960,minHeight:540,backgroundColor:'#090b10',show:false,autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname,'..','index.html'));
  win.once('ready-to-show',()=>win.show());
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.on('enter-full-screen',()=>win.webContents.send?.('fullscreen',true));
  return win;
}
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
