#!/usr/bin/env bash
# Puts the last commit of the current branch on the temporary server, builds it there and
# restarts the site. Uncommitted changes are not sent.
#
#   ./deploy.sh              the code only
#   ./deploy.sh --with-data  also copies this machine's CMS database and uploaded media
#                            to the server, REPLACING what is there. Needed the first time
#                            (the local database must be running: npm run db:up).
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
repo="$(git -C "$here" rev-parse --show-toplevel)"
ip="$(terraform -chdir="$here" output -raw server_ip)"
url="$(terraform -chdir="$here" output -raw site_url)"
key="${DEPLOY_KEY:-$HOME/.ssh/proxa-lp-temp}"
ssh_opts=(-i "$key" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 -o ServerAliveInterval=30)
host="ubuntu@$ip"
app=/opt/proxa-lp/app
with_data=no
[ "${1:-}" = "--with-data" ] && with_data=yes

echo "==> Waiting for the server ($ip)"
for _ in $(seq 1 60); do
  ssh "${ssh_opts[@]}" "$host" true 2>/dev/null && break
  sleep 5
done
# The first boot installs Docker and Node; this returns at once on later runs.
ssh "${ssh_opts[@]}" "$host" 'cloud-init status --wait >/dev/null; node -v && docker --version'

echo "==> Sending commit $(git -C "$repo" log -1 --format='%h %s')"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git -C "$repo" archive HEAD | tar -x -C "$tmp"
rsync -az --delete -e "ssh ${ssh_opts[*]}" \
  --exclude /.env --exclude /node_modules --exclude /.next --exclude /next-env.d.ts \
  --exclude /media --exclude /files \
  "$tmp/" "$host:$app/"

echo "==> Server settings, database and service (created once)"
ssh "${ssh_opts[@]}" "$host" 'bash -s' <<'REMOTE'
set -euo pipefail
cd /opt/proxa-lp/app
if [ ! -f .env ]; then
  # Secrets are made on the server and never leave it.
  dbpass="$(openssl rand -hex 24)"
  sudo docker run -d --name proxa-lp-db --restart unless-stopped \
    -e POSTGRES_USER=proxa -e POSTGRES_PASSWORD="$dbpass" -e POSTGRES_DB=proxa_site \
    -v proxa_lp_pgdata:/var/lib/postgresql/data -p 127.0.0.1:5432:5432 postgres:16 >/dev/null
  umask 077
  {
    echo "DATABASE_URL=postgres://proxa:$dbpass@127.0.0.1:5432/proxa_site"
    echo "PAYLOAD_SECRET=$(openssl rand -hex 32)"
    echo "PREVIEW_SECRET=$(openssl rand -hex 32)"
  } > .env
fi
if [ ! -f /etc/systemd/system/proxa-lp.service ]; then
  sudo tee /etc/systemd/system/proxa-lp.service >/dev/null <<'UNIT'
[Unit]
Description=Proxa site (temporary host)
After=network-online.target docker.service
Wants=network-online.target

[Service]
User=ubuntu
WorkingDirectory=/opt/proxa-lp/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p 80
AmbientCapabilities=CAP_NET_BIND_SERVICE
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT
  sudo systemctl daemon-reload
  sudo systemctl enable proxa-lp >/dev/null 2>&1
fi
# Ready means answering on the network port, not only on the socket used while it starts up.
for _ in $(seq 1 60); do
  sudo docker exec proxa-lp-db pg_isready -q -h 127.0.0.1 -U proxa -d proxa_site && break
  sleep 2
done
REMOTE

if [ "$with_data" = yes ]; then
  echo "==> Copying the CMS database and media to the server"
  (cd "$repo" && docker compose exec -T db pg_dump -U proxa --no-owner --no-acl --clean --if-exists proxa_site) \
    | ssh "${ssh_opts[@]}" "$host" 'sudo docker exec -i proxa-lp-db psql -q -v ON_ERROR_STOP=1 -U proxa -d proxa_site >/dev/null'
  for dir in media files; do
    [ -d "$repo/$dir" ] && rsync -az --delete -e "ssh ${ssh_opts[*]}" "$repo/$dir/" "$host:$app/$dir/"
  done
fi

echo "==> Installing packages and building on the server (a few minutes)"
ssh "${ssh_opts[@]}" "$host" 'bash -s' <<'REMOTE'
set -euo pipefail
cd /opt/proxa-lp/app
lock="$(sha256sum package-lock.json | cut -d" " -f1)"
if [ "$(cat node_modules/.lock-hash 2>/dev/null || true)" != "$lock" ]; then
  npm ci --no-audit --no-fund
  echo "$lock" > node_modules/.lock-hash
fi
npm run build
sudo systemctl restart proxa-lp
for _ in $(seq 1 30); do
  curl -sf -o /dev/null http://127.0.0.1/robots.txt && break
  sleep 2
done
curl -s -o /dev/null -w "home page on the server: %{http_code}\n" http://127.0.0.1/
REMOTE

echo "==> Done: $url"
