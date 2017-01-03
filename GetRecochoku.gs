//Slackに投稿
function postSlackMessage(rank,tuneName,artistName,YouTubeURL) {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');

  var slackApp = SlackApp.create(token); //SlackApp インスタンスの取得

  if(YouTubeURL == undefined){
    YouTubeURL = "";
  }

  var options = {
    channelId: "ChannelName", 　　　　　　　　　　　　　　　　　　　　//チャンネル名
    userName: "週間レコチョクランキング", 　　　　　　　　　　　　　　//投稿するbotの名前
    message: "```\n第"+rank+"位\n"+tuneName+"\n"+artistName+"\n```\n"+YouTubeURL, //投稿するメッセージ
    icon_emoji: ":musical_note:"
  };

  slackApp.postMessage(options.channelId, options.message, {username: options.userName, icon_emoji: options.icon_emoji});
}


//Webスクレイピング　http://www.kutil.org/2016/01/easy-data-scrapping-with-google-apps.html
function GetRecochoku() {
  var url = "https://recochoku.jp/ranking/single/weekly/";
  var fromText = '<div id="unit" style="padding-top:5px">';
  var toText = '</div>';

  var content = UrlFetchApp.fetch(url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();

  var match_str = scraped.toString();

  //tdの各要素を取り出し
  var divide_td = match_str.split("<td class=\"no\">");

  //divide_td.length
  for(var i=30 -1; i>0; i--){
    if(i == 0){
     continue;
    }
    var tunestart = 6 + divide_td[i].indexOf("\"ttl\">");
    var tuneend = divide_td[i].indexOf("</a>",tunestart);
    var tuneName = divide_td[i].slice(tunestart,tuneend);

    var artiststart = 6 + divide_td[i].indexOf("#000\">");
    var artistend = divide_td[i].indexOf("</a></p>",artiststart);
    var artistName = divide_td[i].slice(artiststart,artistend);

    tuneName = tuneName.replace(/&#039;/,"'");
    artistName = artistName.replace(/&#039;/,"'");

    if(i<=10){
      var YouTubeURL = searchYouTube(tuneName,artistName);
    }
    postSlackMessage(i,tuneName,artistName,YouTubeURL)
    //Logger.log(tuneName)
    //Logger.log(artistName)
  }
}


//YouTube検索
//API認証は別のアカウント
function searchYouTube(tuneName,artistName) {
  var keyword = tuneName+" "+artistName;
  var results = YouTube.Search.list("id,snippet",{q :keyword , maxResults: 1});

  //ビデオの要素ごとに分ける
  for(var i in results.items) {
    var item = results.items[i];
    var videoID = item.id.videoId;
    var videoURL = "https://www.youtube.com/watch?v="+videoID

    //IDとタイトルを表示
    //Logger.log("[%s] Title: %s", item.id.videoId, item.snippet.title);
  }
  return videoURL;
}
