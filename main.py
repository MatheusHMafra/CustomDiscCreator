import logging
from logging import info, error
import time
import uuid
from pathlib import Path
from waitress import serve
from flask import Flask, request, render_template, jsonify, send_file
from pydub.audio_segment import AudioSegment
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import config
from config import IP, PORT, CACHE, LOG_DIR

# Configuração do tempo máximo de retenção dos logs (em dias)
MAX_LOG_AGE_DAYS = 3

# Configurar diretórios
TEMP_DIR = Path("server/temp")
LOG_DIR = Path(config.LOG_DIR)
OLD_LOG_DIR = Path(config.OLD_LOG_DIR)
TEMP_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)
OLD_LOG_DIR.mkdir(exist_ok=True)

# Configurações do APP
app = Flask(__name__, static_folder="static", template_folder="pages")
app.secret_key = config.SECRET_KEY
limiter = Limiter(key_func=get_remote_address, app=app, default_limits=["60 per minute"])

# Páginas

@app.route("/")
@limiter.limit("60 per minute")
def index():
    info("Página solicitada: ( '/' ) ")
    return render_template("index.html")

@app.route("/convert_to_mono", methods=["POST"])
@limiter.limit("60 per minute")
def convert_to_mono():
    info(f"Convertendo novo arquivo de áudio para mono. IP: {request.remote_addr} Arquivo: {request.files['audio'].filename}")
    try:
        file = request.files["audio"]
        audio = AudioSegment.from_file(file)
        mono_audio = audio.set_channels(1)
        output_path = TEMP_DIR / f"{uuid.uuid4()}.ogg"
        mono_audio.export(output_path, format="ogg")
        return send_file(output_path, as_attachment=True)
    except Exception as e:
        error(f"Erro ao converter áudio: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Limpar arquivos temporários mais antigos que 1 hora
        current_time = time.time()
        for temp_file in TEMP_DIR.glob("*.ogg"):
            if current_time - temp_file.stat().st_mtime > 3600:
                temp_file.unlink()

def setup_logging():
    handlers = [
        logging.StreamHandler(),
        logging.FileHandler(config.LOG_FILE, encoding="utf-8")
    ]
    
    log_format = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
    for handler in handlers:
        handler.setLevel(logging.INFO)
        handler.setFormatter(log_format)
        logging.getLogger("").addHandler(handler)
    
    logging.getLogger("").setLevel(logging.INFO)

def cleanup_old_logs():
    """Remove arquivos de log mais antigos que MAX_LOG_AGE_DAYS"""
    current_time = time.time()
    max_age_seconds = MAX_LOG_AGE_DAYS * 24 * 3600
    
    for log_file in OLD_LOG_DIR.glob("server_*.log"):
        if current_time - log_file.stat().st_mtime > max_age_seconds:
            try:
                log_file.unlink()
                info(f"Log antigo removido: {log_file}")
            except Exception as e:
                error(f"Erro ao remover log antigo {log_file}: {e}")

def run_server(ip, port):
    try:
        info(f"Servidor iniciado às {time.strftime('%d/%m/%Y %H:%M:%S')}")
        serve(app, host=ip, port=port)
    except Exception as e:
        error(f"Erro no servidor: {e}")
        raise
    finally:
        info(f"Servidor interrompido às {time.strftime('%d/%m/%Y %H:%M:%S')}")
        # Backup do log
        now = time.strftime("%d-%m-%Y_%H_%M_%S")
        with open(config.LOG_FILE, "r", encoding="utf-8") as src, \
             open(OLD_LOG_DIR / f"server_{now}.log", "w", encoding="utf-8") as dst:
            dst.write(src.read())

if __name__ == "__main__":
    setup_logging()
    cleanup_old_logs()  # Limpar logs antigos antes de iniciar
    
    with open(config.LOG_FILE, "w", encoding="utf-8") as f:
        f.write(f"""
--- Arquivo de Log para o Servidor ---
--- Configurações do servidor ---
IP: {IP}
PORT: {PORT}
CACHE: {CACHE}

--- Inicializando.... ---

--- Mensagens de log ---
""")
    
    run_server(IP, PORT)
