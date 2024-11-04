/** This is the main class for interacting with the Nova API.
 * You should only ever instantiate one and reuse it throughout your app.
 * Multiple attempts to instantiate this will give the same object (it is a singleton). */
class NovaClient {
    static #_instance = null;

    #teamId = "";
    #serverURL = "";
    #apiKeys = {};

    /** @returns {string} - The server URL used by this client. */
    get serverURL() {
        return this.#serverURL;
    }

    /** @param {string} teamId - The team ID you want to interact with.
     * @param {string} serverURL - The server to work with.
     * @returns {NovaClient} - The singleton instance of this class.
     * If already instantiated, returns the same instance, discarding any new configurations.
     */
    constructor(teamId= "", serverURL = "") {
        if (!this.#_instance) {
            this.#_instance = this;
            this.#teamId = teamId;
            this.#serverURL = serverURL;
            this.#loadAPIKeysFromServer();
        }
        return this.#_instance;
    }

    #loadAPIKeysFromServer() {
        const url = this.#serverURL + "/keys";
        const params = {'teamId': this.#teamId};
        try {
            let response = fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });
            if (!response.ok) {
                throw new Error("Failed to fetch API keys: " + response.statusText);
            }

            this.#apiKeys = response.json();
        } catch (error) {
            console.error("Error fetching API keys: " + error);
            throw error;
        }
    }

    /**
     * @readonly
     * @enum {string}
     */
    Modality = {
        TEXT: "text",
        IMAGE: "image",
        AUDIO: "audio",
    }

    /**
     * @param {Message} message
     * @param {Modality} outputModality
     */
    processMessage(message, outputModality) {
        const url = this.#serverURL + "/process_message";
        let data = {
            'text': message.text,
            'modality': outputModality,
        }
        let files = [];

        if (message.hasImages()) {
            for (let image_path of message.images) {
                files.push({'image': fetch(image_path)});
            }
        }
        if (message.hasAudio()) {
            for (let audio_path of message.audio) {
                files.push({'audio': fetch(audio_path)});
            }
        }

        data.files = files;

        let response = fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Failed to process message: " + response.statusText);
        }
        if (outputModality === this.Modality.TEXT) {
            return response.text();
        } else {
            return response.blob();
        }
    }
}

/**
 * Represents a message containing text, images, and audio.
 */
class Message {
    text = "";
    /** An array of URLs pointing to images.
     * @type {string[]} */
    images = [];
    /** An array of URLs pointing to audio files.
     * @type {string[]} */
    audio = [];

    /**
     * Constructs a new Message object.
     * @param {string} text The text to include in the message
     * @param {string[]} images The URLs of images to include in the message
     * @param {string[]} audio The URLs of audio files to include in the message
     */
    constructor(text = "", images = [], audio = []) {
        this.text = text;
        this.images = images;
        this.audio = audio;
    }

    hasText() {
        return this.text.length > 0;
    }

    hasImages() {
        return this.images.length > 0;
    }

    hasAudio() {
        return this.audio.length > 0;
    }
}

/**
 * The TextToSpeech class provides text-to-speech functionality.
 */
class TextToSpeech {
    /**
     * @readonly
     * @enum {string}
     */
    Provider = {
        CARTESIA: "cartesia",
        HUME: "hume",
    }

    /** @type {Provider} */
    provider = this.Provider.CARTESIA;

    /**
     * Constructs a new TextToSpeech synthesizer, using the given TTS provider.
     * @param {Provider} provider
     */
    constructor(provider = this.Provider.CARTESIA) {
        this.provider = provider;
    }

    /**
     * Synthesizes the given text into audio.
     * @param {string} text
     */
    synthesize(text) {
        const url = (new NovaClient()).serverURL + "/synthesize";
        let data = {
            'text': text,
            'provider': this.provider,
        }

        let response = fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Failed to synthesize text: " + response.statusText);
        }
        return response.blob();
    }
}