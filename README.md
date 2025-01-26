# YAT: YET ANOTHER TUNER

## Update: 
At the end, I couldn't find a relaible way to turn the PWA into a standalone Android app. Lack of documentation, need for an online server, 
and require of microphone access made me rethink my approach. I will rewrite the whole project in native in the future.

## Disclaimer: 
This is a personal project with the intend to learn how to build a Progressive Web App (PWA) and distribute it among different platforms.
It is not made as an end-user product, and it may contain bugs. Pitch detection is not very reliable as well. I will try to implement a 
better algorithm in the future. Use at your own risk.

## What is this application for?
This is a bare-bones tuner app written with the intend of being cross-platform. Because of the relative simplicity of this project, and 
generality of the web systems, I decided to build a PWA. I also considered using React Native, but unfortunately, it caused more headache than help. 
As an amateur musician, I always regretted not having a great but also open-source tuner app. I decided to build this app:
1. To learn how to design a UI
2. To find out some methods for better pitch detection

In this project, node package [pitchy](https://www.npmjs.com/package/pitchy) has used for pitch detection, and [PWABuilder](https://www.pwabuilder.com/)
has used for building the project. [Favicon Generator](https://favicon.io/favicon-generator/) also used to generate simple icons and favicons.

## How to run?
Just head to the project [GitHub Pages](https://degd.github.io/yet-another-tuner-web/). Because of the microphone access, I failed to turn this project
into a standalone Android app.
