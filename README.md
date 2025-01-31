<!-- markdownlint-disable MD029 -->

# Custom Disc Creator

If you want to just use the website, you can access it [here](https://customdisccreator.squareweb.app/).  
Se você deseja apenas usar o site, você pode acessá-lo [aqui](https://customdisccreator.squareweb.app/).

[🇺🇸 English Version](#custom-disc-creator---en)  
[🇧🇷 Versão em Português](#custom-disc-creator---pt-br)

# Custom Disc Creator - EN

A website to create custom music discs for Minecraft using the game's custom resource system.

## 🎯 Features

- Creation of custom music discs
- Support for Minecraft 1.21 and 1.21.4+
- Automatic conversion of stereo audio to mono
- Upload of custom images for the discs
- Automatic generation of complete datapack
- Automatic cleanup system for temporary files
- User-friendly and intuitive interface

## 🔧 Technical Requirements

- Python 3.8+
- Flask
- FFmpeg (for audio conversion)

## 🏠 Self-Hosting

1. Clone the repository:

```bash
git clone https://github.com/MatheusHMafra/CustomDiscCreator.git
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Install FFmpeg:
   - Windows: Download from [FFmpeg website](https://ffmpeg.org/download.html)
   - Linux: `sudo apt install ffmpeg`
   - macOS: `brew install ffmpeg`

4. Configure the server:
   - Open config.py and edit the settings

5. Run the application:

```bash
python app.py
```

The server will start at `http://localhost:80`

## 📦 Supported Formats

- Audio: .ogg
- Images: .png
- Pack Format: 34-45

## 🚀 How to Use

1. Access the website
2. Add your discs using the "+" button
3. For each disc:
   - Upload an image (optional)
   - Enter a title
   - Enter the author's name
   - Upload the audio file (.ogg)
4. Configure the package information:
   - Package icon (optional)
   - Package title (optional)
   - Description (optional)
   - Format version (optional)
5. Select the Minecraft version (1.21 or 1.21.4+)
6. Click "Download" to generate the datapack

## ⚙️ Server Configuration

The server has:

- Cache system for temporary files
- Request limit per minute
- Automatic conversion of stereo audio to mono
- Automatic cleanup of old logs

## 🔒 Limitations

- Only .ogg audio files are supported
- Images must be in .png format

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or create issues.

## 📝 License

This project is under the AGPL-3.0 license. See the LICENSE file for more details.

---
---

# Custom Disc Creator - PT-BR

Um site para criar discos de música personalizados para Minecraft usando o sistema de recursos customizados do jogo.

## 🎯 Funcionalidades

- Criação de discos de música personalizados
- Suporte para Minecraft 1.21 e 1.21.4+
- Conversão automática de áudio estéreo para mono
- Upload de imagens personalizadas para os discos
- Geração automática de datapack completo
- Sistema de limpeza automática de arquivos temporários
- Interface amigável e intuitiva

## 🔧 Requisitos Técnicos

- Python 3.8+
- Flask
- FFmpeg (para conversão de áudio)

## 🏠 Auto-Hospedagem

1. Clone o repositório:

```bash
git clone https://github.com/MatheusHMafra/CustomDiscCreator.git
```

2. Instale as dependências:

```bash
pip install -r requirements.txt
```

3. Instale o FFmpeg:
   - Windows: Baixe do [site do FFmpeg](https://ffmpeg.org/download.html)
   - Linux: `sudo apt install ffmpeg`
   - macOS: `brew install ffmpeg`

4. Configure o servidor:
   - Abra o arquivo config.py e edite as configurações

5. Execute a aplicação:

```bash
python app.py
```

O servidor iniciará em `http://localhost:80`

## 📦 Formatos Suportados

- Áudio: .ogg
- Imagens: .png
- Pack Format: 34-45

## 🚀 Como Usar

1. Acesse o site
2. Adicione seus discos usando o botão "+"
3. Para cada disco:
   - Faça upload de uma imagem (opcional)
   - Digite um título
   - Digite o nome do autor
   - Faça upload do arquivo de áudio (.ogg)
4. Configure as informações do pacote:
   - Ícone do pacote (opcional)
   - Título do pacote (opcional)
   - Descrição (opcional)
   - Versão do formato (opcional)
5. Selecione a versão do Minecraft (1.21 ou 1.21.4+)
6. Clique em "Download" para gerar o datapack

## ⚙️ Configurações do Servidor

O servidor possui:

- Sistema de cache para arquivos temporários
- Limite de requisições por minuto
- Conversão automática de áudio estéreo para mono
- Limpeza automática de logs antigos

## 🔒 Limitações

- Apenas arquivos de áudio .ogg são suportados
- Imagens devem ser no formato .png

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, sinta-se à vontade para enviar pull requests ou criar issues.

## 📝 Licença

Este projeto está sob a licença AGPL-3.0. Veja o arquivo LICENSE para mais detalhes.
