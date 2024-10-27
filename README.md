# New App

## Overview

New App is designed to assist visually impaired users by providing detailed descriptions of images using artificial intelligence. Users can upload images, and the app will generate descriptive text to convey the visual content.

## User Journey

1. **Upload Image**
   - Users visit the app and are presented with the main interface.
   - They can upload an image from their device by clicking the "Choose Image" button.

2. **Describe Image**
   - After selecting an image, users click the "Describe Image" button.
   - The app uploads the image and uses AI to generate a textual description.
   - A loading indicator is displayed while the description is being generated.

3. **View Description**
   - The generated description is displayed prominently on the page.
   - Users can read the description to understand the content of the image.

4. **Text-to-Speech**
   - Users can click the "Listen to Description" button to hear the description read aloud.
   - The app uses text-to-speech to convert the description into audio.
   - An audio player is displayed, allowing users to play, pause, and adjust the volume.

## Additional Features

- **Responsive Design**
  - The app is designed to be accessible and user-friendly on all devices.
  - Buttons and inputs are styled for ease of use.

- **Accessibility**
  - The interface uses clear text and large buttons to assist visually impaired users.
  - Audio feedback is provided to enhance the user experience.

## External APIs Used

- **Microsoft Azure Computer Vision API**
  - The app uses this service to generate descriptions of uploaded images.
  - An API key and region are required and should be provided in the `.env` file.

- **Text-to-Speech API**
  - The app uses an external service to convert text descriptions into audio.
  - An API key is required and should be provided in the `.env` file.

## Environment Variables

The following environment variables need to be set in the `.env` file:

- `VITE_PUBLIC_APP_ID` - The public app ID for ZAPT.
- `AZURE_REGION` - The Azure region for the Computer Vision service (e.g., `eastus`).
- `AZURE_VISION_API_KEY` - API key for the Microsoft Azure Computer Vision service.
- `TEXT_TO_SPEECH_API_KEY` - API key for the text-to-speech service.