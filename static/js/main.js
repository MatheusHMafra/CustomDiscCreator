// Constantes globais
const CONSTANTS = {
    DEFAULT_IMAGE: 'static/images/star.png',
    BASE_CUSTOM_MODEL_DATA: 37000,
    WANTED_CHARACTERS: 'a-zA-Z0-9'
};

// Cache de elementos DOM frequentemente usados
const DOM_ELEMENTS = {
    playlistDiv: document.getElementById('playlist-div'),
    toggle: document.getElementById('toggle'),
    toggleLabel: document.getElementById('toggle-label'),
    loader: document.getElementById('loader')
};

let musicDiscIndexId = 0;

// Função para atualizar label
const updateLabel = () => {
    const version = DOM_ELEMENTS.toggle.checked ? '1.21.4' : '1.21';
    DOM_ELEMENTS.toggleLabel.textContent = DOM_ELEMENTS.toggle.checked ? '1.21.4+' : '1.21-3';
    DOM_ELEMENTS.toggleLabel.setAttribute("mc_version", version);
};

// Event listeners iniciais
DOM_ELEMENTS.toggle.addEventListener('change', updateLabel);
updateLabel();

// Função para criar elementos
const createElement = (type, attributes = {}, children = []) => {
    const element = document.createElement(type);
    Object.entries(attributes).forEach(([key, value]) => element[key] = value);
    children.forEach(child => element.appendChild(child));
    return element;
};

// Função para adicionar disco
const addMusicDisc = () => {
    const newMusicDisc = createElement('div', {
        className: 'song',
        id: `song${musicDiscIndexId}`
    });

    newMusicDisc.innerHTML = `
        <li class="song-image-li song-item">
            <div class="song-image-container">
                <label for="songImageInput${musicDiscIndexId}" class="song-image-label">
                    <div class="song-image" id="songImagePreview${musicDiscIndexId}">
                        <span class="upload-text">Upload Image</span>
                    </div>
                </label>
                <input type="file" id="songImageInput${musicDiscIndexId}" name="song-image-input" class="song-image-input" accept="image/png" style="display: none;" onchange="showImage(event, 'songImagePreview${musicDiscIndexId}', true)"/>
            </div>
        </li>
        <li class="song-title-li song-item">
            <div class="song-title">
                <input type="text" class="song-title-input text-input" id="songTitle${musicDiscIndexId}" placeholder="Enter title" value="Title">
            </div>
        </li>
        <li class="song-author-li song-item">
            <div class="song-author">
                <input type="text" class="song-author-input text-input" id="songAuthor${musicDiscIndexId}" placeholder="Enter author" value="Author">
            </div>
        </li>
        <li class="song-file-li song-item">
            <div class="song-file">
                <label for="songFile${musicDiscIndexId}" class="song-file-label">
                    No File &#10515
                </label>
                <input type="file" class="file-input" id="songFile${musicDiscIndexId}" accept="audio/ogg" style="display: none;" onchange="showFileName(event, 'songFile${musicDiscIndexId}', ${musicDiscIndexId})">
            </div>
        </li>
        <li class="song-length-li song-item">
            <div class="song-length" id="songFileLength${musicDiscIndexId}">
                00:00
            </div>
        </li>
        <li class="song-remove song-item">
            <div id="removeSong" class="remove-song-button">
                <span class="cross-sign" onclick="removeMusicDisc('song${musicDiscIndexId}')">⨉</span>
            </div>
        </li>
    `;

    DOM_ELEMENTS.playlistDiv.appendChild(newMusicDisc);
    musicDiscIndexId++;
};

// Função para remover disco
const removeMusicDisc = (songId) => {
    document.getElementById(songId)?.remove();
};

// Show Pack Icon
document.addEventListener('DOMContentLoaded', function () {
    // Show default image when the page loads
    const defaultImagePath = 'static/images/star.png'; // Adjust path as needed
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.style.backgroundImage = 'url(' + defaultImagePath + ')';
    const uploadText = imagePreview.querySelector('.upload-text');
    if (uploadText) {
        uploadText.style.display = 'block'; // Show the upload text
    }
});

// Function to show image preview
function showImage(event, elementId, hideText) {
    const input = event.target;
    const reader = new FileReader();
    reader.onload = function () {
        const imagePreview = document.getElementById(elementId);
        imagePreview.style.backgroundImage = 'url(' + reader.result + ')';
        const uploadText = imagePreview.querySelector('.upload-text');
        if (uploadText && hideText) {
            uploadText.style.display = 'none'; // Hide the upload text
        }
    };
    reader.readAsDataURL(input.files[0]);
}

// Função para detectar canais de áudio
const detectAudioChannels = async (file) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer.numberOfChannels;
};

// Função para converter para mono
const convertToMono = async (file) => {
    try {
        const formData = new FormData();
        formData.append("audio", file);
        const response = await fetch("/convert_to_mono", { method: "POST", body: formData });
        
        if (!response.ok) throw new Error("Falha na conversão para mono");
        
        const monoBlob = await response.blob();
        alert("The audio file has been converted to mono.");
        return monoBlob;
    } catch (error) {
        console.error("Error converting to mono:", error);
        return file;
    }
};

// Função para mostrar nome do arquivo
const showFileName = async (event, elementId, songIndex) => {
    const input = event.target;
    if (!input.files?.[0]) return;

    const audioFile = input.files[0];
    const label = document.querySelector(`label[for="${elementId}"]`);
    if (!label) return;

    try {
        var numberOfChannels = await detectAudioChannels(audioFile);
        const isStereo = numberOfChannels === 2;

        if (isStereo && confirm("The audio file is stereo. Convert to mono?")) {
            const monoFile = await convertToMono(audioFile);
            const dataTransfer = new DataTransfer();
            const fileName = audioFile.name.replace(/\.[^/.]+$/, '') + '_mono.ogg';
            dataTransfer.items.add(new File([monoFile], fileName, { type: 'audio/ogg' }));
            input.files = dataTransfer.files;
            numberOfChannels = await detectAudioChannels(monoFile);
            updateAudioLength(monoFile, songIndex);
        } else {
            updateAudioLength(audioFile, songIndex);
        }
        label.textContent = `${audioFile.name} (${numberOfChannels === 1 ? 'Mono' : 'Stereo'})`;
    } catch (error) {
        console.error("Error processing audio file:", error);
    }
};

// Função para atualizar duração do áudio
const updateAudioLength = (file, songIndex) => {
    const audio = new Audio(URL.createObjectURL(file));
    audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
        
        const lengthDiv = document.getElementById(`songFileLength${songIndex}`);
        if (lengthDiv) {
            lengthDiv.setAttribute("song_length", duration.toString());
            lengthDiv.textContent = `${minutes}:${seconds}`;
        }
    });
};

// GENERATING PACK CODE //

// Main Function
const wantedCharacters = 'a-zA-Z0-9';
const unwantedCharactersPattern = new RegExp(`[^${wantedCharacters}]`, 'g');

const download = async () => {
    DOM_ELEMENTS.loader.style.display = 'block';
    
    try {
        const zip = new JSZip();
        const packName = document.getElementById('packTitle').value;
        const mc_version = DOM_ELEMENTS.toggleLabel.getAttribute("mc_version");

        await Promise.all([
            fetchPackImage(zip),
            fetchPackInfo(zip),
            createMusicDiscsDatapackFile(zip),
            createSoundJSON(zip),
            fetchSoundFile(zip),
            generateCustomModelData(zip, mc_version),
            createMcFunction(zip, mc_version)
        ]);

        const content = await zip.generateAsync({ type: "blob" });
        const downloadUrl = URL.createObjectURL(content);
        
        const link = createElement('a', {
            href: downloadUrl,
            download: `${packName}.zip`
        });
        link.click();
        URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Error generating ZIP:', error);
        alert('Error generating the pack. Please try again.');
    } finally {
        DOM_ELEMENTS.loader.style.display = 'none';
    }
};

// Generating Disc Data
async function createMusicDiscsDatapackFile(zip) {
    for (let i = 0; i < musicDiscIndexId; i++) {
        const songId = document.getElementById('song' + i);
        if (songId) {
            // Get the Song Title
            const songTitle = document.getElementById('songTitle' + i).value;

            // Get the song Author
            const songAuthor = document.getElementById('songAuthor' + i).value;

            // Get the Song Length
            const songLengthDiv = document.getElementById("songFileLength" + i);
            const songLengthString = songLengthDiv.getAttribute("song_length");
            const songLength = Number(songLengthString);
            if (!songLength) {
                window.alert("A Song has no file");
                throw new Error("A File is Missing");
            }

            let cleanedName = await cleanName(songTitle) + i;
            const musicDataJSON = {
                comparator_output: 1,
                description: songAuthor.concat(' - ', songTitle),
                length_in_seconds: songLength, // Assign the retrieved duration here
                sound_event: {
                    sound_id: `minecraft:music_disc.${cleanedName}`
                }
            };
            zip.file(`data/new_music/jukebox_song/${cleanedName}.json`, JSON.stringify(musicDataJSON, null, 2));
        } else {
            console.log(`SONG ID : ${i} Removed`);
        }
    }
}

// Generate Disc Sound Index File
async function createSoundJSON(zip) {
    const musicDiscData = {};
    for (let i = 0; i < musicDiscIndexId; i++) {
        const songId = document.getElementById('song' + i);
        if (songId) {
            // Get the Song Title
            const songTitle = document.getElementById('songTitle' + i).value;
            let songName = await cleanName(songTitle) + i;
            if (!musicDiscData["music_disc." + songName]) {
                musicDiscData["music_disc." + songName] = { sounds: [] };

                const soundData = {
                    name: `records/music_disc_${songName}`,
                    stream: true
                };

                musicDiscData["music_disc." + songName].sounds.push(soundData);
            }
        } else {
            console.log(`SONG ID : ${i} Removed`);
        }
    }
    const musicDiscDataJson = JSON.stringify(musicDiscData, null, 2);
    zip.file('assets/minecraft/sounds.json', musicDiscDataJson);
}

// Generate Assets for Minecraft
async function fetchSoundFile(zip) {
    for (let i = 0; i < musicDiscIndexId; i++) {
        const songId = document.getElementById('song' + i);
        if (songId) {
            // Get the Song Title
            const songTitle = document.getElementById('songTitle' + i).value;
            let songName = await cleanName(songTitle) + i;
            let audioInput = document.getElementById("songFile" + i);
            let audioFile = audioInput.files[0];

            zip.file(`assets/minecraft/sounds/records/music_disc_${songName}.ogg`, audioFile);
        } else {
            console.log(`SONG ID : ${i} Removed`);
        }
    }
}

// Generate Custom Model Data
async function generateCustomModelData(zip, mc_version) {
    let data;
    // Create the Custom Model Data
    if (mc_version == "1.21.4") {
        data = {
            "model": {
                "type": "select",
                "property": "custom_model_data",
                "fallback": {
                    "type": "model",
                    "model": "item/music_disc_13"
                },
                "cases": []
            }
        };
    } else {
        data = {
            "parent": "item/generated",
            "textures": {
                "layer0": "item/music_disc_13"
            },
            "overrides": []
        };
    }
    for (let i = 0; i < musicDiscIndexId; i++) {
        const songId = document.getElementById('song' + i);
        if (songId) {
            // Create the model File
            let discTextureInput = document.getElementById('songImageInput' + i);
            let discTexture = discTextureInput.files[0];
            const songTitle = document.getElementById('songTitle' + i).value;
            let songName = await cleanName(songTitle) + i;

            let TextureModelJson = {
                parent: "minecraft:item/generated",
                textures: {
                    layer0: "item/" + songName
                }
            };

            const discTextureModelJson = JSON.stringify(TextureModelJson, null, 2);
            zip.file(`assets/minecraft/models/item/${songName}.json`, discTextureModelJson);
            zip.file(`assets/minecraft/textures/item/${songName}.png`, discTexture);

            // Define the new case you want to add
            if (mc_version == "1.21.4") {
                let newCase = {
                    "when": songName,
                    "model": {
                        "type": "model",
                        "model": "item/" + songName
                    }
                };
                data.model.cases.push(newCase);
            } else {
                let newOverride = { "predicate": { "custom_model_data": i + 37000 }, "model": `item/${songName}` };
                data.overrides.push(newOverride);
            }
        } else {
            console.log(`SONG ID : ${i} Removed`);
        }
    }
    const jsonCMD = JSON.stringify(data, null, 2);
    if (mc_version == "1.21.4") {
        zip.file(`assets/minecraft/items/music_disc_13.json`, jsonCMD);
    } else {
        zip.file(`assets/minecraft/models/item/music_disc_13.json`, jsonCMD);
    }
}

// Loading Animation
function loadingAnimationActivate() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block'; // Show loader
}

function loadingAnimationDeactivate() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none'; // Hide loader
}

// Fetch an Image for the Pack
async function fetchPackImage(zip) {
    const packImageFileInput = document.getElementById('pack-icon-input');
    const packImage = packImageFileInput.files[0];
    if (packImage) {
        zip.file('pack.png', packImage, { base64: true });
    } else {
        const response = await fetch("static/images/star.png");
        const arrayBuffer = await response.arrayBuffer();
        zip.file('pack.png', arrayBuffer);
    }
}

// Mc Function
async function createMcFunction(zip, mc_version) {
    for (let i = 0; i < musicDiscIndexId; i++) {
        const songId = document.getElementById('song' + i);
        if (songId) {
            // Get the Song Title
            const songTitle = document.getElementById('songTitle' + i).value;
            let name = await cleanName(songTitle) + i;
            let textContent;
            if (mc_version == "1.21.4") {
                textContent = `#give ${songTitle} to player\ngive @s minecraft:music_disc_13[minecraft:jukebox_playable={song:"new_music:${name}"},minecraft:custom_model_data={strings:["${name}"]}]`;
            } else {
                textContent = `#give ${songTitle} to player\ngive @s minecraft:music_disc_13[minecraft:jukebox_playable={song:"new_music:${name}"},minecraft:custom_model_data=${i + 37000}]`;
            }
            zip.file(`data/new_music/function/${name}.mcfunction`, textContent);
        } else {
            console.log(`SONG ID : ${i} Removed`);
        }
    }
}

// Pack Description In-Game
async function fetchPackInfo(zip) {
    const packVersion = parseInt(document.getElementById('packVersion').value, 10);
    const packDescription = document.getElementById('packDescription').value;
    const jsonData = {
        pack: {
            pack_format: packVersion,
            supported_formats: [34, 45],
            description: packDescription.replace(/\\n/g, '\n')
        },
        overlays: {
            entries: [
                {
                    formats: { min_inclusive: 18, max_inclusive: 2147483647 },
                    directory: "overlay_18"
                }
            ]
        }
    };
    zip.file("pack.mcmeta", JSON.stringify(jsonData, null, 2));
}

// Remove file extension
function removeFileExtension(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
}

async function cleanName(dirtyName) {
    const dust = removeFileExtension(dirtyName);
    const stone = dust.replace(unwantedCharactersPattern, '_');
    return stone.toLowerCase();
}