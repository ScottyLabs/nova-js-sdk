# Nova JS/TS SDK

The Nova JS SDK is a Javascript client library for use in the NOVA hackathon hosted by ScottyLabs. It allows users to create messages containing text, images, and audio and process them for various generative models that support output modalities like text, images, or audio.

## Basic Usage

```javascript
// Import the Nova SDK
import { NovaClient, Message, TextToSpeech } from 'nova-js-sdk';

// Initialize the Nova SDK with your team ID and server URL
const nova = new NovaClient('your-team-id', '[SERVER_URL]');

// Create a message with text and an image
const message = new Message(
    'Describe this image', 
    'path/to/image.jpg'
);

// Process the message to get text output
let response = nova.processMessage(message, "text");
console.log(response);

// Use text to speech
const tts = new TextToSpeech('hume');
let audio_content = tts.synthesize("Hello, this is a test.");
fs.writeFileSync('output_audio.wav', audio_content);
```