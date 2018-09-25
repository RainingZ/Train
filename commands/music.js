const yt = require('ytdl-core');
let yt_info;
let vol;
exports.run = (client, message, command, URL, serverQueue) => {
  // Test Message
  message.channel.send(command).catch(console.error);

  if (URL !== null) {
    yt.getInfo(URL, (err, info) => {
      if (err) return message.channel.sendMessage('Invalid YouTube Link: ' + err);
      yt_info = info;
    });
  }
  // When this server is not in the queue, add it to the queue, and give it "playing" flag and "songs" array
  if (!serverQueue.hasOwnProperty(message.guild.id)) {
    serverQueue[message.guild.id] = {}, serverQueue[message.guild.id].playing = false, serverQueue[message.guild.id].songs = [];
  }

  // When this server is in the queue, but no song is queued
  else if (serverQueue[message.guild.id].songs.length == 0 && serverQueue[message.guild.id].playing == false) {
    // Play
    if (command == 'play') {
      serverQueue[message.guild.id].playing = true;
      add();
      join_play(serverQueue[message.guild.id].songs.shift());
    } else {
      message.channel.send("No Song is Being Played, Queue a Song :D").catch(console.error);
    }
  }

  // When this server is in the queue, and there are songs queued
  else {
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
        join_play(serverQueue[message.guild.id].songs.shift());
      }
      // TODO: Play the next song
    }

    // Volume
    else if (command == 'volume') {
      vol = message.content.slice(config.prefix.length).trim().split(/ +/g)[0];
      if (vol >= 0 && vol <= 100) {
        defaultVolume = vol / 100;
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
      add();
    }
  }
}

function add() {
  serverQueue[message.guild.id].songs.push({
    url: URL,
    title: yt_info.title,
    requester: message.author.username
  });;
}

function join_play(song) {
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