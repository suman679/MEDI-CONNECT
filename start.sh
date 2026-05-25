#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  🏥  MediConnect — Telemedicine Platform    ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT_DIR/backend"
FRONTEND="$ROOT_DIR/frontend"

# Install dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd "$BACKEND" && npm install

echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd "$FRONTEND" && npm install --legacy-peer-deps

# Check MongoDB
if ! command -v mongod &>/dev/null && ! pgrep mongod &>/dev/null; then
  echo -e "${YELLOW}⚠️  MongoDB not detected. Make sure MongoDB is running.${NC}"
fi

# Seed database
echo -e "${YELLOW}🌱 Seeding database with sample data...${NC}"
cd "$BACKEND" && node utils/seeder.js

echo -e "\n${GREEN}✅ Setup complete! Starting servers...${NC}\n"
echo -e "  Backend:  ${CYAN}http://localhost:5000${NC}"
echo -e "  Frontend: ${CYAN}http://localhost:3000${NC}"
echo -e "  Health:   ${CYAN}http://localhost:5000/health${NC}\n"

echo -e "${YELLOW}Demo Credentials:${NC}"
echo -e "  Admin:   admin@mediconnect.com   / Admin@123"
echo -e "  Patient: arjun@example.com       / Patient@123"
echo -e "  Doctor:  dr.priya@mediconnect.com / Doctor@123\n"

# Start both servers
cd "$BACKEND"  && node server.js &
BACKEND_PID=$!
cd "$FRONTEND" && npx react-scripts start &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e '\n${GREEN}Servers stopped.${NC}'" EXIT INT TERM
wait $BACKEND_PID $FRONTEND_PID
