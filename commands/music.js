const yt = require('ytdl-core');

exports.run = (client, message, command, URL) => {
  // Test Message
  message.channel.send(command).catch(console.error);

  // When the music is playing
  if (playing) {
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
      // TODO: Play the next song 
    }

    // Volume
    else if (command == 'volume') {
      message.channel.send("volume").catch(console.error);
      // TODO: Volume takes a parameter between 1-100, applies to the current song only
      // dispatcher.setVolume: taking 1 to 100, divide by 100 for .volume (probably would not need higher volume than normal)
      // For dispatcher.volume: 0.5 is half, 1 is normal, 2 is double the normal stream volume
    }

    // Stop
    else if (command == 'stop') {
      message.channel.send("stopped").catch(console.error);
      dispatcher.end();
      message.member.voiceChannel.leave();
    }

    // Play
    else if (command == 'play') {
      // TODO: Queue the song
    }
  }

  // When the music is NOT playing
  else {
    // Play
    if (command == 'play') {
      playing = true;
      message.channel.send("music played").catch(console.error);
      message.member.voiceChannel.join()
        .then(function (connection) {
          dispatcher = message.guild.voiceConnection.playStream(yt(URL, {
            audioonly: true
          }), {
            passes: 1
          });
        })
        .catch(console.error);
      dispatcher.setVolume(defaultVolume);
    }
    else {
      message.channel.send("No Song is Being Played, Queue a Song :D").catch(console.error);
    }
  }
}