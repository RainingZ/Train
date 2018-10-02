var search = require('youtube-search');
const config = require("./../config.json");
var opts = {
  maxResults: 10,
  key: config.yt_api_key
};
 
search('music', opts, function(err, results) {
    if(err) return console.log(err);
    for (var i = 0; i < results.length; i++){
        console.dir((i+1) + ". " + results[i].title);
    }
});