#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 Starting Next.js Deployment for dooaraidee.online"
echo "=========================================================="

# 1. Install Node.js 22 LTS & PM2 if not installed
echo "[1/6] Checking Node.js and PM2..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 20 ]; then
    echo "Installing Node.js 22 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs build-essential
fi

echo "  - Node: $(node -v)"
echo "  - NPM:  v$(npm -v)"

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# 2. Setup Project Folder
echo "[2/6] Setting up project directory..."
APP_DIR="/home/pun0611/movie-tag-search"

if [ -d "$APP_DIR/.git" ]; then
    echo "Updating existing repository..."
    cd "$APP_DIR"
    git fetch --all
    git reset --hard origin/main
else
    echo "Cloning repository..."
    mkdir -p /home/pun0611
    git clone https://github.com/parinratron-svg/movie-tag-search.git "$APP_DIR"
    cd "$APP_DIR"
fi

# 3. Create .env file
echo "[3/6] Setting environment variables..."
cat << 'EOF' > "$APP_DIR/.env"
DATABASE_URL="postgresql://neondb_owner:npg_pHMC9UWDtJA1@ep-billowing-frog-a5hxzoft-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
TMDB_API_KEY="cbff2f0fcbbb89bbd20ee068baed5b58"
JWT_SECRET="doo-arai-dee-super-secret-key-2026-change-this"
PORT=3000
NODE_ENV=production
EOF

# 4. Build Next.js
echo "[4/6] Installing dependencies and building..."
cd "$APP_DIR"
npm install
npx prisma generate
npm run build

# 5. Run with PM2
echo "[5/6] Starting application with PM2 on port 3000..."
pm2 delete movie-tag-search 2>/dev/null || true
pm2 start npm --name "movie-tag-search" -- start -- -p 3000
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# 6. Configure Nginx Reverse Proxy for HestiaCP
echo "[6/6] Configuring Nginx Reverse Proxy..."

setup_nginx_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "Updating $file..."
        cp "$file" "${file}.bak_$(date +%s)"
        
        # Check if /_next/ block already exists
        if ! grep -q "/_next/" "$file"; then
            # Add /_next/ block before the first location block
            sed -i '/location \/ {/i \    location /_next/ {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection "upgrade";\n        proxy_set_header Host $host;\n        proxy_cache_bypass $http_upgrade;\n    }\n' "$file"
        fi

        # Update root location / to proxy to 3000
        awk '
            /location \/ {/ {
                in_root=1
                print "    location / {"
                print "        proxy_pass http://127.0.0.1:3000;"
                print "        proxy_http_version 1.1;"
                print "        proxy_set_header Upgrade $http_upgrade;"
                print "        proxy_set_header Connection '\''upgrade'\'';"
                print "        proxy_set_header Host $host;"
                print "        proxy_set_header X-Real-IP $remote_addr;"
                print "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
                print "        proxy_set_header X-Forwarded-Proto $scheme;"
                print "        proxy_cache_bypass $http_upgrade;"
                print "    }"
                next
            }
            in_root && /}/ {
                in_root=0
                next
            }
            !in_root { print }
        ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    fi
}

# Search all possible config locations in HestiaCP
for f in \
    /home/pun0611/conf/web/dooaraidee.online/nginx.conf \
    /home/pun0611/conf/web/dooaraidee.online/nginx.ssl.conf \
    /etc/nginx/conf.d/domains/dooaraidee.online.conf \
    /etc/nginx/conf.d/domains/dooaraidee.online.ssl.conf; do
    setup_nginx_file "$f"
done

echo "Testing Nginx configuration..."
nginx -t
systemctl reload nginx

echo "=========================================================="
echo "🎉 SUCCESS! The Next.js app is deployed and running!"
echo "🔗 Open in browser: https://dooaraidee.online"
echo "=========================================================="
