const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const isDev = !app.isPackaged;

let mainWindow;
const userDataPath = app.getPath('userData');
const accountsFilePath = path.join(userDataPath, 'accounts.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: false,
    titleBarStyle: 'hiddenInset',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Window control handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Account storage handlers
ipcMain.handle('accounts:load', async () => {
  try {
    const data = await fs.readFile(accountsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    console.error('Failed to load accounts:', err);
    return [];
  }
});

ipcMain.handle('accounts:save', async (event, accounts) => {
  try {
    await fs.writeFile(accountsFilePath, JSON.stringify(accounts, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Failed to save accounts:', err);
    return { success: false, error: err.message };
  }
});

// IPC Handlers for IMAP/SMTP
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');

// Folder mapping with fallbacks
const folderCandidates = {
  inbox: ['INBOX'],
  sent: ['Sent', 'Sent Mail', 'Sent Items', '[Gmail]/Sent Mail', 'INBOX.Sent'],
  drafts: ['Drafts', 'Draft', '[Gmail]/Drafts', 'INBOX.Drafts'],
  spam: ['Junk', 'Junk E-mail', 'Spam', '[Gmail]/Spam', 'INBOX.Spam', 'INBOX.Junk'],
  trash: ['Trash', 'Deleted Items', 'Bin', '[Gmail]/Trash', 'INBOX.Trash']
};

async function openBoxWithFallback(client, folderKey) {
  const candidates = folderCandidates[folderKey] || [folderKey];

  for (const candidate of candidates) {
    try {
      const lock = await client.getMailboxLock(candidate);
      console.log(`Successfully opened mailbox: ${candidate}`);
      return { lock, mailbox: candidate };
    } catch (err) {
      console.log(`Failed to open ${candidate}, trying next...`);
    }
  }

  throw new Error(`Could not open any mailbox for ${folderKey}`);
}

ipcMain.handle('mail:login', async (event, config) => {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    logger: false
  });

  try {
    await client.connect();
    await client.logout();
    return { success: true };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('mail:send', async (event, { config, mail }) => {
  const transporter = nodemailer.createTransport({
    host: config.host.replace('imap', 'smtp'),
    port: 465,
    secure: true,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  try {
    await transporter.sendMail({
      from: config.user,
      to: mail.to,
      subject: mail.subject,
      text: mail.text
    });
    return { success: true };
  } catch (err) {
    console.error('Send error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('mail:fetch', async (event, config, folder = 'inbox') => {
  console.log('Fetching emails from folder:', folder);
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    logger: false
  });

  try {
  await client.connect();

    const { lock, mailbox } = await openBoxWithFallback(client, folder);

    try {
      const messages = [];

      // Get mailbox status to check if it's empty
      const status = await client.status(mailbox, { messages: true });

      if (!status.messages || status.messages === 0) {
        console.log(`Mailbox ${mailbox} is empty`);
        return { success: true, messages: [] };
      }

      // Fetch messages only if mailbox has content
      // Use '1:*' only when there are messages, otherwise skip
      for await (let message of client.fetch('1:*', {
        envelope: true,
        source: true,
        bodyStructure: true
      })) {
  try {
          // Parse the full message to get body content
          const parsed = await simpleParser(message.source);

        messages.push({
            uid: message.uid,
            subject: message.envelope.subject || '(No Subject)',
            from: message.envelope.from?.[0]?.address || '(Unknown)',
            date: message.envelope.date?.toISOString() || new Date().toISOString(),
            htmlBody: parsed.html || parsed.textAsHtml || '',
            textBody: parsed.text || '',
            folder: mailbox
        });
        } catch (parseErr) {
          console.error('Failed to parse message:', parseErr);
    }
      }

      // Sort by date descending
      messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Return last 50
      const result = messages.slice(-50);
      console.log(`Fetched ${result.length} messages from ${mailbox}`);

      return { success: true, messages: result };
  } finally {
    lock.release();
    await client.logout();
  }
  } catch (err) {
    console.error('Fetch error:', err);
    return { success: false, error: err.message, messages: [] };
  }
});
