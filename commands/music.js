const yt = require('ytdl-core');
const fs = require("fs");

const serverQueue = require("./../serverQueue.json")

let yt_info;
let vol;
exports.run = (client, message, command, URL) => {
  // Test Message
  message.channel.send(command).catch(console.error);
  message.channel.send("a" + message.guild.id).catch(console.error);
  message.channel.send("b" + serverQueue.hasOwnProperty(message.guild.id)).catch(console.error);
    
  if (URL !== null) {
    yt.getInfo(URL, (err, info) => {
      if (err) return message.channel.sendMessage('Invalid YouTube Link: ' + err);
      yt_info = info;
    });
  }
  // When this server is not in the queue, add it to the queue, and give it "playing" flag and "songs" array
  if (!serverQueue.hasOwnProperty(message.guild.id)) {
    message.channel.send("!hasOwnProperty").catch(console.error);
    message.channel.send(message.guild.id).catch(console.error);
    var server = {songs: [], playing: false, defaultVolume: 1};
    serverQueue[message.guild.id] = server;
    fs.writeFile("./serverQueue.json", JSON.stringify(serverQueue), (err) => console.error);
    message.channel.send("c" + serverQueue.hasOwnProperty(message.guild.id)).catch(console.error);
    message.channel.send(serverQueue.hasOwnProperty(message.guild.id)).catch(console.error);
    message.channel.send(serverQueue[message.guild.id].songs).catch(console.error);
    
    // play
  }

  // When this server is in the queue, but no song is queued
  else if (serverQueue[message.guild.id].songs.length == 0 && serverQueue[message.guild.id].playing == false) {
    message.channel.send("hasOwnProperty").catch(console.error);
    // Play
    if (command == 'play') {
      message.channel.send("playing == false").catch(console.error);
      serverQueue[message.guild.id].playing = true;
      add(message);
      join_play(serverQueue[message.guild.id].songs.shift(),message);
    } else {
      message.channel.send("No Song is Being Played, Queue a Song :D").catch(console.error);
    }
  }

  // When this server is in the queue, and there are songs queued
  else {
    message.channel.send("playing == true").catch(console.error);
    // Resume
    if (command == 'resume') {
      message.channel.send("resumed").catch(console.error);
      dispatcher.resume();
    }

    // Pause
    else if (command == 'pause') {
      message.channel.send("paused").catch(console.error);
      dispatcher.pause();
    }

    // Next
    else if (command == 'next') {
      message.channel.send("next").catch(console.error);
      dispatcher.end();
      // Stop playing and leave the channel if there is no song queued
      if (serverQueue[message.guild.id].songs.length == 0) {
        serverQueue[message.guild.id].playing = false;
        message.member.voiceChannel.leave();
      }
      // Only play next if there is another song queued
      else {
        join_play(serverQueue[message.guild.id].songs.shift(),message);
      }
      // TODO: Play the next song
    }

    // Volume
    else if (command == 'volume') {
      vol = message.content.slice(config.prefix.length).trim().split(/ +/g)[0];
      if (vol >= 0 && vol <= 100) {
        defaultVolume = vol / 100;
        message.channel.send(defaultVolume).catch(console.error);
      }
      else {
        message.channel.send("Please input a value between 0 - 100").catch(console.error);
      }
      // TODO: Volume takes a parameter between 1-100, applies to the current song only
      // dispatcher.setVolume: taking 1 to 100, divide by 100 for .volume (probably would not need higher volume than normal)
      // For dispatcher.volume: 0.5 is half, 1 is normal, 2 is double the normal stream volume
    }

    // Stop
    else if (command == 'stop') {
      message.channel.send("stopped").catch(console.error);
      dispatcher.end();
      // Clear the song queue
      serverQueue[message.guild.id].songs = [];
      // Stop playing
      serverQueue[message.guild.id].playing = false;
      // Leave the channel
      message.member.voiceChannel.leave();
    }

    // Play
    else if (command == 'play') {
      // TODO: Queue the song
      add(message);
    }
  }
}

// TODO: Find a way to push songs with unique ids
function add(message) {
  serverQueue[message.guild.id].songs.push({
    url: URL,
    title: yt_info.title,
    requester: message.author.username
  });;
}

function join_play(song,message) {
  message.member.voiceChannel.join()
  .then(function (connection) {
    dispatcher = message.guild.voiceConnection.playStream(yt(song.url, {
      audioonly: true
    }), {
      passes: 1
    });
  })
  .catch(console.error);
}