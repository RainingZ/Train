const yt = require('ytdl-core');
const fs = require("fs");

const config = require("./../config.json");
const serverQueue = require("./../serverQueue.json")
let title
let vol;

exports.run = (client, message, command, URL) => {
  if (URL !== "") {
    yt.getInfo(URL, function(err, info) {
      if (err) return message.channel.sendMessage('Invalid YouTube Link: ' + err);
      console.log(info.title);
      title = info.title;
    });
  }

  // When this server is not in the queue, add it to the queue, and give it "playing" flag and "songs" array
  if (!serverQueue.hasOwnProperty(message.guild.id)) {
    var server = {songs: [], playing: false, defaultVolume: 1};
    serverQueue[message.guild.id] = server;
    // play
    if (command == 'play') {
      console.log("no song play");
      serverQueue[message.guild.id].playing = true;
      add(URL, message);
      join_play(serverQueue[message.guild.id].songs.shift(),message);
    } 
    else {
      message.channel.send("No song is being played, queue a song :D").catch(console.error);
    }
  }

  // When this server is in the queue, but no song is queued
  else if (Object.keys(serverQueue[message.guild.id].songs).length == 0 && serverQueue[message.guild.id].playing == false) {
    // Play
    if (command == 'play') {
      console.log("no song play");
      serverQueue[message.guild.id].playing = true;
      add(URL, message);
      join_play(serverQueue[message.guild.id].songs.shift(),message);
    } 
    else {
      message.channel.send("No song is being played, queue a song :D").catch(console.error);
    }
  }

  // When this server is in the queue, and there are songs queued
  else {
    // Resume
    if (command == 'resume') {
      message.channel.send("Resumed").catch(console.error);
      dispatcher.resume();
    }

    // Pause
    else if (command == 'pause') {
      message.channel.send("Paused").catch(console.error);
      dispatcher.pause();
    }

    // Next
    else if (command == 'next') {
      message.channel.send("Next").catch(console.error);
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
    }

    // Volume
    else if (command == 'volume') {
      vol = message.content.slice(config.prefix.length).trim().split(/ +/g)[1];
      console.log(vol);
      if (vol >= 0 && vol <= 100) {
        serverQueue[message.guild.id].defaultVolume = vol / 100;
        dispatcher.setVolume(vol / 100);
        message.channel.send("Volume: " + vol + "%").catch(console.error);
      }
      else {
        message.channel.send("Please input a value between 0 - 100").catch(console.error);
      }
    }

    // Stop
    else if (command == 'stop') {
      message.channel.send("Stopped").catch(console.error);
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
      console.log("has song play");
      add(URL, message);
    }
  }
  fs.writeFile("./serverQueue.json", JSON.stringify(serverQueue), (err) => console.error);
}

function add(URL, message) {
  console.log("add");
  serverQueue[message.guild.id].songs.push({
    url: URL,
    title: title,
    requester: message.author.username
  });;
}

function join_play(song,message) {
  console.log("join_play");
  message.channel.send("Playing").catch(console.error);
  message.member.voiceChannel.join()
  .then(function (connection) {
    dispatcher = message.guild.voiceConnection.playStream(yt(song.url, {audioonly: true}), {passes: 1, volume: serverQueue[message.guild.id].defaultVolume});
  })
  .catch(console.error);
}