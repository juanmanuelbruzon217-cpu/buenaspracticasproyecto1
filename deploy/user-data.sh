#!/bin/bash
export HOME=/root
dnf install -y git nodejs
git clone --branch dev https://github.com/juanmanuelbruzon217-cpu/buenaspracticasproyecto1.git /opt/app
cd /opt/app/api
npm install --omit=dev

cat > /etc/systemd/system/reservas.service <<'EOF'
[Unit]
Description=API de reservas de eventos
After=network.target

[Service]
WorkingDirectory=/opt/app/api
Environment=PORT=80
Environment=FRONT_URL=http://cuc-bp-eq04-bruzon-sitio-2026.s3-website-us-east-1.amazonaws.com
ExecStart=/usr/bin/node src/servidor.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now reservas