# VoteMusic React Native

A React Native music player application built with Expo that allows users to suggest songs and vote on their favorites in real-time. Perfect for parties, gatherings, or collaborative playlist creation.

## Overview

VoteMusic is a social music voting app built with React Native, Expo, and react-native-track-player. The app enables users to create collaborative playlists where participants can vote on which songs should play next.

## Screenshots

Here are some screenshots showcasing the app's interface and features:

| Home Screen | Music Player | Voting Screen | Chat |
|-------------|--------------|---------------|------|
| ![Home Screen](/screenshots/home_screen.png) | ![Music Player](/screenshots/player.png) | ![Chat Access Screen](/screenshots/chat_access.png) | ![Chat](/screenshots/chat.png) | ![Login](/screenshots/login.png) | ![Setings](/screenshots/settings.png) |

*Note: To add actual screenshots, create a `/screenshots` directory in your project root and add your images there with the filenames shown above.*

## Features

- � Stream music with react-native-track-player
- �️ Vote on queued tracks to determine play order
- � Real-time updates for song changes and votes
- 👤 User authentication system
- � Chat Functionality
- 📱 Cross-platform (iOS & Android)

## Prerequisites

- Node.js 14+
- npm or yarn
- Expo CLI
- iOS/Android simulator or Expo Go app on physical device

## Installation

1. Clone the repository
```bash
git clone https://github.com/cannabhu/vote-music-react-native.git
cd vote-music-react-native
```

2. Install dependencies
```bash
yarn install
# or
npm install
```

3. Install Expo CLI (if not already installed)
```bash
npm install -g expo-cli
# or
yarn global add expo-cli
```

4. Set up environment variables (if required)
```bash
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_ACCESS_TOKEN=
SPOTIFY_REDIRECT_URI=exp://127.0.0.1:19000/
REACT_NATIVE_SUPABASE_URL=
REACT_NATIVE_SUPABASE_ANON_KEY=
PLATFORM=com.juke.app
```

5. Start the Expo development server
```bash
expo start
# or
npx expo start
```

6. Run on device/emulator
```bash
# Scan QR code with Expo Go app (Android) or Camera app (iOS)
# Or press 'i' for iOS simulator or 'a' for Android emulator
```

## Usage

1. Launch the app on your device
2. Browse available songs or add new ones to the queue
3. Vote on songs to influence the play order
4. Enjoy the collaborative music experience!

## Tech Stack

- **Framework**: React Native with Expo
- **Backend as a Service**: Supabase
- **Music Player**: react-native-track-player
- **State Management**: Redux/Context API
- **UI Components**: Native components and custom elements
- **Navigation**: React Navigation

## Troubleshooting

If you encounter issues with playback or event listeners, ensure that:
- Track player event listeners are properly registered and unregistered
- Callbacks are managed efficiently to prevent memory leaks





## Acknowledgments

- React Native Community
- react-native-track-player contributors
- All open-source libraries used in this project
- Supabase Docs
