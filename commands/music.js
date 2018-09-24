exports.run = (client, message, args, dispatcher, URL) => {
    message.channel.send("music").catch(console.error);

    if(message == 'resume'){
      message.channel.send("resumed").catch(console.error);
      dispatcher.resume();
    }else if(message == 'pause'){
      message.channel.send("paused").catch(console.error);
      dispatcher.pause();
    }else if(message == 'next'){
      message.channel.send("next").catch(console.error);

    }else if(message == 'volume'){
      message.channel.send("volume").catch(console.error);
    }else if(message == 'stop'){
      message.channel.send("stopped").catch(console.error);
      dispatcher.end();
    }else if(message == 'play'){
      message.channel.send("music played").catch(console.error);
      message.member.voiceChannel.join()
			.then(function(connection){
				dispatcher = msg.guild.voiceConnection.playStream(yt(URL, { audioonly: true }), { passes : 1 });
				})
			.catch(console.error);
    }
}
