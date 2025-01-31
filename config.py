import os

# Configurações do servidor
IP = "127.0.0.8"
PORT = 80
CACHE = 86400
SECRET_KEY = os.urandom(24)

# Configurações de Logs
LOG_DIR = "server/log"
OLD_LOG_DIR = "server/old_logs"
LOG_FILE = "server/log/server.log"