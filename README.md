# ⚡ FluxMail

> A futuristic, cyberpunk-themed email client built with Next.js and Electron

<div align="center">

![FluxMail Banner](https://img.shields.io/badge/STATUS-ENCRYPTED-00f2ff?style=for-the-badge)
![License](https://img.shields.io/badge/LICENSE-MIT-bc13fe?style=for-the-badge)
![Platform](https://img.shields.io/badge/PLATFORM-Linux%20|%20Windows%20|%20Mac-00f2ff?style=for-the-badge)

</div>

## ✨ Features

- 🎨 **Cyberpunk Aesthetic** - Animated UI with neon gradients, scanlines, and floating particles
- 📧 **Multi-Account Support** - Manage multiple email accounts simultaneously
- 🔐 **IMAP/SMTP** - Full email functionality with standard protocols
- 🗂️ **Smart Folders** - Automatic folder detection (Inbox, Sent, Drafts, Junk, Trash)
- ⚡ **Fast & Native** - Built on Electron for a native desktop experience
- 🌈 **Smooth Animations** - Powered by Framer Motion for fluid interactions
- 🔒 **Secure** - Context isolation and secure IPC communication

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Framework**: Tailwind CSS 4, Framer Motion
- **Desktop**: Electron
- **Email**: ImapFlow, Nodemailer, Mailparser
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 24+
- npm or yarn

### Clone & Install

```bash
git clone https://github.com/yourusername/flux_mail_client.git
cd flux_mail_client
npm install
```

## 🚀 Development

Start the development server with hot-reload:

```bash
npm run electron:dev
```

This will:
1. Start Next.js dev server on `http://localhost:3000`
2. Launch Electron window automatically

## 🏗️ Building

Build for your platform:

```bash
# Linux
npm run electron:build:linux

# Windows
npm run electron:build:win

# macOS
npm run electron:build:mac

# All platforms
npm run electron:build
```

Built applications will be in the `dist/` directory.

### Supported Output Formats

- **Linux**: AppImage, deb
- **Windows**: NSIS installer, portable exe
- **macOS**: DMG, zip

## 📖 Usage

### Adding an Account

1. Click **"ADD_NODE"** button in the sidebar
2. Enter your email credentials:
    - **Node Label**: Friendly name for the account
    - **IMAP User**: Your email address
    - **Access Key**: Your email password or app-specific password
    - **Host**: IMAP server (e.g., `imap.gmail.com`)
    - **Port**: Usually `993` for secure IMAP
3. Click **"INITIATE_CONNECTION"**

### Gmail Users

For Gmail, you'll need to use an [App Password](https://support.google.com/accounts/answer/185833):
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password for "Mail"
3. Use the App Password in FluxMail instead of your regular password

### Composing Email

1. Select an active account
2. Click **"NEW_TRANSMISSION"**
3. Fill in recipient, subject, and message
4. Click **"EXECUTE_TRANSMISSION"**

### Managing Folders

Click any folder in the sidebar to view emails:
- **INBOX** - Received emails
- **SENT** - Sent emails
- **DRAFTS** - Draft emails
- **JUNK** - Spam/junk mail
- **TRASH** - Deleted emails

## 🎨 Customization

### Color Scheme

The app uses CSS custom properties. Edit `app/globals.css` to customize colors:

```css
--neon-blue: 0 242 255;
--neon-purple: 188 19 254;
--background: 0 0 0;
```

### Animations

Animation speeds can be adjusted in `tailwind.config.ts` and component files.

## 🐛 Troubleshooting

### Email Won't Load

- Verify IMAP settings are correct
- Check that IMAP is enabled in your email provider
- For Gmail, ensure you're using an App Password
- Check firewall/antivirus isn't blocking ports 993 (IMAP) or 587 (SMTP)

### Build Errors

If you encounter build errors:

```bash
# Clear Next.js cache
rm -rf .next out

# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run electron:build
```

### Fonts Not Loading

If custom fonts don't appear in production, ensure `assetPrefix: './'` is set in `next.config.ts`.

## 📁 Project Structure

```
flux_mail_client/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles & animations
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main email interface
├── components/            # React components
│   └── TitleBar.tsx       # Custom title bar
├── electron/              # Electron main process
│   ├── main.js           # Main process entry
│   └── preload.js        # Preload script (IPC bridge)
├── types/                 # TypeScript definitions
├── public/               # Static assets
├── out/                  # Build output (Next.js)
├── dist/                 # Distribution files (Electron)
└── package.json          # Dependencies & scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [ImapFlow](https://github.com/postalsys/imapflow) - IMAP client
- [Nodemailer](https://nodemailer.com/) - Email sending
- [Lucide](https://lucide.dev/) - Icon library

## 📧 Contact

**Zytronium** - zytronium@zytronium.dev

Project Link: [https://github.com/zytronium/flux_mail_client](https://github.com/yourusername/flux_mail_client)

### Notice:
This email client does **NOT** encrypt mail. The displayed text in the bottom-left of the app and top of this readme claiming encryption are **purely decorational**.

---

<div align="center">

**⚡ TRANSMISSION_COMPLETE ⚡**

Made with 💜 and ⚡ by Zytronium

</div>
