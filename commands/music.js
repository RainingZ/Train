const yt = require('ytdl-core');
const ytlist = require('youtube-playlist');
const ytsearch = require('youtube-search');
const fs = require("fs");

const config = require("./../config.json");
const serverQueue = require("./../serverQueue.json");

var titleList;
var urlList;
var vol;

exports.run = (client, message, command, URL) => {

  // When this server is not in the queue, add it to the queue, and give it "playing" flag and "songs" array
  if (!serverQueue.hasOwnProperty(message.guild.id)) {
    var server = {
      songs: [],
      playing: false,
      defaultVolume: 1
    };
    serverQueue[message.guild.id] = server;
    // play
    if (command == 'play') {
      console.log("no song play");
      serverQueue[message.guild.id].playing = true;
      add(URL, message, true);
    } else {
      message.channel.send("No song is being played, queue a song :D").catch(console.error);
    }
  }

  // When this server is in the queue, but no song is queued
  else if (Object.keys(serverQueue[message.guild.id].songs).length == 0 && serverQueue[message.guild.id].playing == false) {
    // Play
    if (command == 'play') {
      console.log("no song play");
      serverQueue[message.guild.id].playing = true;
      add(URL, message, true);
    } else {
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
    }

    // Volume
    else if (command == 'volume') {
      // Get the arguments
      vol = message.content.slice(config.prefix.length).trim().split(/ +/g)[1];
      console.log(vol);
      if (vol >= 0 && vol <= 100) {
        // User inputs are between 0 - 100, but API requires 0 - 1
        serverQueue[message.guild.id].defaultVolume = vol / 100;
        dispatcher.setVolume(vol / 100);
        message.channel.send("Volume: " + vol + "%").catch(console.error);
      } else {
        message.channel.send("Please input a value between 0 - 100").catch(console.error);
      }
    }

    // Stop
    else if (command == 'stop') {
      message.channel.send("Stopped").catch(console.error);
      // Clear the song queue
      serverQueue[message.guild.id].songs = [];
      // Stop playing
      serverQueue[message.guild.id].playing = false;
      // Leave the channel
      dispatcher.end();
    }

    // Play
    else if (command == 'play') {
      console.log("has song play");
      add(URL, message, false);
    }
  }
  fs.writeFile("./serverQueue.json", JSON.stringify(serverQueue), (err) => console.error);
}

function add(URL, message, play) {
  console.log("add");
  // ***ASYNC IS BS***

  // If the URL is a youtube video link, urlList will only have this URL
  urlList = [URL];

  // URL cannot be empty
  if (URL !== "") {
    // Check if the URL is a youtube playlist link, if it is, get all URLs and titles
    try {
      ytlist(URL, 'url').then(res => {
        console.log(res.data.playlist);
        urlList = res.data.playlist;
        ytlist(URL, 'name').then(res => {
          console.log(res.data.playlist);
          titleList = res.data.playlist;
          for (var i = 0; i < urlList.length; i++) {
            serverQueue[message.guild.id].songs.push({
              url: urlList[i],
              title: titleList[i],
              requester: message.author.username
            });
          }
          if (play == true) {
            join_play(serverQueue[message.guild.id].songs.shift(), message);
          }
          // writeFile here for async
          fs.writeFile("./serverQueue.json", JSON.stringify(serverQueue), (err) => console.error);
        })
      })
      // Otherwise, check if the URL is a youtube video link, if the callback gives an error, return
    } catch (err) {
      console.log("not a playlist");
      yt.getInfo(URL, function (err, info) {
        if (err) return message.channel.sendMessage('Invalid YouTube Link: ' + err);
        console.log(info.title);
        titleList = [info.title];
        serverQueue[message.guild.id].songs.push({
          url: urlList[0],
          title: titleList[0],
          requester: message.author.username
        });
        if (play == true) {
          join_play(serverQueue[message.guild.id].songs.shift(), message);
        }
        // writeFile here for async
        fs.writeFile("./serverQueue.json", JSON.stringify(serverQueue), (err) => console.error);
      });
    }
  }
}

// This function only runs when add() gets play == true
// Join message owner's channel and play the song
function join_play(song, message) {
  console.log("join_play");
  message.channel.send("Playing: " + song.title).catch(console.error);
  message.member.voiceChannel.join()
    .then(function (connection) {
      dispatcher = message.guild.voiceConnection.playStream(yt(song.url, {
        audioonly: true
      }), {
        passes: 1,
        volume: serverQueue[message.guild.id].defaultVolume
      });

      // Listener for dispatcher "end"
      dispatcher.on('end', () => {
        // Stop playing and leave the channel if there is no song queued
        if (serverQueue[message.guild.id].songs.length == 0) {
          serverQueue[message.guild.id].playing = false;
          // This allows user to stop the bot from a diff channel
          message.guild.voiceConnection.disconnect();
          // message.member.voiceChannel.leave();
        }
        // Only play next if there is another song queued
        else {
          join_play(serverQueue[message.guild.id].songs.shift(), message);
        }
        fs.writeFile("./serverQueue.json", JSON.stringify(serverQueue), (err) => console.error);
      });

      // Listener for dispatcher "error"
      dispatcher.on('error', (err) => {
        return message.channel.sendMessage('error: ' + err).then(() => {
          if (serverQueue[message.guild.id].songs.length == 0) {
            serverQueue[message.guild.id].playing = false;
            message.guild.voiceConnection.disconnect();
            // message.member.voiceChannel.leave();
          }
          // Only play next if there is another song queued
          else {
            join_play(serverQueue[message.guild.id].songs.shift(), message);
          }
          fs.writeFile("./serverQueue.json", JSON.stringify(serverQueue), (err) => console.error);
        });
      });

    })
    .catch(console.error);
}