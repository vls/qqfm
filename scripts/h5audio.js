 /*
 * QMFL
 * Copyright(c) 2011, Music WebDev Group.
 */


MUSIC.module.webPlayer.h5Audio = function(fromTag) {
    var $T = top, $ = MUSIC, $D = $.dom, $E = $.event;
    var mPlayerState = g_playerStatus.S_UNDEFINE;
    var mPlayerName = "";
    var mUinCookie = 12345678;
    var mKeyCookie = "12345678";
    var mFromTag = fromTag;
    var mIsInit = false;
    var mSetedCookie = false;
    var mClientPlatform = false;
    var isiPadLoad = 0;
    var checkPlayerTimer = null;
    var mBufferedStart = 0;
    var mBufferedEnd = 0;
    var mBufferedRecord = false;
    var mBufferedFirst = true;
    var mCurrentTime = 0;
    function firstBuffered(startTime, endTime) {
        if (!!g_fmChn && !!g_fmChn.firstBuffered) {
            g_fmChn.firstBuffered(startTime, endTime);
        }
    }
    function secondBuffered(startTime, endTime) {
        if (!!g_fmChn && !!g_fmChn.secondBuffered) {
            g_fmChn.secondBuffered(startTime, endTime);
        }
    }
    function clearCheckPlayer() {
        if (checkPlayerTimer) {
            clearTimeout(checkPlayerTimer);
            checkPlayerTimer = null;
        }
    }
    function loopCheckPlayer() {
        clearCheckPlayer();
        checkPlayerTimer = setTimeout(function() {
            if (parseInt(mPlayerName.currentTime) != 0 && mPlayerName.currentTime == mCurrentTime && !mPlayerName.paused && !mBufferedRecord && !mBufferedFirst) {
                mBufferedStart = new Date();
                mBufferedRecord = true;
            }
            mCurrentTime = mPlayerName.currentTime;
            loopCheckPlayer();
        }, 500);
    }
    function checkClientPlatform() {
        var pl = navigator.platform.toLowerCase();
        var ipad = pl.match(/ipad/);
        if (ipad) {
            mClientPlatform = "ipad";
            return true;
        }
        var iphone = pl.match(/iphone/);
        if (iphone) {
            mClientPlatform = "iphone";
            return true;
        }
        var ipod = pl.match(/ipod/);
        if (ipod) {
            mClientPlatform = "ipod";
            return true;
        }
        var win = pl.match(/win/);
        if (win) {
            mClientPlatform = "win";
            return false;
        } 
        else 
        {
            mClientPlatform = "not win";
            return true;
        }
        return false;
    }
    function insertH5AudioPlayer(objAttrs) {
        var html = [];
        html.push("<audio ")
        for (var key in objAttrs) {
            html.push(key);
            html.push("='");
            html.push(objAttrs[key]);
            html.push("' ");
        }
        html.push("></audio>");
        var playerDiv = $D.createElementIn("div", "h5audio_media_con");
        playerDiv.innerHTML = html.join("");
        return playerDiv.firstChild;
    }
    function createPlayer() {
        return insertH5AudioPlayer({id: 'h5audio_media',height: 0,width: 0,autoplay: 'false'});
    }
    function createActiveX() {
        mPlayerName = createPlayer();
        if (!mPlayerName) {
            return false;
        }
    }
    function initialize() {
        if (!mPlayerName) {
            return false;
        }
        $E.addEvent(mPlayerName, "loadstart", function() {
            g_playerCallback.OnStateChanged(g_playerStatus.S_BUFFERING);
            if ((!!ua.isiPad || !!ua.isiPhone) && isiPadLoad < 1) {
                isiPadLoad++;
                g_playerCallback.OnStateChanged(g_playerStatus.S_PAUSE);
            }
        });
        $E.addEvent(mPlayerName, "play", function() {
            g_playerCallback.OnStateChanged(g_playerStatus.S_PLAYBEGIN);
            mSetedCookie = true;
        });
        $E.addEvent(mPlayerName, "playing", function() {
            g_playerCallback.OnStateChanged(g_playerStatus.S_PLAYING);
            loopCheckPlayer();
        });
        $E.addEvent(mPlayerName, "pause", function() {
            g_playerCallback.OnStateChanged(g_playerStatus.S_PAUSE);
            clearCheckPlayer();
        });
        $E.addEvent(mPlayerName, "stalled", function() {
            g_playerCallback.OnStateChanged(g_playerStatus.S_STOP);
        });
        $E.addEvent(mPlayerName, "error", function() {
            g_playerCallback.OnStateChanged(g_playerStatus.S_STOP);
            if ((!!ua.isiPad || !!ua.isiPhone) && mPlayerName.error.code == 4) {
                mSetedCookie = true;
                g_playerCallback.OnStateChanged(g_playerStatus.S_BUFFERING);
                isiPadLoad = 0;
            }
        });
        $E.addEvent(mPlayerName, "ended", function() {
            g_playerCallback.OnStateChanged(g_playerStatus.S_PLAYEND);
            clearCheckPlayer();
        });
        $E.addEvent(mPlayerName, "timeupdate", function() {
            g_playerCallback.OnPlayProgress(mPlayerName.currentTime, mPlayerName.duration);
            if (mBufferedRecord) {
                mBufferedEnd = new Date();
                if (mBufferedFirst) {
                    mBufferedFirst = false;
                    firstBuffered(mBufferedStart, mBufferedEnd);
                } else {
                    secondBuffered(mBufferedStart, mBufferedEnd);
                }
                mBufferedRecord = false;
            }
        });
        $E.addEvent(mPlayerName, "loadedmetadata", function() {
            if (!!ua.safari && !(!!ua.isiPad || !!ua.isiPhone)) {
                mPlayerName.currentTime = 1;
                mPlayerName.play();
            }
        });
        $E.addEvent(mPlayerName, "loadeddata", function() {
        });
        $E.addEvent(mPlayerName, "canplay", function() {
        });
        mIsInit = true;
        try {
            setVolumn(75);
        } catch (e) {
            alert("setVolumn:" + e.message);
        }
        ;
        return true;
    }
    function setPlayURL() {
        if (getCookie("qqmusic_uin") == "" || getCookie("qqmusic_key") == "" || getCookie("qqmusic_fromtag") == "") {
            setCookie("qqmusic_uin", mUinCookie, "qq.com");
            setCookie("qqmusic_key", mKeyCookie, "qq.com");
            setCookie("qqmusic_fromtag", mFromTag, "qq.com");
            mSetedCookie = false;
            mPlayerName.setAttribute("src", "http://qzone-music.qq.com/fcg-bin/fcg_set_musiccookie.fcg?fromtag=" + mFromTag + "&p=" + Math.random());
            mPlayerName.load();
            mPlayerName.play();
        } else {
            mSetedCookie = true;
        }
        if (mSetedCookie) {
            alert('setPlayURL havecookie');
            var _obj = g_webPlayer.getSongInfoObj();
            var sid = parseInt(_obj.mid) + 30000000;
            var playUrl = g_webPlayer.mp3url_tpl.jstpl_format({stream: parseInt(_obj.mstream) + 10,sid: sid});
            if (mPlayerName.src != playUrl) {
                alert('setPlayURL e1');
                for(var i in mPlayerName) { var o = mPlayerName[i]; if(typeof o != "function") { _log(i, mPlayerName[i]); }}
                mPlayerName.setAttribute("src", playUrl);
                alert('setPlayURL set src complete');
                mPlayerName.load();
                alert('setPlayURL load complete');
            } else {
                alert('setPlayURL e2');
                stopPlayer();
            }
            alert('setPlayURL to startPlayer');
            startPlayer();
            mBufferedStart = new Date();
            mBufferedFirst = true;
            mBufferedRecord = true;
        } else {
            alert('setPlayURL nocookie');
            setTimeout(setPlayURL, 100);
        }
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
        return (mPlayerState == g_playerStatus.S_PAUSE || mPlayerName.paused);
    }
    function isStop() {
        if (!mIsInit) {
            return false;
        }
        return ((mPlayerState == g_playerStatus.S_STOP) || (mPlayerState == g_playerStatus.S_PLAYEND) || mPlayerName.ended);
    }
    function startPlayer() {
        alert('startPlayer');
        if (!mIsInit) {
            return false;
        }
        if (isPlaying()) {
            alert('startPlayer playing');
            return false;
        }
        try 
        {
            alert('startPlayer to play');
            mPlayerName.play();
            return true;
        } 
        catch (e) 
        {
            if (debugMode) {
                alert("e 11 " + e.message);
            }
        }
        alert('startPlayer end');
        return false;
    }
    function stopPlayer() {
        alert('stopPlayer');
        if (!mIsInit) {
            return false;
        }
        if ((!isPlaying()) && (!isPause())) {
            alert('stopPlayer e1');
            return false;
        }
        try 
        {
            alert('stopPlayer pause');
            mPlayerName.pause();
            mPlayerName.currentTime = 0;
            return true;
        } 
        catch (e) 
        {
            if (debugMode) {
                alert("e 12 " + e.message);
            }
        }
        alert('stopPlayer end');
        return false;
    }
    function pausePlayer() {
        if (!mIsInit) {
            return false;
        }
        if (!isPlaying()) {
            return false;
        }
        try {
            mPlayerName.pause();
        } catch (e) {
            if (debugMode) {
                status = ("e 4 " + e.message);
            }
        }
        return true;
    }
    function setMute() {
        if (!mIsInit) {
            return false;
        }
        var bSet = (mPlayerName.muted == 1 ? 0 : 1);
        mPlayerName.muted = bSet;
        return bSet;
    }
    function getVolumn() {
        if (!mIsInit) {
            return 0;
        }
        return mPlayerName.volume * 100;
    }
    function setVolumn(vol) {
        if (!mIsInit) {
            return false;
        }
        if (mPlayerName.muted) {
            return false;
        }
        if (vol > 100) {
            vol = 100;
        }
        if (vol < 0) {
            vol = 0;
        }
        if (vol >= 0 && vol <= 100) {
            mPlayerName.volume = vol / 100;
        }
        return true;
    }
    function setPlayerState(status) {
        mPlayerState = status;
    }
    return {createActiveX: createActiveX,initialize: initialize,setPlayURL: setPlayURL,startPlayer: startPlayer,stopPlayer: stopPlayer,pausePlayer: pausePlayer,setMute: setMute,getVolumn: getVolumn,setVolumn: setVolumn,setPlayerState: setPlayerState};
};
/*  |xGv00|1386e72cb8d732130fa8385f467872d9 */
