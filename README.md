# Train
ZY &amp; HZH &amp; Raining Discord Music Bot

## Installation (MacOS):
#### Nodejs
https://nodejs.org/en/
  
#### Go to DiscordApp directory and
```
npm init -y
npm i -S discord.js
npm i -S node-opus
npm i -S youtube-playlist
npm i -S ytdl-core
```
#### FFmpeg
https://ffmpeg.zeranoe.com/builds/
<br />Distributor - MacOS 64bit - Static
  
#### Go to Terminal and do
```
cd ~/Downloads/                         # Wherever your downloaded ffmpeg is
sudo cp ./ffmpeg /usr/local/bin
sudo chmod 644 /usr/local/bin/ffmpeg
open -e ~/.bash_profile
```
#### Add this line to bash_profile
```
export PATH="/usr/local/bin:$PATH"
```

## Run:
#### Go to DiscordApp directory and
```
node Train.js
```
