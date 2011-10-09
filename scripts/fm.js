 /*
 * QMFL
 * Copyright(c) 2011, Music WebDev Group.
 */


var debugMode = false;
MUSIC.module.webPlayer = {};
MUSIC.module.webPlayer.playStatus = {S_UNDEFINE: 0,S_STOP: 1,S_PAUSE: 2,S_PLAYING: 3,S_BUFFERING: 4,S_PLAYBEGIN: 5,S_PLAYEND: 6};
MUSIC.module.webPlayer.interFace = (function() {
    var VQQPlayer = null;
    var MediaPlayer = null;
    var VH5Player = null;
    var webPlayer = null;
    var playerList = null;
    var mFromTag = 29;
    var musicInitReady = false;
    var songDuration = 0;
    var curPostion = 0;
    var mIsLoop = false;
    var wmaurl_tpl = 'http://stream%(stream).qqmusic.qq.com/%(sid).mp3';
    var mp3url_tpl = 'http://stream%(stream).qqmusic.qq.com/%(sid).mp3';
    var tpturl_tpl = 'http://tpt.music.qq.com/%(sid).tpt';
    var songInfoObj = {mstream: 0,murl: '',msong: '',msinger: '',mQzoneKey: '',mid: 0,mSongType: 0};
    function setFromtag(fromtag) {
        mFromTag = fromtag;
    }
    function setCurPostion(cp, duration) {
        curPostion = cp;
        songDuration = duration;
    }
    function setSongInfoObj(obj) {
        MUSIC.object.extend(songInfoObj, obj || {});
    }
    function getSongInfoObj() {
        return songInfoObj;
    }
    function loadWmPlayer(callback) {
        var jsloader = new MUSIC.JsLoader();
        jsloader.onload = function() {
            try 
            {
                MediaPlayer = g_player.wmPlayer(mFromTag);
                MediaPlayer.createActiveX();
                MediaPlayer.initialize();
            } 
            catch (e) 
            {
                alert('您没有安装WindowsMediaPlayer插件或该插件被禁用！');
                return false;
            }
            musicInitReady = true;
            webPlayer = MediaPlayer;
            if (callback) {
                callback();
            }
        };
        jsloader.onerror = function() {
            alert('加载wmp失败！');
        };
        jsloader.load("http://imgcache.qq.com/music/portal_v3/js/wmp.js", null, "utf-8");
    }
    function initMusic(callback) {
		alert('initMusic');
		alert('ready?' + musicInitReady);
        if (!musicInitReady) {
            if (!!ua.ie) {
                try 
                {
                    var oPlayerCtrl = new ActiveXObject("QzonePlayer.PlayerCtrl");
                    try 
                    {
                        VQQPlayer = g_player.qqPlayer(mFromTag);
                        VQQPlayer.setPlayerVersion(oPlayerCtrl.GetPlayerSvrVersion());
                        oPlayerCtrl.Uninitialize();
                        VQQPlayer.createActiveX();
                        VQQPlayer.initialize();
                    } 
                    catch (e) 
                    {
                        alert("exception:" + e.message);
                    }
                    musicInitReady = true;
                    webPlayer = VQQPlayer;
                    EventUtil(window, "unload", VQQPlayer.unInitialize);
                    if (callback) {
                        callback();
                    }
                } 
                catch (e) 
                {
                    loadWmPlayer(callback);
                }
            } else if (!!ua.firefox) {
                if (/win/.test(navigator.platform.toLowerCase())) {
                    try 
                    {
                        VQQPlayer = g_player.qqPlayer(mFromTag);
                        VQQPlayer.createActiveX();
                        VQQPlayer.initialize();
                    } 
                    catch (e) 
                    {
                        loadWmPlayer(callback);
                        return false;
                    }
                    musicInitReady = true;
                    webPlayer = VQQPlayer;
                    EventUtil(window, "unload", VQQPlayer.unInitialize);
                    if (callback) {
                        callback();
                    }
                } else {
                    alert('该功能目前不支持您的浏览器，请使用chrome，safari进行播放');
                }
            } else if ((!!ua && ua.tt >= 5 && ua.chrome >= 1) || !!ua.opera) {
                loadWmPlayer(callback);
            } else if (!!ua.safari || !!ua.chrome || !!ua.isiPad || !!ua.isiPhone) {
                var jsloader = new MUSIC.JsLoader();
                jsloader.onload = function() {
                    try 
                    {
                        VH5Player = g_player.h5Audio(mFromTag);
                        VH5Player.createActiveX();
                        VH5Player.initialize();
                    } 
                    catch (e) 
                    {
                        alert("exception:" + e.message);
                    }
                    musicInitReady = true;
                    webPlayer = VH5Player;
                    if (callback) {
                        callback();
                    }
                };
                jsloader.onerror = function() {
                    alert('加载html5 audio失败！');
                };
                //jsloader.load("http://imgcache.qq.com/music/portal_v3/js/h5audio.js", null, "utf-8");
				jsloader.onload();
            } else {
                alert('该功能目前不支持您的浏览器，请使用chrome，safari，firefox或者IE进行播放');
            }
        } 
        else {
			alert('callback');
			alert(callback);
            if (callback) {
                callback();
            }
        }
    }
    function OnSongPlayBegin(songinfo, index, total) {
    }
    function OnSongPlayEnd(songinfo, index, total) {
    }
    function OnSongPlaying(lCurPos, lTotal) {
    }
    function OnPlayPause() {
    }
    function OnPlayStop() {
    }
    function OnPlaying() {
    }
    function startPlayer() {
        !!webPlayer && webPlayer.startPlayer();
    }
    function pausePlayer() {
        !!webPlayer && webPlayer.pausePlayer();
    }
    function stopPlayer() {
        !!webPlayer && webPlayer.stopPlayer();
    }
    function lastPlayer() {
        if (!playerList) {
            return;
        }
        playerList.lastPostion();
        playList();
    }
    function nextPlayer() {
		alert('nextPlayer');
        if (!playerList) {
            return false;
        }
        if (getSongInfoObj().mid != 0) {
			alert('nextPlyaer mid != 0');
            g_webPlayer.OnSongPlayEnd(getSongInfoObj(), playerList.getPostion(), playerList.getCount());
            if (!mIsLoop && playerList.isLastPlayer()) {
				alert('nextPlayer isLastPlayer');
                stopPlayer();
				function begin() {
					alert('nextPlayer begin new');
                    if(g_fmChn) {
                        g_fmChn.playFm(g_fmChn._curFmInfo);
                    }
                }
                setTimeout(begin, 100);
                return true;
            }
        }
        playerList.nextPostion();
        playList();
		alert('nextPlayer end');
        return true;
    }
    function mutePlayer() {
        !!webPlayer && webPlayer.setMute();
    }
    function getVolumn() {
        if (!webPlayer) {
            return 0;
        }
        return webPlayer.getVolumn();
    }
    function setVolumn(vol) {
        !!webPlayer && webPlayer.setVolumn(vol);
    }
    function setPlayerState(status) {
		alert('setPlayerState')
		alert(status);
		alert(typeof status);
        !!webPlayer && webPlayer.setPlayerState(status);
    }
    function playSong(obj) {
		alert('playSong');
		alert(arguments);
        if (typeof obj != "object") {
            alert("歌曲参数为对象！");
            return;
        }
        if (!obj.mstream || !obj.mid) {
            alert('歌曲信息错误！');
            return;
        }
        setSongInfoObj(obj);
        initMusic(function() {
            webPlayer.setPlayURL();
        });
    }
    function setPlayerList(isPlay, arr, isLoop) {
        !!playerList || (playerList = g_playerList());
        playerList.setPlayerList(arr);
        if (isLoop) {
            mIsLoop = isLoop;
        }
        if (isPlay) {
            nextPlayer();
        }
    }
    function playList() {
		alert('playList');
        !!playerList || (playerList = g_playerList());
        setSongInfoObj(playerList.getSongInfoObj());
        playBegin();
        if (!(!!ua.isiPad || !!ua.isiPhone)) {
            setTimeout(function() {
                initMusic(function() {
					alert('initMusic callback');
                    webPlayer.setPlayURL();
                });
            }, 0);
        } else {
            initMusic(function() {
				alert('initMusic callback 2');
                webPlayer.setPlayURL();
            });
        }
    }
    function playBegin() {
		alert('playBegin');
        if (!playerList) {
            return;
        }
        g_webPlayer.OnSongPlayBegin(getSongInfoObj(), playerList.getPostion(), playerList.getCount());
    }
    function getPlayerSource() {
        if (!!VQQPlayer) {
            return VQQPlayer.getPlayerSource();
        }
    }
    function getCurrentPlayerSource() {
        if (!!VQQPlayer) {
            return VQQPlayer.getCurrentPlayerSource();
        }
    }
    function setCurrentPlayerSource(args) {
        !!VQQPlayer && VQQPlayer.setCurrentPlayerSource(args);
    }
    return {wmaurl_tpl: wmaurl_tpl,mp3url_tpl: mp3url_tpl,tpturl_tpl: tpturl_tpl,setSongInfoObj: setSongInfoObj,getSongInfoObj: getSongInfoObj,initMusic: initMusic,startPlayer: startPlayer,pausePlayer: pausePlayer,stopPlayer: stopPlayer,lastPlayer: lastPlayer,nextPlayer: nextPlayer,mutePlayer: mutePlayer,getVolumn: getVolumn,setVolumn: setVolumn,playSong: playSong,setPlayerState: setPlayerState,setCurPostion: setCurPostion,setPlayerList: setPlayerList,playList: playList,setFromtag: setFromtag,OnSongPlayBegin: OnSongPlayBegin,OnSongPlayEnd: OnSongPlayEnd,OnSongPlaying: OnSongPlaying,OnPlayPause: OnPlayPause,OnPlayStop: OnPlayStop,playBegin: playBegin,OnPlaying: OnPlaying,getPlayerSource: getPlayerSource,getCurrentPlayerSource: getCurrentPlayerSource,setCurrentPlayerSource: setCurrentPlayerSource}
})();
MUSIC.module.webPlayer.playerList = function() {
    var mPostion = -1;
    var mpList = [];
    function getCount() {
        return mpList.length;
    }
    function lastPostion() {
        mPostion = (mPostion - 1 + mpList.length) % mpList.length;
        return mPostion;
    }
    function nextPostion() {
		alert('nextPostion');
        mPostion = (mPostion + 1) % mpList.length;
        return mPostion;
    }
    function getPostion() {
        return mPostion;
    }
    function isLastPlayer() {
        return (mPostion + 1) == mpList.length;
    }
    function getSongInfoObj() {
        return mpList[mPostion];
    }
    function setPlayerList(arr) {
        if (typeof arr != "object") {
            return false;
        }
        clearPlayerList();
        for (var i = 0, len = arr.length; i < len; i++) {
            if (typeof arr[i] == "object") {
                if (arr[i].mstream && arr[i].mid) {
                    mpList.push(arr[i]);
                }
            }
        }
        mPostion = -1;
    }
    function clearPlayerList() {
        for (var i = 0, len = mpList.length; i < len; i++) {
            delete mpList[i];
        }
        mpList.length = 0;
    }
    return {getCount: getCount,isLastPlayer: isLastPlayer,lastPostion: lastPostion,nextPostion: nextPostion,getPostion: getPostion,getSongInfoObj: getSongInfoObj,setPlayerList: setPlayerList,clearPlayerList: clearPlayerList};
};
MUSIC.module.webPlayer.qqPlayer = function(fromTag) {
    var $T = top, $ = MUSIC, $D = $.dom, $E = $.event;
    var mQQPlayerConfig = {REP_PLAYURL_IP_ARRAY: ["121.14.73.62", "121.14.73.48", "58.60.9.178", "58.61.165.54"],REP_PLAYURL_PORT: 17785,P2P_UDP_SVR_IP_ARRAY: ["119.147.65.30", "58.61.166.180", "pdlmusic.p2p.qq.com"],P2P_UDP_SVR_PORT: 8000,P2P_TCP_SVR_IP_ARRAY: ["119.147.65.30", "58.61.166.180", "pdlmusic.p2p.qq.com"],P2P_TCP_SVR_PORT: 433,P2P_STUN_SVR_IP: "stun-a1.qq.com",P2P_STUN_SVR_PORT: 8000,P2P_TORRENT_URL: "http://219.134.128.55/",P2P_CACHE_SPACE: 100,STAT_REPORT_SVR_IP: "219.134.128.41",STAT_REPORT_SVR_PORT: 17653,REP_PLAYSONG_IP_ARRAY: ["58.60.11.85", "121.14.96.113", "58.61.165.50", "121.14.78.75"],REP_PLAYSONG_PORT: 8000,REP_SONGLIST_IP_ARRAY: ["121.14.94.181", "121.14.94.183"],REP_SONGLIST_PORT: 8000};
    var mPlayerSource = "";
    var mCurPlaySrc = "";
    var mPlayerState = g_playerStatus.S_UNDEFINE;
    var mPlayerName = "";
    var mUinCookie = 12345678;
    var mKeyCookie = "12345678";
    var mFromTag = fromTag;
    var mIsInit = false;
    var plv = "0";
    var playerSrcSeted = false;
    var lastBufTime = 0;
    function setPlayList() 
    {
    }
    ;
    function resetCache() 
    {
    }
    ;
    function setPlayParams(iMusicId, sul) {
        mPlayerName.SetCookie("qqmusic_uin", mUinCookie);
        mPlayerName.SetCookie("qqmusic_key", mKeyCookie);
        mPlayerName.SetCookie("qqmusic_fromtag", mFromTag);
        var tiMusicId = "" + iMusicId;
        mPlayerName.SetCookie("qqmusic_musicid", tiMusicId);
        mPlayerName.SetCookie("qqmusicchkkey_key", mKeyCookie);
        mPlayerName.SetCookie("qqmusicchkkey_url", sul);
    }
    function setPlayerVersion(version) {
        plv = version;
    }
    function getPlayerSource() {
        return mPlayerSource;
    }
    function getCurrentPlayerSource() {
        return mCurPlaySrc;
    }
    function setCurrentPlayerSource(args) {
        mCurPlaySrc = args;
    }
    function insertQQPlayer(args) {
        var isIE = window.ActiveXObject ? true : false;
        if (isIE) {
            var params = {};
            var objAttrs = {};
            for (var k in args) 
            {
                switch (k) 
                {
                    case "classid":
                    case "style":
                    case "name":
                    case "height":
                    case "width":
                    case "id":
                        objAttrs[k] = args[k];
                        break;
                    default:
                        params[k] = args[k];
                }
            }
            var str = [];
            str.push('<object ');
            for (var i in objAttrs) {
                str.push(i);
                str.push('="');
                str.push(objAttrs[i]);
                str.push('" ');
            }
            str.push('>');
            for (var i in params) {
                str.push('<param name="');
                str.push(i);
                str.push('" value="');
                str.push(params[i]);
                str.push('" /> ');
            }
            str.push('</object>');
            var playerDiv = $D.createElementIn("div", "musicproxy");
            playerDiv.innerHTML = str.join("");
            return playerDiv.firstChild;
        } else {
            var playerDiv = $D.createElementIn("div", "musicproxy");
            playerDiv.style.cssText = "height:0px;overflow:hidden";
            playerDiv.innerHTML = '<embed id="QzoneMusic" type="application/tecent-qzonemusic-plugin" width="0px" height="0px" />';
            var QzonePlayer = document.getElementById('QzoneMusic');
            var qmpVer = "";
            try 
            {
                qmpVer = QzonePlayer.GetVersion(4);
            } 
            catch (e) 
            {
                throw new Error("NeedUpdateQzoneMusic");
                return false;
            }
            if (!(qmpVer >= "7.69")) 
            {
                throw new Error("NeedUpdateQzoneMusic");
                return false;
            }
            QzonePlayer.CreateAX("QzoneMusic.dll");
            for (var k in args) 
            {
                switch (k) 
                {
                    case "classid":
                    case "style":
                    case "name":
                    case "height":
                    case "width":
                    case "id":
                    case "UsedWhirl":
                        continue;
                        break;
                    default:
                        QzonePlayer.setAttribute(k, args[k]);
                }
            }
            try {
                QzonePlayer.UsedWhirl = "0";
            } 
            catch (e) {
            }
            if (QzonePlayer.GetVersion(5) >= "3.2") {
                QzonePlayer.setAttribute("P2PUDPServ_IP", "pdlmusic.p2p.qq.com");
                QzonePlayer.setAttribute("P2PTCPServ_IP", "pdlmusic.p2p.qq.com");
            }
            return QzonePlayer;
        }
    }
    function createPlayer() {
        var ttii = (parseInt(Math.random() * 1000)) % mQQPlayerConfig.REP_PLAYSONG_IP_ARRAY.length;
        var ttii2 = (parseInt(Math.random() * 1000)) % mQQPlayerConfig.REP_SONGLIST_IP_ARRAY.length;
        var ttii3 = (parseInt(Math.random() * 1000)) % mQQPlayerConfig.REP_PLAYURL_IP_ARRAY.length;
        var ttii4 = (new Date()).getTime() % 2;
        if (plv >= "3.2") {
            ttii4 = 2;
        }
        return insertQQPlayer({classid: 'CLSID:E05BC2A3-9A46-4A32-80C9-023A473F5B23',id: 'QzonePlayer',height: 0,width: 0,PlayerType: 2,CacheSize: mQQPlayerConfig.P2P_CACHE_SPACE,ValidDomain: 'qq.com',EnableSyncListen: 1,UploadStatCount: 10,ExitDelayTime: 5,UsedWhirl: 0,RestrictHttpStartInterval: 1,RestrictHttpStopInterval: 100,P2PUDPServ_IP: mQQPlayerConfig.P2P_UDP_SVR_IP_ARRAY[ttii4],P2PUDPServ_Port: mQQPlayerConfig.P2P_UDP_SVR_PORT,P2PTCPServ_IP: mQQPlayerConfig.P2P_TCP_SVR_IP_ARRAY[ttii4],P2PTCPServ_Port: mQQPlayerConfig.P2P_TCP_SVR_PORT,P2PStunServ_IP: mQQPlayerConfig.P2P_STUN_SVR_IP,P2PStunServ_Port: mQQPlayerConfig.P2P_STUN_SVR_PORT,RepPlaySong_IP: mQQPlayerConfig.REP_PLAYSONG_IP_ARRAY[ttii],RepPlaySong_Port: mQQPlayerConfig.REP_PLAYSONG_PORT,RepSongList_IP: mQQPlayerConfig.REP_SONGLIST_IP_ARRAY[ttii2],RepSongList_Port: mQQPlayerConfig.REP_SONGLIST_PORT,RepPlayURL_IP: mQQPlayerConfig.REP_PLAYURL_IP_ARRAY[ttii3],RepPlayURL_Port: mQQPlayerConfig.REP_PLAYURL_PORT});
    }
    function createActiveX() {
        try 
        {
            mPlayerName = createPlayer();
            if (!mPlayerName) {
                return false;
            }
            mPlayerSource = "web_player_" + new Date().getTime();
            mCurPlaySrc = mPlayerSource;
        } 
        catch (e) 
        {
            if (debugMode) 
            {
                alert("e 7 " + e.message);
            }
            throw new Error("NeedUpdateQzoneMusic");
            return false;
        }
        return true;
    }
    function initialize() {
        try 
        {
            if (!mPlayerName) {
                return false;
            }
            EventPlayer(mPlayerName, "OnInitialized", g_playerCallback.OnInitialized);
            EventPlayer(mPlayerName, "OnUninitialized", g_playerCallback.OnUnitialized);
            EventPlayer(mPlayerName, "OnStateChanged", g_playerCallback.OnStateChanged);
            EventPlayer(mPlayerName, "OnPlayProgress", g_playerCallback.OnPlayProgress);
            EventPlayer(mPlayerName, "OnPlayError", g_playerCallback.OnPlayError);
            EventPlayer(mPlayerName, "OnPlaySrcChanged", g_playerCallback.OnPlaySrcChanged);
            mPlayerName.Initialize();
            mPlayerName.Volume = 75;
        } 
        catch (e) 
        {
            if (debugMode) 
            {
                alert("e 8 " + e.message);
            }
            return false;
        }
        mIsInit = true;
        return true;
    }
    function unInitialize() {
        try 
        {
            EventPlayerRemove(mPlayerName, "OnInitialized", g_playerCallback.OnInitialized);
            EventPlayerRemove(mPlayerName, "OnUninitialized", g_playerCallback.OnUnitialized);
            EventPlayerRemove(mPlayerName, "OnStateChanged", g_playerCallback.OnStateChanged);
            EventPlayerRemove(mPlayerName, "OnPlayProgress", g_playerCallback.OnPlayProgress);
            EventPlayerRemove(mPlayerName, "OnPlayError", g_playerCallback.OnPlayError);
            EventPlayerRemove(mPlayerName, "OnPlaySrcChanged", g_playerCallback.OnPlaySrcChanged);
            if (mPlayerName.Uninitialize()) {
                mIsInit = false;
                return true;
            }
        } 
        catch (e) 
        {
            if (debugMode) 
            {
                alert("e 9 " + e.message);
            }
            return false;
        }
    }
    function setPlayerSrc() {
        if (!playerSrcSeted) {
            mPlayerName.PlaySrc = mPlayerSource;
            playerSrcSeted = true;
        }
    }
    function setPlayURL() {
		alert('setPlayURL');
        if (getCookie("qqmusic_uin") == "" || getCookie("qqmusic_key") == "" || getCookie("qqmusic_fromtag") == "") {
            setCookie("qqmusic_uin", mUinCookie, "qq.com");
            setCookie("qqmusic_key", mKeyCookie, "qq.com");
            setCookie("qqmusic_fromtag", mFromTag, "qq.com");
        }
        var _obj = g_webPlayer.getSongInfoObj();
        if (!mIsInit) {
            return;
        }
        if (((_obj.murl == null) || (_obj.murl == "")) && (_obj.mid < 0)) 
        {
            return;
        }
        setPlayerSrc();
        var sid = parseInt(_obj.mid) + 30000000;
        var playUrl = g_webPlayer.wmaurl_tpl.jstpl_format({stream: parseInt(_obj.mstream) + 10,sid: sid});
        var torrentUrl = g_webPlayer.tpturl_tpl.jstpl_format({sid: sid});
        setPlayParams(sid, playUrl);
        mPlayerName.SetPlayURL(sid, playUrl, torrentUrl);
		alert('setPlayURL end');
        return;
    }
    function isPlaying() {
        if (!mIsInit) {
            return false;
        }
        return ((mPlayerState == g_playerStatus.S_PLAYING) || (mPlayerState == g_playerStatus.S_BUFFERING) || (mPlayerState == g_playerStatus.S_PLAYBEGIN));
    }
    function isPause() {
        if (!mIsInit) {
            return false;
        }
        return (mPlayerState == g_playerStatus.S_PAUSE);
    }
    function isStop() {
        if (!mIsInit) {
            return false;
        }
        var _s = mPlayerState;
        if (_s == g_playerStatus.S_BUFFERING) {
            var cur = new Date().getTime();
            if (cur - lastBufTime > 1000 * 60) {
                lastBufTime = new Date().getTime();
            }
            if (cur - lastBufTime > 1000 * 20) {
                lastBufTime = new Date().getTime();
                return true;
            }
        } else {
            lastBufTime = 0;
        }
        return ((_s == g_playerStatus.S_STOP) || (_s == g_playerStatus.S_PLAYEND));
    }
    function startPlayer() {
        if (!mIsInit) {
            return false;
        }
        if (isPlaying()) {
            return false;
        }
        try 
        {
            mPlayerName.Play();
            return true;
        } 
        catch (e) 
        {
            if (debugMode) 
            {
                alert("e 11 " + e.message);
            }
        }
        return false;
    }
    function stopPlayer() {
        if (!mIsInit) {
            return false;
        }
        if ((!isPlaying()) && (!isPause())) {
            return false;
        }
        try 
        {
            mPlayerName.Stop();
            return true;
        } 
        catch (e) 
        {
            if (debugMode) {
                alert("e 12 " + e.message);
            }
        }
        return false;
    }
    function pausePlayer() {
        if (!mIsInit) {
            return false;
        }
        if (!isPlaying()) {
            return false;
        }
        try 
        {
            mPlayerName.Pause();
        } 
        catch (e) 
        {
            if (debugMode) {
                alert("e 13 " + e.message);
            }
        }
    }
    function setMute() {
        if (!mIsInit) {
            return false;
        }
        var bSet = (mPlayerName.Mute == 1 ? 0 : 1);
        mPlayerName.Mute = bSet;
        return bSet;
    }
    function getVolumn() {
        if (!mIsInit) {
            return 0;
        }
        return mPlayerName.Volume;
    }
    function setVolumn(vol) {
        if (!mIsInit) {
            return false;
        }
        if (mPlayerName.Mute == 1) {
            return false;
        }
        if (vol > 100) {
            vol = 100;
        }
        if (vol < 0) {
            vol = 0;
        }
        if (vol >= 0 && vol <= 100) {
            mPlayerName.Volume = vol;
        }
        return true;
    }
    function setPlayerState(status) {
        mPlayerState = status;
    }
    return {createActiveX: createActiveX,setPlayerVersion: setPlayerVersion,initialize: initialize,unInitialize: unInitialize,setPlayURL: setPlayURL,setPlayList: setPlayList,resetCache: resetCache,startPlayer: startPlayer,stopPlayer: stopPlayer,pausePlayer: pausePlayer,setMute: setMute,getVolumn: getVolumn,setVolumn: setVolumn,setPlayerState: setPlayerState,getPlayerSource: getPlayerSource,getCurrentPlayerSource: getCurrentPlayerSource,setCurrentPlayerSource: setCurrentPlayerSource};
};
function EventPlayer(oTarget, sEventType, fnHandler) 
{
    if (oTarget.attachEvent) 
    {
        oTarget.attachEvent(sEventType, fnHandler);
    } 
    else if (oTarget.addEventListener) 
    {
        oTarget.addEventListener(sEventType, fnHandler, false);
    } 
    else 
    {
        oTarget[sEventType] = fnHandler;
    }
}
function EventPlayerRemove(oTarget, sEventType, fnHandler) 
{
    if (oTarget.detachEvent) 
    {
        oTarget.detachEvent(sEventType, fnHandler);
    } 
    else if (oTarget.removeEventListener) 
    {
        oTarget.removeEventListener(sEventType, fnHandler, false);
    } 
    else 
    {
        oTarget[sEventType] = null;
    }
}
function EventUtil(oTarget, sEventType, fnHandler) 
{
    if (oTarget.attachEvent) 
    {
        oTarget.attachEvent("on" + sEventType, fnHandler);
    } 
    else if (oTarget.addEventListener) 
    {
        oTarget.addEventListener(sEventType, fnHandler, false);
    } 
    else 
    {
        oTarget["on" + sEventType] = fnHandler;
    }
}
MUSIC.module.webPlayer.eventCallback = (function() {
    var $T = top, $ = MUSIC, $D = $.dom, $E = $.event;
    function OnInitialized(bSucc) {
        if (bSucc) {
        } else {
            alert("webPlayer initialize faied");
        }
    }
    function OnUnitialized() {
    }
    function OnStateChanged(lNewState) {
        if (debugMode) {
            alert('OnStateChanged:' + lNewState);
			alert(typeof lNewState);
        }
        if (lNewState >= 0 && lNewState <= 6) {
            g_webPlayer.setPlayerState(lNewState);
        }
        switch (lNewState) 
        {
            case 0:
                g_webPlayer.setPlayerState(g_playerStatus.S_UNDEFINE);
                break;
            case 1:
                g_webPlayer.setPlayerState(g_playerStatus.S_STOP);
                g_webPlayer.OnPlayStop();
                break;
            case 2:
                g_webPlayer.setPlayerState(g_playerStatus.S_PAUSE);
                g_webPlayer.OnPlayPause();
                break;
            case 3:
                g_webPlayer.setPlayerState(g_playerStatus.S_PLAYING);
                g_webPlayer.OnPlaying();
                break;
            case 4:
                g_webPlayer.setPlayerState(g_playerStatus.S_BUFFERING);
                break;
            case 5:
                g_webPlayer.setPlayerState(g_playerStatus.S_PLAYBEGIN);
                break;
            case 6:
                g_webPlayer.setPlayerState(g_playerStatus.S_PLAYEND);
                if (!g_webPlayer.nextPlayer()) {
					alert('ready to playSong');
                    playSong();
                }
                break;
            default:
                break;
        }
        {
        }
    }
    function OnPlayProgress(lCurPos, lTotal) {
        lCurPos = parseInt(lCurPos);
        lTotal = parseInt(lTotal);
        g_webPlayer.setCurPostion(lCurPos, lTotal);
        g_webPlayer.OnSongPlaying(lCurPos, lTotal);
        if (debugMode) 
        {
            alert("PlayProgress,curPos:" + lCurPos + ",total:" + lTotal);
        }
    }
    function OnPlayError(lErrCode, sErrDesc) {
        if (debugMode) {
            alert("playError,ErrCode:" + lErrCode + ",ErrDesc:" + sErrDesc);
        }
    }
    function OnPlaySrcChanged(sNewPlaySrc, sOldPlaySrc) {
        g_webPlayer.setCurrentPlayerSource(sNewPlaySrc);
        if (g_webPlayer.getCurrentPlayerSource() != g_webPlayer.getPlayerSource()) {
            g_webPlayer.setPlayerState(g_playerStatus.S_PAUSE);
            g_webPlayer.OnPlayPause();
        }
    }
    return {OnInitialized: OnInitialized,OnUnitialized: OnUnitialized,OnStateChanged: OnStateChanged,OnPlayProgress: OnPlayProgress,OnPlayError: OnPlayError,OnPlaySrcChanged: OnPlaySrcChanged};
})();
(function() {
    if (!!ua) 
    {
        ua.tt = (function() {
            var vtt = NaN;
            var agent = (/(?:(?:TencentTraveler|QQBrowser).(\d+\.\d+))/).exec(navigator.userAgent);
            if (agent) 
            {
                vtt = agent[1] ? parseFloat(agent[1]) : NaN;
            } 
            else 
            {
                vtt = NaN;
            }
            return vtt;
        })();
    }
})();
var g_player = MUSIC.module.webPlayer;
var g_webPlayer = g_player.interFace;
var g_playerList = g_player.playerList;
var g_playerStatus = g_player.playStatus;
var g_playerCallback = g_player.eventCallback;

MUSIC.event.getWheelDelta = function(event) {
    if (event.wheelDelta) {
        return event.wheelDelta;
    } else {
        return -event.detail * 40;
    }
};
MUSIC.scrollbar = (function() {
    var E = MUSIC.event;
    var D = MUSIC.dom;
    var bar, barp, cont, contp, barsz, barpsz, contsz, contpsz, rate, i = 0, bmax, isScroll = false, intf, delta, bnewy, cnewy, barclassname, _options = {bartop: "",barleft: 0,bar_hover: "",wheel_len: 8,wheel_num: 15,interval: 10};
    function init(options) {
        bar = D.get(options.barid);
        cont = D.get(options.contid);
        barp = bar.parentNode;
        barp.style.display = "";
        contp = cont.parentNode;
        contsz = D.getSize(cont);
        barpsz = D.getSize(barp);
        contpsz = D.getSize(contp);
        barclassname = bar.className;
        ullen = D.getSize(D.get(options.ulid))[1];
        var rate1 = ullen / barpsz[1];
        var newheight = parseInt(barpsz[1] / rate1);
        _options.barleft = D.getStyle(bar, "left");
        if (_options.bartop === "") {
            _options.bartop = parseInt(D.getStyle(bar, "top"));
        } else {
            D.setXY(cont, 0, 0);
            D.setXY(bar, _options.barleft, _options.top);
        }
        _options.bar_hover = barclassname;
        MUSIC.object.extend(_options, options || {});
        if (newheight < 20) {
            newheight = 20;
        }
        if (newheight > barpsz[1] - _options.bartop * 2) {
            bar.style.display = "none";
            barp.style.display = "none";
            E.removeEvent(bar, "mousedown", setBar);
            E.removeEvent(barp, "click", setBarp, arr);
            (function() {
                E.removeEvent(contp, "mousewheel", setWheel);
                E.removeEvent(contp, "DOMMouseScroll", setWheel);
            })();
            if (isScroll) {
                clearInterval(intf);
                isScroll = false;
            }
            return;
        }
        bar.style.height = newheight + "px";
        bar.style.display = "none";
        bar.style.display = "";
        barsz = D.getSize(bar);
        if (isScroll) {
            clearInterval(intf);
            isScroll = false;
        }
        rate = (ullen - contpsz[1]) / (barpsz[1] - barsz[1] - _options.bartop);
        bmax = barpsz[1] - barsz[1] - 2 * _options.bartop - 1;
        cmax = contsz[1] - contpsz[1];
        E.addEvent(bar, "mousedown", setBar);
        var body = document.body;
        E.addEvent(body, "mouseup", function() {
            E.removeEvent(body, "mousemove", showchange);
            bar.className = barclassname;
        });
        var arr = {"top": parseInt(D.getStyle(bar, "top")),"ey": D.getXY(bar)[1] + barsz[1] / 2};
        E.addEvent(barp, "click", setBarp, arr);
        (function() {
            E.addEvent(contp, "mousewheel", setWheel);
            E.addEvent(contp, "DOMMouseScroll", setWheel);
        })();
    }
    function setBarp(e, arr) {
        var target = E.getTarget(e);
        if (target == this) {
            showchange(e, arr);
        }
    }
    function showchange(e, arr) {
        var event = E.getEvent(e);
        E.preventDefault(e);
        var y = E.mouseY(event);
        var moveY = y - arr.ey;
        var newy = moveY + arr.top;
        var cnewy = -newy * rate;
        if (newy <= _options.bartop) {
            newy = _options.bartop;
            cnewy = 0;
        } else if (newy > bmax) {
            newy = bmax;
            cnewy = -cmax;
        }
        if (cnewy + cmax < 0) {
            cnewy = -cmax;
        }
        D.setXY(cont, 0, cnewy);
        D.setXY(bar, _options.barleft, newy);
    }
    function setBar(e) {
        var event = E.getEvent(e);
        E.preventDefault(event);
        var barxy = D.getXY(bar);
        var ey = E.mouseY(event);
        var top = barxy[1] - D.getXY(barp)[1];
        var arr = {"top": top,"ey": ey};
        E.addEvent(document.body, "mousemove", showchange, arr);
        bar.className = _options.bar_hover;
    }
    function changewheel() {
        if (delta + 1) {
            i++;
        } else {
            i--;
        }
        if (i == 0) {
            clearInterval(intf);
            isScroll = false;
        }
        bnewy += -delta * _options.wheel_len / rate;
        cnewy += delta * _options.wheel_len;
        if (bnewy < _options.bartop) {
            bnewy = _options.bartop;
            i == 0;
        } else if (bnewy > bmax) {
            bnewy = bmax;
            i == 0;
        }
        if (cnewy > 0) {
            cnewy = 0;
        } else if (cmax + cnewy < 0) {
            cnewy = -cmax;
        }
        D.setXY(cont, 0, cnewy);
        D.setXY(bar, _options.barleft, bnewy);
    }
    function setWheel(e) {
        var event = E.getEvent(e);
        E.preventDefault(event);
        delta = E.getWheelDelta(event) / 120;
        if (!isScroll) {
            isScroll = true;
            bnewy = D.getXY(bar)[1] - D.getXY(barp)[1];
            cnewy = D.getXY(cont)[1] - D.getXY(contp)[1];
            if (delta + 1) {
                i = -_options.wheel_num;
            } else {
                i = _options.wheel_num;
            }
            intf = setInterval(changewheel, _options.interval);
        } else {
            if (delta + 1) {
                if (i < 0) {
                    i = i - _options.wheel_num;
                } else {
                    i = -_options.wheel_num;
                }
            } else {
                if (i < 0) {
                    i = _options.wheel_num;
                } else {
                    i = i + _options.wheel_num;
                }
            }
        }
    }
    function selectElement(element) {
        if (bar.style.display == "none") {
            return;
        } else {
            var element = D.get(element);
            var position = D.getXY(element);
            var contParentXY = D.getXY(contp);
            var cnewy = position[1] - contParentXY[1];
            var bnewy = cnewy / rate;
            if (bnewy <= _options.bartop + 10) {
                bnewy = _options.bartop;
                cnewy = 0;
            } else if (bnewy > bmax) {
                bnewy = bmax;
                cnewy = cmax;
            }
            if (cnewy > cmax) {
                cnewy = cmax;
            } else if (cnewy < 0) {
                cnewy = 0;
            }
            D.setXY(cont, 0, -cnewy);
            D.setXY(bar, _options.barleft, bnewy);
        }
    }
    return {init: init,selectElement: selectElement};
})();

MUSIC.moveTilte = (function() {
    var D = MUSIC.dom, E = MUSIC.event, title, box, intf = 0, timeoutf = 0, setOver = false, currenty = 0, titley = 0;
    function init(titleId) {
        title = document.getElementById(titleId);
        box = title.parentNode;
        titley = D.getSize(title)[1];
        E.addEvent(box, "mouseout", mouseout);
        E.addEvent(box, "mouseover", mouseover);
    }
    function mouseout(event) {
        var e = E.getEvent(event);
        var target = E.getTarget(e);
        var relativeElement = E.getRelatedTarget(e);
        if (!D.isAncestor(box, relativeElement)) {
            clearTimeout(timeoutf);
            timeoutf = setTimeout(function() {
                intf = setInterval(function() {
                    if (currenty < titley) {
                        var changey = Math.ceil((titley - currenty) / 4);
                        currenty = currenty + changey;
                        D.setXY(title, 0, -currenty);
                    } else {
                        clearInterval(intf);
                    }
                }, 50);
            }, 3000);
        }
    }
    function mouseover(event) {
        var e = E.getEvent(event);
        var target = E.getTarget(e);
        var relativeElement = E.getRelatedTarget(e);
        if (!D.isAncestor(box, relativeElement)) {
            if (!setOver) {
                clearTimeout(timeoutf);
                clearInterval(intf);
                setOver = true;
                intf = setInterval(function() {
                    if (currenty > 0) {
                        var changey = Math.ceil(currenty / 4);
                        currenty = currenty - changey;
                        D.setXY(title, 0, -currenty);
                    } else {
                        clearInterval(intf);
                        setOver = false;
                    }
                }, 50);
            }
        }
    }
    function recover() {
        clearTimeout(timeoutf);
        clearInterval(intf);
        intf = setInterval(function() {
            if (currenty > 0) {
                var changey = Math.ceil(currenty / 4);
                currenty = currenty - changey;
                D.setXY(title, 0, -currenty);
            } else {
                clearInterval(intf);
                setOver = false;
            }
        }, 50);
        timeoutf = setTimeout(function() {
            intf = setInterval(function() {
                if (currenty < titley) {
                    var changey = Math.ceil((titley - currenty) / 4);
                    currenty = currenty + changey;
                    D.setXY(title, 0, -currenty);
                } else {
                    clearInterval(intf);
                }
            }, 50);
        }, 3000);
    }
    return {init: init,recover: recover};
})();

MUSIC.pic = (function() {
    var mun1 = 100, mun2 = 100, intf1 = null, temp = null, intf2 = null, outf = null;
    var img1 = document.getElementById('img1');
    var img2 = document.getElementById('img2');
    function change(src) {
        clearTimeout(outf);
        if (intf1 || intf2) {
            clearInterval(intf1);
            clearInterval(intf2);
            intf1 = intf2 = null;
            temp = img1;
            img1 = img2;
            img2 = temp;
            img1.style.filter = 'alpha(opacity=0)';
            img1.style.opacity = 0;
            img2.style.filter = 'alpha(opacity=0)';
            img2.style.opacity = 0;
            temp = null;
            mun1 = 0;
            mun2 = 100;
        }
        outf = setTimeout(function() {
            img2.onload = function() {
                img2.style.filter = 'alpha(opacity=0)';
                img2.style.opacity = 0;
                img2.style.display = "";
                clearInterval(intf2);
                intf2 = setInterval(function() {
                    if (mun2 > 0) {
                        img2.style.filter = 'alpha(opacity=' + (101 - mun2) + ')';
                        img2.style.opacity = (101 - mun2) / 100;
                        mun2 -= 2;
                    } else {
                        clearInterval(intf2);
                        mun2 = 100;
                        intf2 = null;
                        temp = img1;
                        img1 = img2;
                        img2 = temp;
                        temp = null;
                    }
                }, 5);
            }
            img2.style.display = "none";
            img2.src = src;
        }, 0);
        clearInterval(intf1);
        intf1 = setInterval(function() {
            if (mun1 > 0) {
                img1.style.filter = 'alpha(opacity=' + (mun1) + ')';
                img1.style.opacity = mun1 / 100;
                mun1 -= 2;
            } else {
                clearInterval(intf1);
                intf1 = null;
                mun1 = 100;
            }
        }, 5);
    }
    return {change: change};
})();

MUSIC.module.share = (function() {
    var qzoneShareUrl = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=%(url)&desc=%(desc)&summary=%(summary)&title=%(title)&pics=%(pics)';
    var weiboShareUrl = 'http://v.t.qq.com/share/share.php?url=%(url)&title=%(title)&pic=%(pic)';
    _options = {url: gLocation,desc: '',summary: '',title: '',pics: '',pic: ''};
    function shareToQzone(options) {
        MUSIC.object.extend(_options, options || {});
        for (var i in _options) {
            _options[i] = encodeURIComponent(_options[i]);
        }
        var url = qzoneShareUrl.jstpl_format(_options);
        window.open(url, '', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no');
    }
    function shareToWeibo(options) {
        MUSIC.object.extend(_options, options || {});
        for (var i in _options) {
            _options[i] = encodeURIComponent(_options[i]);
        }
        var url = weiboShareUrl.jstpl_format(_options);
        window.open(url, '', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no');
    }
    return {shareToQzone: shareToQzone,shareToWeibo: shareToWeibo};
})();
var g_share = MUSIC.module.share;

MUSIC.channel.fm = {isQplus: gLocation.indexOf('app_id=200002266') > -1 ? 1 : 0,isPengyou: gLocation.indexOf('pengyou') > -1 ? 1 : 0,_song_num: 10,_type_num: 3,_callback_counter: 0,_callback_timer: null,_curFmInfo: {fmType: 0,fmId: 0,fmName: ""},_fmInfoObj: {},_fmNameObj: {},_fmListInfo: {},_curSongInfo: null,_isPlayNow: true,_divSongCover: null,_divSongName: null,_divSongTime: null,_divSongBar: null,_btnPlay: null,_btnLike: null,_curChn: null,_chnContainer: {},_curChnType: null,_curChnList: null,_myFavFm: null,_myFavSong: null,_isFirstInit: true,_statArrNum: 7,_statArr: ['', '', '', '', '', '', ''],init: function(options) {
        if (!!options && !!options.fmInfoObj) {
            MUSIC.object.extend(this._fmInfoObj, options.fmInfoObj || {});
        }
        var $ = MUSIC, $D = $.dom;
        this._divSongCover = $D.get("divsongcover");
        this._divSongName = $D.get("divsongname");
        this._divSongTime = $D.get("divsongtime");
        this._divSongBar = $D.get("divsongbar");
        this._btnPlay = $D.get("btnplay");
        this._btnLike = $D.get("btnlike");
        this._myFavFm = $D.get("divmyfavfm");
        this._myFavSong = $D.get("divmyfavsong");
        this._curChnType = $D.get("ch_1");
        this._curChnList = $D.get("content_1");
        MUSIC.moveTilte.init("player_title");
        this.renderFmList();
        this.showUserInfo();
        this.selectFmEvent();
        if (!g_fmChn.isQplus && !g_fmChn.isPengyou) {
            $D.get('footer').style.display = 'block';
        }
        g_musicMain.init();
    },myFavFm: {idList: [],currentPage: 1,itemNum: 10,maxPage: 1,isLoad: false,init: function(json) {
            this.idList = json.radio_list.reverse();
            for (var i = 0; i < this.idList.length; i++) {
                if (!g_fmChn._fmNameObj[this.idList[i].radioid + '_' + this.idList[i].type]) {
                    this.idList.splice(i, 1);
                    i--;
                }
            }
            this.maxPage = Math.ceil(this.idList.length / this.itemNum);
            if (this.maxPage == 0) {
                this.maxPage = 1;
            }
            g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
        },getList: function() {
            var _this = this;
            g_fmChn.favFm.getList(function(json) {
                _this.isLoad = true;
                _this.init(json);
                g_fmChn._callback_counter++;
            });
        },showPage: function(pageNum) {
            if (pageNum > this.maxPage || pageNum < 1) {
            } else {
                this.currentPage = pageNum;
                var i = (pageNum - 1) * this.itemNum, len = pageNum * this.itemNum, maxIndex = this.idList.length, listHTML = [], itemHTML = "", item, radioNameList = g_fmChn._fmNameObj;
                for (; i < len; i++) {
                    if (i < maxIndex) {
                        item = this.idList[i];
                        itemHTML = '<li onmouseover="this.className=\'on\';" onmouseout="this.className=\'\';"><span class="radio">' + radioNameList[item.radioid + '_' + item.type] + '</span><span class="play"><a href="#' + item.radioid + '_' + item.type + '" class="icon_play" title="播放" onclick="g_fmChn.setChnAndList(' + item.radioid + ',' + item.type + ');g_dialog.hide();">播放</a></span><span class="del"><a href="javascript:;" onclick="g_fmChn.myFavFm.deleteItem(' + i + ');" class="icon_del" title="取消">取消</a></span></li>';
                        listHTML.push(itemHTML);
                    } else {
                        break;
                    }
                }
                var k = 1, navHTML = [], navLi = '';
                navHTML.push('<span class="num">');
                for (; k <= this.maxPage; k++) {
                    if (k != pageNum) {
                        navLi = '<a href="javascript:;" onclick="g_fmChn.myFavFm.showPage(' + k + ')">' + k + '</a>';
                    } else {
                        navLi = '<a href="javascript:;" class="on">' + k + '</a>';
                    }
                    navHTML.push(navLi);
                }
                navHTML.push('</span>');
                if (pageNum < this.maxPage) {
                    navHTML.push('<a href="javascript:;" onclick="g_fmChn.myFavFm.nextPage()">下一页</a>');
                }
                if (pageNum > 1) {
                    navHTML.unshift('<a href="javascript:;" onclick="g_fmChn.myFavFm.prevPage()">上一页</a>');
                }
                if (this.idList.length == 0) {
                    listHTML.push('<div class="radioisnull"><p>你还没有收藏任何电台。</p></div>');
                    navHTML = [];
                }
                if (this.maxPage == 1) {
                    navHTML = [];
                }
                var doc = document;
                doc.getElementById("myFavFmPage").innerHTML = listHTML.join("");
                doc.getElementById("myFavFmNav").innerHTML = navHTML.join("");
            }
        },nextPage: function() {
            if (this.currentPage < this.maxPage) {
                this.showPage(++this.currentPage);
            }
        },prevPage: function() {
            if (this.currentPage > 1) {
                this.showPage(--this.currentPage);
            }
        },addToMyFavFmList: function(info) {
            var info = info, _this = this;
            g_fmChn.favFm.add({'fmId': info.radioid,'fmType': info.type}, function() {
                _this.idList.unshift(info);
                _this.maxPage = Math.ceil(_this.idList.length / _this.itemNum);
                if (_this.maxPage == 0) {
                    _this.maxPage = 1;
                }
            });
        },deleteFromMyFavFmList: function(info) {
            var index = -1;
            for (var i = 0, len = this.idList.length; i < len; i++) {
                if (this.idList[i].radioid == info.radioid) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                var info = info, _this = this;
                g_fmChn.favFm.del({'fmId': info.radioid,'fmType': info.type}, function() {
                    var deletFM = _this.idList.splice(index, 1);
                    _this.maxPage = Math.ceil(_this.idList.length / _this.itemNum);
                    if (_this.maxPage == 0) {
                        _this.maxPage = 1;
                    }
                });
            }
        },deleting: 0,deleteItem: function(index) {
            if (g_fmChn.favFm.deleting) {
                return;
            }
            g_fmChn.favFm.deleting = 1;
            var index = index, deletFM = this.idList[index], _this = this;
            g_fmChn.favFm.del({'fmId': deletFM.radioid,'fmType': deletFM.type}, function() {
                var deletFM = _this.idList.splice(index, 1);
                _this.maxPage = Math.ceil(_this.idList.length / _this.itemNum);
                if (_this.maxPage == 0) {
                    _this.maxPage = 1;
                }
                if (_this.currentPage <= _this.maxPage) {
                    _this.showPage(_this.currentPage);
                } else {
                    _this.prevPage();
                }
                g_fmChn.favFm.deleting = 0;
            });
        },show: function() {
            var myFavFmHTML = ('<div class="cont"><div class="radiolist"><ul id="myFavFmPage"></ul></div><div class="pager" id="myFavFmNav"></div></div>');
            if (!this.isLoad) {
                var _this = this;
                g_fmChn.favFm.getList(function(data) {
                    _this.isLoad = true;
                    _this.init(data);
                    g_dialog.show({mode: "bigpage",title: "我收藏的电台",desc: myFavFmHTML,width: 400});
                    _this.showPage(1);
                });
            } else {
                g_dialog.show({mode: "bigpage",title: "我收藏的电台",desc: myFavFmHTML,width: 400});
                this.showPage(1);
            }
        }},myFavSong: {songList: [],songListMap: [],currentPage: 1,itemNum: 10,maxPage: 1,isLoad: false,init: function(json) {
            this.songList = json.SongList;
            for (var i = 0, len = this.songList.length; i < len; i++) {
                this.songListMap[this.songList[i].id] = true;
            }
            this.maxPage = Math.ceil(this.songList.length / this.itemNum);
            if (this.maxPage == 0) {
                this.maxPage = 1;
            }
            g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
        },getList: function() {
            var _this = this;
            g_fmChn.favSong.getList(function(json) {
                _this.init(json);
                g_fmChn._callback_counter++;
            });
        },isInSongList: function(songId) {
            return !!this.songListMap[songId];
        },addToMyFavSongList: function(songInfo) {
            var _this = this, songInfo = songInfo;
            g_fmChn.favSong.add(songInfo.id, songInfo.type, function() {
                _this.songList.unshift(songInfo);
                _this.songListMap[songInfo.id] = true;
                _this.maxPage = Math.ceil(_this.songList.length / _this.itemNum);
                if (_this.maxPage == 0) {
                    _this.maxPage = 1;
                }
            });
        },delFromFavSongList: function(songId, songType) {
            var id = songId, type = songType || 3, _this = this;
            g_fmChn.favSong.del(songId, songType, function() {
                _this.songListMap[id] = false;
                for (var i = 0; i < _this.songList.length; i++) {
                    if (_this.songList[i].id == id) {
                        _this.songList.splice(i, 1);
                        _this.maxPage = Math.ceil(_this.songList.length / _this.itemNum);
                        if (_this.maxPage == 0) {
                            _this.maxPage = 1;
                        }
                        break;
                    }
                }
            });
        },showPage: function(pageNum) {
            if (pageNum > this.maxPage || pageNum < 1) {
            } else {
                this.currentPage = pageNum;
                var i = (pageNum - 1) * this.itemNum, len = pageNum * this.itemNum, listHTML = [], itemHTML = "", item, maxIndex = this.songList.length;
                for (; i < len; i++) {
                    if (i < maxIndex) {
                        var item = this.songList[i];
                        itemHTML = '<li onmouseover="this.className=\'on\';" onmouseout="this.className=\'\';"><span class="songname">' + item.songname + '</span><span class="artists">' + item.singername + '</span><span class="album">' + item.diskname + '</span><span class="del"><a href="javascript:;" class="icon_del" title="取消" onclick="g_fmChn.myFavSong.deleteItem(' + i + ')">取消</a></span></li>';
                        listHTML.push(itemHTML);
                    } else {
                        break;
                    }
                }
                var k = 1, navHTML = [], navLi = '', navList = [];
                navHTML.push('<span class="num">');
                for (; k <= this.maxPage; k++) {
                    if (k != pageNum) {
                        navLi = '<a href="javascript:;" onclick="g_fmChn.myFavSong.showPage(' + k + ')">' + k + '</a>';
                    } else {
                        navLi = '<a href="javascript:;"  class="on">' + k + '</a>';
                    }
                    navList.push(navLi);
                }
                if (this.maxPage <= 13) {
                } else {
                    if (this.currentPage > 7) {
                        navList.splice(1, this.currentPage - 7, "...");
                        if (this.maxPage - this.currentPage > 6) {
                            navList.splice(13, this.maxPage - 6 - this.currentPage, "...");
                        }
                    } else {
                        if (this.maxPage - this.currentPage > 6) {
                            navList.splice(this.currentPage + 5, this.maxPage - 6 - this.currentPage, "...");
                        }
                    }
                }
                navHTML.push(navList.join(""));
                navHTML.push('</span>');
                if (pageNum < this.maxPage) {
                    navHTML.push('<a href="javascript:;" onclick="g_fmChn.myFavSong.nextPage()">下一页</a>');
                }
                if (pageNum > 1) {
                    navHTML.unshift('<a href="javascript:;" onclick="g_fmChn.myFavSong.prevPage()">上一页</a>');
                }
                var doc = document;
                if (this.songList.length == 0) {
                    listHTML = [];
                    navHTML = [];
                    doc.getElementById("play_all").style.display = "none";
                    doc.getElementById("songnullpage").style.display = "";
                    doc.getElementById("myFavSongPage").parentNode.style.display = "none";
                    doc.getElementById("myFavSongNav").style.display = "none";
                    doc.getElementById("cont_head").style.display = "none";
                } else {
                    doc.getElementById("play_all").style.display = "";
                    doc.getElementById("songnullpage").style.display = "none";
                    doc.getElementById("cont_head").style.display = "";
                    doc.getElementById("myFavSongPage").parentNode.style.display = "";
                    doc.getElementById("myFavSongNav").style.display = "";
                }
                if (this.maxPage == 1) {
                    navHTML = [];
                }
                doc.getElementById("myFavSongPage").innerHTML = listHTML.join("");
                doc.getElementById("myFavSongNav").innerHTML = navHTML.join("");
            }
        },nextPage: function() {
            if (this.currentPage < this.maxPage) {
                this.showPage(++this.currentPage);
            }
        },prevPage: function() {
            if (this.currentPage > 1) {
                this.showPage(--this.currentPage);
            }
        },deleteItem: function(index) {
            var deleteItem = this.songList[index], _this = this;
            g_fmChn.favSong.del(deleteItem.id, deleteItem.type, function() {
                _this.songListMap[deleteItem.id] = false;
                for (var i = 0; i < _this.songList.length; i++) {
                    if (_this.songList[i].id == deleteItem.id) {
                        _this.songList.splice(i, 1);
                        break;
                    }
                }
                _this.maxPage = Math.ceil(_this.songList.length / _this.itemNum);
                if (_this.maxPage == 0) {
                    _this.maxPage = 1;
                }
                if (_this.currentPage <= _this.maxPage) {
                    _this.showPage(_this.currentPage);
                } else {
                    _this.prevPage(_this.currentPage);
                }
            });
        },show: function() {
            var uin = g_user.getUin();
            if (uin < 10001) {
                g_user.openLogin(null, 'self');
                return;
            }
            var myFavSongHTML = ('<div class="cont" id="myFavSong_contPage"><div class="hint" id="cont_head">我的最爱收录您在QQ音乐上标记过喜欢的所有歌曲，并可随时随地在任何联网设备上访问。</div><div class="songlist"><ul id="myFavSongPage"></ul></div><div class="pager" id="myFavSongNav"></div><div class="songisnull" id="songnullpage" style="display:none;padding-left:20px;"><p>您还没有对任何歌曲标记过喜欢。</p><p>轻轻点击歌曲后的喜欢按钮，就可以将歌曲快速收藏到我的最爱列表。</p><p>而且QQ音乐可以永远记住你的喜好，给你推荐越来越符合你口味的歌曲。</p><p>快来体验吧！</p></div>');
            g_dialog.show({mode: "bigpage",title: '<span>我的最爱</span><a href="javascript:;" onclick="g_fmChn.myFavSong.playAll();g_fmChn.fm_stat(10)" class="icon_playall" id="play_all" >全部播放</a>',desc: myFavSongHTML,width: 600});
            this.showPage(1);
        },playAll: function() {
            if (this.songList.length > 0) {
                var songinfo_list = [], begain = (this.currentPage - 1) * this.itemNum, end = this.currentPage * this.itemNum, maxIndex = this.songList.length, tmp;
                for (; begain < end; begain++) {
                    if (begain < maxIndex) {
                        tmp = this.songList[begain];
                        songinfo_list.push([tmp.id, tmp.type, tmp.url, tmp.songname, tmp.singerid, tmp.singername, tmp.diskid, tmp.diskname, tmp.playtime]);
                    } else {
                        break;
                    }
                }
                if (songinfo_list.length > 0) {
                    this.OpenPostWindow("http://qzone-music.qq.com/fcg-bin/yqqcom_play_mid.fcg", "_webQQMusicPlayer", {songList: this.getPostData(songinfo_list)});
                } else {
                    return;
                }
            }
        },OpenPostWindow: function(sUrl, sWindowName, oPostData) {
            if (typeof sWindowName !== "string") {
                sWindowName = "";
            }
            var sFormId = "post_window_form";
            var oForm = document.getElementById(sFormId);
            if (oForm != null) {
                document.body.removeChild(oForm);
            }
            var oForm = document.createElement("form");
            oForm.id = sFormId;
            oForm.action = sUrl;
            oForm.method = "POST";
            oForm.target = sWindowName;
            for (key in oPostData) {
                var oInput = document.createElement("input");
                oInput.type = "hidden";
                oInput.name = key;
                oInput.value = oPostData[key];
                oForm.appendChild(oInput);
            }
            document.body.appendChild(oForm);
            oForm.submit();
        },getPostData: function(aList) {
            var iLen = aList.length;
            if (iLen === 0) {
                return "[];";
            }
            var sJson = "[";
            for (var i = 0; i < iLen; i++) {
                if (i > 0) {
                    sJson += ',';
                }
                var iLen2 = aList[i].length;
                if (iLen2 == 0) {
                    sJson += '[]';
                    continue;
                }
                sJson += '[';
                for (var j = 0; j < iLen2; j++) {
                    if (j > 0) {
                        sJson += ',';
                    }
                    sJson += '"' + (aList[i][j]).toString().replace(/"/g, '\\"') 
                    + '"';
                }
                sJson += ']';
            }
            sJson += "]";
            return sJson;
        }},updateMyFavNum: function(fmNum, songNum) {
        g_fmChn._myFavFm.innerHTML = '我收藏的电台(' + fmNum + ')';
        g_fmChn._myFavSong.innerHTML = '我的最爱(' + songNum + ')';
    },renderFmList: function() {
        var list_tpl1 = '<li><a href="#%(id)_%(type)" hidefocus="hidefocus" title="%(name)"><span><strong>%(name)</strong><em>MHZ</em></span></a></li>';
        var list_tpl2 = '<li><a href="#%(id)_%(type)" hidefocus="hidefocus" title="%(name)"><span><strong>%(name)</strong></span></a></li>';
        var type = 1, id = 0;
        var fmInfo = {};
        var location = MUSIC.util.gLocation;
        var ha = location.lastIndexOf("#");
        if (ha >= 0) {
            var hrefparts = location.substring(ha + 1);
            hrefparts = hrefparts.split('_');
            id = hrefparts[0];
            type = hrefparts[1];
        }
        var inited = true;
        var fm = {};
        for (var j = 1; j <= this._type_num; j++) {
            var list = this._fmInfoObj["type" + j];
            for (var i = 0, len = list.length; i < len; i++) {
                list[i].type = j;
                this._fmNameObj[list[i].id + "_" + j] = list[i].name;
                this._fmListInfo[list[i].id + "_" + j] = list[i].i;
                if (!fm[list[i].i]) {
                    fm[list[i].i] = [];
                }
                if (j != 2) {
                    fm[list[i].i].push(list_tpl1.jstpl_format(list[i]));
                } else {
                    fm[list[i].i].push(list_tpl2.jstpl_format(list[i]));
                }
                if (inited) {
                    fmInfo.fmType = 1;
                    fmInfo.fmId = list[i].id;
                    fmInfo.fmName = list[i].name;
                    inited = false;
                }
            }
        }
        for (var name in fm) {
            MUSIC.dom.get("content_" + name).innerHTML += fm[name].join('');
        }
        for (var i = 1; i <= this._type_num; i++) {
            if (!MUSIC.dom.get("content_" + i)) {
                continue;
            }
            var node = MUSIC.dom.getFirstChild("content_" + i);
            if (!node) {
                continue;
            }
            fnode = MUSIC.dom.getFirstChild(node);
            if (!fnode) {
                continue;
            }
            var _href = fnode.getAttribute("href");
            _href = _href.substring(_href.indexOf('#'));
            this._chnContainer[_href] = fnode;
            while (node = MUSIC.dom.getNextSibling(node)) {
                var fnode = MUSIC.dom.getFirstChild(node);
                _href = fnode.getAttribute("href");
                _href = _href.substring(_href.indexOf('#'));
                this._chnContainer[_href] = fnode;
            }
        }
        this._chnContainer["#0_100"] = MUSIC.dom.get("ch_0_100");
        this._fmNameObj["0_100"] = "猜你喜欢";
        var tag = '#' + id + '_' + type;
        if (!!this._chnContainer[tag]) {
            fmInfo.fmType = type;
            fmInfo.fmId = id;
            fmInfo.fmName = this._fmNameObj[id + "_" + type];
        }
        this._curChn = this._chnContainer['#' + fmInfo.fmId + '_' + fmInfo.fmType];
        this.setChnAndList(fmInfo.fmId, fmInfo.fmType);
        MUSIC.scrollbar.init({barid: "bar",contid: "content",bar_hover: "slider slider_hover",ulid: this._curChnList});
        this.setChnAndList(fmInfo.fmId, fmInfo.fmType);
    },showUserInfo: function() {
        if (!g_user.isLogin()) {
            return;
        }
        g_user.getVipInfo(function(data) {
            if (data.vip != 1 && data.vip != 2) {
                return;
            }
            var elem = MUSIC.dom.get("divuserinfo");
            if (elem) {
                elem.innerHTML = (data.nickname != "" ? data.nickname : g_user.getUin()) + ((g_fmChn.isQplus || g_fmChn.isPengyou) ? '' : '<a href="javascript:;" onclick="g_user.loginOut(g_fmChn.fm_logout);">[退出]</a>');
            }
            g_fmChn.myFavFm.getList();
            g_fmChn.myFavSong.getList();
            g_fmChn._callback_counter++;
        });
    },shareFm: function() {
        var share_url = window.location.href.replace(/\?app_id=200002266/g, '').replace(/\/pengyou/g, '');
        g_share.shareToWeibo({url: share_url,desc: '',summary: '',title: '#QQ音乐电台' + g_fmChn._curFmInfo.fmName + '频道#',pic: 'http://ctc.imgcache.qq.com/music/photo/album/' + (g_fmChn._curSongInfo.malbumid % 100) + '/albumpic_' + g_fmChn._curSongInfo.malbumid + '_0.jpg'});
        g_fmChn.fm_stat(6);
    },addFavFm: function() {
        g_fmChn.myFavFm.addToMyFavFmList({radioid: g_fmChn._curFmInfo.fmId,type: g_fmChn._curFmInfo.fmType});
        g_fmChn.fm_stat(7);
    },goMyFavFmList: function() {
        g_fmChn.myFavFm.show();
    },goMyFavSongList: function() {
        g_fmChn.myFavSong.show();
        g_fmChn.fm_stat(9);
    },getFmSongList: function(fmType, fmId, callback) {
        var uin = g_user.getUin(), url = "", cbname = "";
        switch (parseInt(fmType)) 
        {
            case 1:
            case 3:
                url = "http://radio.cloud.music.qq.com/fcgi-bin/qm_guessyoulike.fcg?start=-1&num=" + this._song_num + "&uin=" + uin + "&labelid=" + fmId + "&rnd=" + new Date().valueOf();
                cbname = "JsonCallBack";
                break;
            case 2:
                url = "http://radio.cloud.music.qq.com/fcgi-bin/fcg_singer_radio_client.fcg?start=-1&num=" + this._song_num + "&ouin=" + uin + "&singerid=" + fmId + "&rnd=" + new Date().valueOf();
                cbname = "JsonCallBack";
                break;
            case 100:
                if (uin < 10001) {
                    g_user.callback = (function(fmType, fmId, callback) {
                        return function() {
                            g_fmChn.getFmSongList(fmType, fmId, callback);
                        }
                    })(fmType, fmId, callback);
                    g_user.openLogin(null, 'self');
                    return;
                }
                url = "http://s.plcloud.music.qq.com/fcgi-bin/song_sim.fcg?start=-1&num=" + this._song_num + "&uin=" + uin + "&rnd=" + new Date().valueOf();
                cbname = "SongRecCallback";
                break;
            default:
                break;
        }
        function _error() {
            g_popup.show(1, "获取电台歌曲信息失败！", "当前网络繁忙，请您稍后重试。", 1000, 320);
        }
        function formatMusic(songdata) {
            var _arrSongAttr = ["mid", "msong", "msingerid", "msinger", "malbumid", "malbum", "msize", "minterval", "mstream", "mdownload", "msingertype", "size320", "size128", "mrate", "gososo", "sizeape", "sizeflac", "sizeogg"];
            var length = _arrSongAttr.length, arrMusic = songdata.split("|"), _obj = {}, i = 0, _length = Math.min(length, arrMusic.length);
            for (i = 0; i < _length; i++) {
                _obj[_arrSongAttr[i]] = arrMusic[i];
            }
            for (i = _length; i < length; i++) {
                _obj[_arrSongAttr[i]] = "";
            }
            return _obj;
        }
        ;
        var j = new MUSIC.JSONGetter(url, "songlist", null, "gb2312", false);
        j.onSuccess = function(data) {
            var _songlist = [];
            if (data.retcode == 0) {
                MUSIC.object.each(data.songs, function(info) {
                    var _data = formatMusic(unescape(unescape(info.data)).replace(/\+/ig, " "));
                    _data.mruleid = 0;
                    if (data.rule_id) {
                        _data.mruleid = data.rule_id;
                    }
                    _songlist.push(_data);
                });
                if (_songlist.length <= 0) {
                    _error();
                    return;
                }
                if (callback) {
                    callback(_songlist);
                }
            } else if (data.retcode == -2) {
                g_user.callback = (function(fmType, fmId, callback) {
                    return function() {
                        g_fmChn.getFmSongList(fmType, fmId, callback);
                    }
                })(fmType, fmId, callback);
                g_user.openLogin(null, 'self');
            } else {
                _error();
            }
        };
        j.onError = function() {
            _error();
        };
        j.send(cbname);
    },updateCurSong: function(songInfo) {
        g_fmChn._curSongInfo = songInfo;
        if (!g_fmChn.isQplus && !g_fmChn.isPengyou) {
            document.title = songInfo.msong + ' - QQ音乐电台';
        }
        g_fmChn._divSongName.innerHTML = songInfo.msong + ' - ' + songInfo.msinger;
        g_fmChn._divSongTime.innerHTML = '';
        g_fmChn._divSongBar.style.width = '0%';
        MUSIC.pic.change('http://ctc.imgcache.qq.com/music/photo/album/' + (songInfo.malbumid % 100) + '/albumpic_' + songInfo.malbumid + '_0.jpg');
        MUSIC.moveTilte.recover();
    },updateSongBar: function(curtime, totaltime) {
        if (isNaN(curtime) || isNaN(totaltime)) {
            return;
        }
        function formatTime(seconds) {
            var mins = parseInt(seconds / 60, 10), secs = parseInt(seconds % 60, 10);
            return mins + ":" + (secs > 9 ? "" : "0") + secs;
        }
        g_fmChn._divSongTime.innerHTML = '-' + formatTime(totaltime - curtime);
        g_fmChn._divSongBar.style.width = parseInt(curtime * 100 / totaltime, 10) + '%';
    },initVol: function(vol) {
        var D = MUSIC.dom, E = MUSIC.event, volumebar = D.get("spanvolumebar"), volumeslider = D.get("spanvolumeslider");
        volumebar.title = "音量：" + vol + "%";
        volumeslider.style.width = vol + "%";
    },mousedown: function(e) {
        MUSIC.event.cancelBubble(e);
        MUSIC.event.preventDefault(e);
        MUSIC.event.addEvent(document.body, "mousemove", g_fmChn.mousemove);
        MUSIC.event.addEvent(document.body, "mouseup", function() {
            MUSIC.event.removeEvent(document.body, "mousemove", g_fmChn.mousemove);
        });
    },mousemove: function(event) {
        MUSIC.event.cancelBubble(event);
        MUSIC.event.preventDefault(event);
        MUSIC.event.addEvent(document.body, "mouseup", function() {
            MUSIC.event.removeEvent(document.body, "mousemove", g_fmChn.mousemove);
        });
        g_fmChn.updateVol();
    },updateVol: function() {
        var D = MUSIC.dom, E = MUSIC.event, volumebar = D.get("spanvolumebar"), volumeslider = D.get("spanvolumeslider"), pos = D.getPosition(volumebar), eventx = E.mouseX(), vol = parseInt((eventx - pos["left"]) * 100 / pos["width"], 10);
        if (!isNaN(vol) && (vol >= 0 && vol < 101)) {
            volumebar.title = "音量：" + vol + "%";
            volumeslider.style.width = vol + "%";
            g_webPlayer.setVolumn(vol);
        }
    },updateCurFm: function(fmInfo) {
        g_fmChn._curFmInfo = fmInfo;
        MUSIC.dom.get("divfmtitle").innerHTML = fmInfo.fmName;
    },fm_stat: function(optcode) {
        var source = g_fmChn.isQplus ? 1 : (g_fmChn.isPengyou ? 2 : 0);
        g_stat(optcode, g_fmChn._curFmInfo.fmId, g_fmChn._curFmInfo.fmType, g_fmChn._curSongInfo.mid, source, 0, g_fmChn._curSongInfo.mruleid);
    },playFm: function(fmInfo) {
        g_fmChn._isPlayNow = true;
        function _playFm() {
            g_fmChn.getFmSongList(fmInfo.fmType, fmInfo.fmId, function(songlist) {
                g_webPlayer.OnSongPlayBegin = function(songinfo, index, total) {
                    g_fmChn.updateCurSong(songinfo);
                    if (g_fmChn._isFirstInit) {
                        g_fmChn.initVol(75);
                        g_fmChn._isFirstInit = false;
                    } else {
                        g_fmChn.initVol(g_webPlayer.getVolumn());
                    }
                    g_fmChn._divSongTime.innerHTML = '';
                    if (g_fmChn.myFavSong.isInSongList(songinfo.mid)) {
                        g_fmChn._btnLike.onclick = g_fmChn.delSong;
                        g_fmChn._btnLike.className = "btn_like_on";
                        g_fmChn._btnLike.title = "取消喜欢";
                    } else {
                        g_fmChn._btnLike.onclick = g_fmChn.likeSong;
                        g_fmChn._btnLike.className = "btn_like";
                        g_fmChn._btnLike.title = "喜欢";
                    }
                    if (index >= total - 1) {
                        g_fmChn._isPlayNow = false;
                        _playFm();
                    }
                    setTimeout(function() {
                        g_fmChn.fm_stat(1);
                    }, 500);
                }
                g_webPlayer.OnSongPlayEnd = function(songinfo, index, total) {
                    if (g_fmChn._statArr[0] != '') {
                        if ((new Date().valueOf()) % 100 == 0) {
                            g_stat2(g_fmChn._statArr);
                        }
                        for (var i = 0; i < g_fmChn._statArrNum; i++) {
                            g_fmChn._statArr[i] = '';
                        }
                    }
                }
                g_webPlayer.OnSongPlaying = g_fmChn.updateSongBar;
                g_webPlayer.OnPlaying = function() {
                    g_fmChn._btnPlay.className = "btn_pause";
                    g_fmChn._btnPlay.innerHTML = "暂停";
                    g_fmChn._btnPlay.title = "暂停";
                    g_fmChn._btnPlay.onclick = g_fmChn.pauseFm;
                }
                g_webPlayer.OnPlayPause = function() {
                    g_fmChn._btnPlay.className = "btn_play";
                    g_fmChn._btnPlay.innerHTML = "播放";
                    g_fmChn._btnPlay.title = "播放";
                    g_fmChn._btnPlay.onclick = g_fmChn.startFm;
                }
                g_webPlayer.setPlayerList(g_fmChn._isPlayNow, songlist);
                g_fmChn._isPlayNow = true;
            });
        }
        _playFm();
        g_fmChn.updateCurFm(fmInfo);
    },startFm: function() {
        g_webPlayer.startPlayer();
    },pauseFm: function() {
        g_webPlayer.pausePlayer();
    },playNext: function() {
        if (!g_fmChn._isPlayNow) {
            g_fmChn._isPlayNow = true;
            return;
        }
        g_fmChn.fm_stat(5);
        g_webPlayer.nextPlayer();
    },likeSong: function() {
        var url = 'http://stream' + g_fmChn._curSongInfo.mstream + '.qqmusic.qq.com/12' + g_fmChn._curSongInfo.mid + '.wma';
        g_fmChn.myFavSong.addToMyFavSongList({id: g_fmChn._curSongInfo.mid,type: 3,songname: g_fmChn._curSongInfo.msong,singername: g_fmChn._curSongInfo.msinger,diskname: g_fmChn._curSongInfo.malbum,url: url,singerid: g_fmChn._curSongInfo.msingerid,diskid: g_fmChn._curSongInfo.malbumid,playtime: g_fmChn._curSongInfo.minterval});
    },delSong: function() {
        g_fmChn.myFavSong.delFromFavSongList(g_fmChn._curSongInfo.mid, 3);
    },disLikeSong: function() {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.callback = (function() {
                return function() {
                    g_fmChn.disLikeSong();
                }
            })();
            g_user.openLogin(null, 'self');
            return false;
        }
        g_fmChn.favSong.disLike(g_fmChn._curSongInfo.mid);
        this.playNext();
        g_fmChn.fm_stat(4);
    },shareMusic: function() {
        g_trackServ.shareMusic(g_fmChn._curSongInfo);
    },showLyricTips: function() {
        g_trackServ.showLyricTips(g_fmChn._curSongInfo.mid);
    },guessYouLike: function(e) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.callback = (function() {
                return function() {
                    window.location.href = 'http://fm.qq.com/#0_100';
                    g_fmChn.setCurChn(0, 100, g_fmChn._chnContainer['#0_100']);
                }
            })();
            g_user.openLogin(null, 'self');
            MUSIC.event.preventDefault(e);
            return false;
        }
        var target = MUSIC.event.getTarget(e);
        this.setCurChn(0, 100, target);
    },setChnAndList: function(fmId, fmType) {
        var node = this._chnContainer['#' + fmId + '_' + fmType];
        this.setCurChnType(this._fmListInfo[fmId + '_' + fmType]);
        this.setCurChn(fmId, fmType, node);
        if (fmType != 100) {
            MUSIC.scrollbar.selectElement(node);
        }
    },setCurChn: function(fmId, fmType, node) {
        this._curChn.className = "";
        this._curChn = node;
        this._curChn.className = "on";
        if (fmId == 0 && fmType == 100) {
            MUSIC.dom.get('share_fm').style.display = 'none';
            MUSIC.dom.get('guess_text').innerHTML = '你正在收听';
        } else {
            MUSIC.dom.get('share_fm').style.display = '';
            MUSIC.dom.get('guess_text').innerHTML = '不知道听什么？试试';
        }
        var fmInfo = {};
        fmInfo.fmType = fmType;
        fmInfo.fmId = fmId;
        fmInfo.fmName = this._fmNameObj[fmId + "_" + fmType];
        this.playFm(fmInfo);
    },setCurChnType: function(listId) {
        if (!listId) {
            listId = 1;
        }
        this._curChnType.className = "";
        this._curChnList.style.display = "none";
        this._curChnType = MUSIC.dom.get("ch_" + listId);
        this._curChnList = MUSIC.dom.get("content_" + listId);
        this._curChnType.className = "on";
        this._curChnList.style.display = "block";
        MUSIC.scrollbar.init({barid: "bar",contid: "content",bar_hover: "slider slider_hover",ulid: this._curChnList});
    },selectFmEvent: function() {
        var $ = MUSIC, $D = $.dom, $E = $.event;
        $D.get('content').onclick = function(e) {
            var target = $E.getTarget(e);
            var hrefparts, _fmId, _fmType;
            if (target.nodeName === 'STRONG' || target.nodeName === 'EM') {
                target = target.parentNode;
            }
            if (target.nodeName === 'SPAN') {
                target = target.parentNode;
            }
            if (target.nodeName !== 'A') {
                return;
            }
            hrefparts = target.href.split('#');
            hrefparts = hrefparts[hrefparts.length - 1].split('_');
            _fmId = hrefparts[0];
            _fmType = hrefparts[1];
            g_fmChn.setCurChn(_fmId, _fmType, target);
            $E.cancelBubble(e);
        };
        $D.get('nav').onclick = function(e) {
            var target = $E.getTarget(e);
            var hrefparts, _fmType;
            if (target.nodeName !== 'A') {
                return;
            }
            hrefparts = target.href.split('#');
            _fmType = hrefparts[hrefparts.length - 1];
            g_fmChn.setCurChnType(_fmType);
            $E.cancelBubble(e);
            $E.preventDefault(e);
        };
    },fm_logout: function() {
        var ha = window.location.href.lastIndexOf("#"), id, type;
        if (ha >= 0) {
            var hrefparts = window.location.href.substring(ha + 1);
            hrefparts = hrefparts.split('_');
            id = hrefparts[0];
            type = hrefparts[1];
        }
        if (id == 0 && type == 100) {
            window.location.href = 'http://fm.qq.com/#118_1';
            g_fmChn.setChnAndList(118, 1);
        }
        var elem = MUSIC.dom.get("divuserinfo");
        if (elem) {
            elem.innerHTML = '<a href="javascript:;" onclick="g_user.openLogin(null, \'self\');" >登录</a>';
        }
        g_fmChn._myFavFm.innerHTML = '我收藏的电台';
        g_fmChn._myFavSong.innerHTML = '我的最爱';
        g_fmChn._btnLike.onclick = g_fmChn.likeSong;
        g_fmChn._btnLike.className = "btn_like";
        g_fmChn._btnLike.title = "喜欢";
    },statArrPush: function() {
        for (var i = 0, len = arguments.length; i < len && i < g_fmChn._statArrNum; i++) {
            if (g_fmChn._statArr[i] != '') {
                g_fmChn._statArr[i] += ',';
            }
            g_fmChn._statArr[i] += arguments[i];
        }
    },firstBuffered: function(startTime, endTime) {
        if (g_fmChn._statArr[0].split(',').length >= 10) {
            return;
        }
        var source = g_fmChn.isQplus ? 1 : (g_fmChn.isPengyou ? 2 : 0);
        g_fmChn.statArrPush(g_fmChn._curFmInfo.fmId, g_fmChn._curFmInfo.fmType, g_fmChn._curSongInfo.mid, 11, source, endTime - startTime, g_fmChn._curSongInfo.mruleid);
    },secondBuffered: function(startTime, endTime) {
        if (g_fmChn._statArr[0].split(',').length >= 10) {
            return;
        }
        var source = g_fmChn.isQplus ? 1 : (g_fmChn.isPengyou ? 2 : 0);
        g_fmChn.statArrPush(g_fmChn._curFmInfo.fmId, g_fmChn._curFmInfo.fmType, g_fmChn._curSongInfo.mid, 12, source, endTime - startTime, g_fmChn._curSongInfo.mruleid);
    }}
MUSIC.channel.fm.favFm = {add: function(fmInfo, callback) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.callback = (function(fmInfo, callback) {
                return function() {
                    g_fmChn.favFm.add(fmInfo, callback);
                }
            })(fmInfo, callback);
            g_user.openLogin(null, 'self');
            return;
        }
        function _error() {
            g_popup.show(1, "收藏电台失败！", "当前网络繁忙，请您稍后重试。", 1000, 300);
        }
        function _succ() {
            g_popup.show(0, "收藏电台成功！", "", 1000, 240);
        }
        function _succ2() {
            g_popup.show(1, "您已经收藏过该电台！", "", 1000, 260);
        }
        var url = "http://radio.cloud.music.qq.com/fcgi-bin/fcg_musicradio_add.fcg?uin=" + uin + "&radioid=" + fmInfo.fmId + "&owneruin=" + uin + "&type=" + fmInfo.fmType + "&out=1&rnd=" + new Date().valueOf(), j = new MUSIC.JSONGetter(url, "favFmadd", null, "gb2312", false);
        j.onSuccess = function(data) {
            if (data.code == 0) {
                _succ();
                if (callback) {
                    callback();
                }
                g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
            } else if (data.code == 6 || data.code == 9) {
                _succ2();
            } else if (data.code == 2) {
                g_user.callback = (function(fmInfo, callback) {
                    return function() {
                        g_fmChn.favFm.add(fmInfo, callback);
                    }
                })(fmInfo, callback);
                g_user.openLogin(null, 'self');
            } else {
                _error();
            }
        };
        j.onError = _error;
        j.send("addMusicRadioCallback");
    },del: function(fmInfo, callback) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.callback = (function(fmInfo, callback) {
                return function() {
                    g_fmChn.favFm.del(fmInfo, callback);
                }
            })(fmInfo, callback);
            g_user.openLogin(null, 'self');
            return;
        }
        function _error() {
            g_popup.show(1, "删除电台失败！", "当前网络繁忙，请您稍后重试。", 1000, 260);
        }
        function _succ() {
            g_popup.show(0, "删除电台成功！", "", 1000, 240);
        }
        var url = "http://radio.cloud.music.qq.com/fcgi-bin/fcg_musicradio_delete.fcg", data = {uin: uin,radioid: fmInfo.fmId,owneruin: uin,type: fmInfo.fmType,out: 2,formsender: 1}, fs = new MUSIC.FormSender(url, "post", data, "GB2312");
        fs.onSuccess = function(o) {
            if (o.code == 0) {
                _succ();
                if (callback) {
                    callback(o);
                }
                g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
            } else if (o.code == 2) {
                g_user.callback = (function(fmInfo, callback) {
                    return function() {
                        g_fmChn.favFm.del(fmInfo, callback);
                    }
                })(fmInfo, callback);
                g_user.openLogin(null, 'self');
            } else {
                _error();
            }
        };
        fs.onError = _error;
        fs.send();
    },getUserFavNum: function(callback) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.openLogin(null, 'self');
            return;
        }
        function _error() {
            g_popup.show(1, "获取我收藏的电台列表信息失败！", "当前网络繁忙，请您稍后重试。", 1000, 350);
        }
        var url = "http://radio.cloud.music.qq.com/fcgi-bin/fcg_musicradiobyuin_getinfo.fcg?uin=" + uin + "&out=1&dirid=201&rnd=" + new Date().valueOf(), j = new MUSIC.JSONGetter(url, "getUserFavNum", null, "gb2312", false);
        j.onSuccess = function(data) {
            if (data.code == 0) {
                if (callback) {
                    callback(data.num, data.song_num);
                }
            } else if (data.code == 2) {
                g_user.openLogin(null, 'self');
            } else {
                _error();
            }
        };
        j.onError = _error;
        j.send("GetMusicRadioInfoByuinCallback");
    },getFmFavNum: function(fmInfo, callback) {
        function _error() {
            g_popup.show(1, "获取电台收藏人数失败！", "当前网络繁忙，请您稍后重试。", 1000, 350);
        }
        var url = "http://radio.cloud.music.qq.com/fcgi-bin/fcg_musicradio_getinfo.fcg?radioid=" + fmInfo.fmId + "&type=" + fmInfo.fmType + "&out=1&rnd=" + new Date().valueOf(), j = new MUSIC.JSONGetter(url, "getFmFavNum", null, "gb2312", false);
        j.onSuccess = function(data) {
            if (data.retcode == 0) {
                callback();
            } else {
                _error();
            }
        };
        j.onError = _error;
        j.send("jsonCallback");
    },getList: function(callback) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.openLogin(null, 'self');
            return;
        }
        function _error() {
            g_popup.show(1, "获取电台收藏列表失败！", "当前网络繁忙，请您稍后重试。", 1000, 350);
        }
        var url = "http://radio.cloud.music.qq.com/fcgi-bin/fcg_musicradiolist_getinfo.fcg?uin=" + uin + "&out=1&rnd=" + new Date().valueOf(), j = new MUSIC.JSONGetter(url, "getList", null, "gb2312", false);
        j.onSuccess = function(data) {
            if (data.code == 0) {
                if (callback) {
                    callback(data);
                }
            } else if (data.code == 2) {
                g_user.openLogin(null, 'self');
            } else {
                _error();
            }
        };
        j.onError = _error;
        j.send("GetMusicRadioListInfoCallback");
    }}
MUSIC.channel.fm.favSong = {add: function(idlist, typelist, callback) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.callback = (function(idlist, typelist, callback) {
                return function() {
                    g_fmChn.favSong.add(idlist, typelist, callback);
                }
            })(idlist, typelist, callback);
            g_user.openLogin(null, 'self');
            return;
        }
        function _error() {
            g_popup.show(1, "操作失败，服务器繁忙，请稍后再试。", "", 1000, 400);
        }
        function _succ() {
            g_popup.show(0, "喜欢成功", "歌曲已添加到您的“我的最爱”列表。", 1000, 350);
        }
        var url = "http://s.plcloud.music.qq.com/fcgi-bin/fcg_music_add2songdir.fcg", data = {uin: uin,dirid: 201,idlist: idlist,source: 104,typelist: typelist,formsender: 1}, fs = new MUSIC.FormSender(url, "post", data, "GB2312");
        fs.onSuccess = function(o) {
            switch (o.code) 
            {
                case 0:
                    g_fmChn._btnLike.className = "btn_like_on";
                    g_fmChn._btnLike.title = "取消喜欢";
                    g_fmChn._btnLike.onclick = g_fmChn.delSong;
                    if (callback) {
                        callback();
                    }
                    g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
                    g_fmChn.fm_stat(2);
                    break;
                case 1:
                    g_user.callback = (function(idlist, typelist, callback) {
                        return function() {
                            g_fmChn.favSong.add(idlist, typelist, callback);
                        }
                    })(idlist, typelist, callback);
                    g_user.openLogin(null, 'self');
                    break;
                case 21:
                    g_popup.show(1, "我的最爱歌曲已经超过最大上限1000首，请清理后再重新标记。", "", 1000, 550);
                    break;
                default:
                    _error();
                    break;
            }
        };
        fs.onError = _error;
        fs.send();
    },del: function(idlist, typelist, callback) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.callback = (function(idlist, typelist, callback) {
                return function() {
                    g_fmChn.favSong.del(idlist, typelist, callback);
                }
            })(idlist, typelist, callback);
            g_user.openLogin(null, 'self');
            return;
        }
        function _error() {
            g_popup.show(1, "操作失败，服务器繁忙，请稍后再试。", "", 1000, 400);
        }
        function _succ() {
            g_popup.show(0, "取消成功", "", 1000, 180);
        }
        var url = "http://qzone-music.qq.com/fcg-bin/fcg_music_delbatchsong.fcg", data = {uin: uin,dirid: 201,ids: idlist,source: 103,types: typelist,formsender: 1,flag: 2,from: 3}, fs = new MUSIC.FormSender(url, "post", data, "GB2312");
        fs.onSuccess = function(o) {
            switch (o.code) 
            {
                case 0:
                    if (idlist == g_fmChn._curSongInfo.mid) {
                        g_fmChn._btnLike.className = "btn_like";
                        g_fmChn._btnLike.title = "喜欢";
                        g_fmChn._btnLike.onclick = g_fmChn.likeSong;
                    }
                    if (callback) {
                        callback();
                    }
                    g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
                    g_fmChn.fm_stat(8);
                    break;
                case 1:
                    g_user.callback = (function(idlist, typelist, callback) {
                        return function() {
                            g_fmChn.favSong.del(idlist, typelist, callback);
                        }
                    })(idlist, typelist, callback);
                    g_user.openLogin(null, 'self');
                    break;
                default:
                    _error();
                    break;
            }
        };
        fs.onError = _error;
        fs.send();
    },getList: function(callback) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.openLogin(null, 'self');
            return;
        }
        function _error() {
            g_popup.show(1, "获取我喜欢的列表信息失败！", "当前网络繁忙，请您稍后重试。", 1000, 350);
        }
        var url = "http://s.plcloud.music.qq.com/fcgi-bin/fcg_musiclist_getinfo.fcg?uin=" + uin + "&dirid=201&dirinfo=1&user=qqmusic&rnd=" + new Date().valueOf(), j = new MUSIC.JSONGetter(url, "favsonglist", null, "gb2312", false);
        j.onSuccess = function(data) {
            if (data.code == 0) {
                if (callback) {
                    callback(data);
                }
            } else if (data.code == 2) {
                g_user.openLogin(null, 'self');
            } else {
                _error();
            }
        };
        j.onError = _error;
        j.send("jsonCallback");
    },disLike: function(id) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.callback = (function(id) {
                return function() {
                    g_fmChn.favSong.disLike(id);
                }
            })(id);
            g_user.openLogin(null, 'self');
            return;
        }
        function _error() {
        }
        var url = "http://portalcgi.music.qq.com/fcgi-bin/radio/cgi_radio_dislike.fcg?songid=" + id + "&rnd=" + new Date().valueOf(), j = new MUSIC.JSONGetter(url, "disLike", null, "gb2312", false);
        j.onSuccess = function(data) {
            if (data.code == 0) {
            } else if (data.code == 1) {
                g_user.callback = (function(id) {
                    return function() {
                        g_fmChn.favSong.disLike(id);
                    }
                })(id);
                g_user.openLogin(null, 'self');
            } else {
                _error();
            }
        };
        j.onError = _error;
        j.send("MusicJsonCallback");
    }}
window.on_login = function() {
    g_fmChn.showUserInfo();
    g_fmChn._callback_counter = 0;
    if (g_fmChn._callback_timer) {
        clearTimeout(g_fmChn._callback_timer);
        g_fmChn._callback_timer = null;
    }
    g_fmChn._callback_timer = setTimeout(checkCallBack, 50);
}
window.checkCallBack = function() {
    if (g_fmChn._callback_counter >= 3) {
        if (g_user.callback) {
            g_user.callback();
            g_user.callback = null;
        }
        g_fmChn._callback_counter = 0;
        if (g_fmChn._callback_timer) {
            clearTimeout(g_fmChn._callback_timer);
            g_fmChn._callback_timer = null;
        }
    } else {
        if (g_fmChn._callback_timer) {
            clearTimeout(g_fmChn._callback_timer);
            g_fmChn._callback_timer = null;
        }
        g_fmChn._callback_timer = setTimeout(checkCallBack, 50);
    }
}
var g_fmChn = MUSIC.channel.fm;
MUSIC.config.DCCookieDomain = "fm.qq.com";
/*  |xGv00|697861e82cb3f464285f9ac6bcdc06ac */