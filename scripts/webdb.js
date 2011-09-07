var WebDB = (function(){
	var db = null;
	
	function initDb() {
		try {
		  if (window.openDatabase) {
			db = openDatabase("qqfm", "1.0", "qqfm database", 200000);
			if (db) {
			  db.transaction(function(tx) {
				tx.executeSql("CREATE TABLE IF NOT EXISTS favsong (id REAL UNIQUE, gososo TEXT, mQzoneKey TEXT, mSongType REAL, malbum TEXT, malbumid REAL, mdownload REAL, mid REAL, minterval REAL, mrate REAL, msinger TEXT, msingerid REAL, msingertype TEXT, msize REAL, msong TEXT, mstream REAL, murl TEXT, size128 REAL, size320 REAL, sizeape REAL, sizeflac REAL, sizeogg REAL)");
			  });
			} else {
			  console.log('error occurred trying to open DB');
			}
		  } else {
			console.log('Web Databases not supported');
		  }
		} catch (e) {
		  console.log('error occurred during DB init, Web Database supported?');
		}
	}
	
	var fieldList = ['mstream','murl','msong','msinger','mQzoneKey','mid','mSongType','msingerid','malbumid','malbum','msize','minterval','mdownload','msingertype','size320','size128','mrate','gososo','sizeape','sizeflac','sizeogg', 'id'];
	
	function favSong(songInfo, callback, errorcallback) {
	
		var res = null;
		
	
		db.transaction(function (tx) {
			var sql = "SELECT count(*) as row_count FROM favsong WHERE id = ?";
			tx.executeSql(sql, [getSongId(songInfo)], function(tx, results){
				if(results.rows && results.rows.length) {
					if(results.rows.item(0).row_count >= 1) {
						if(callback) {
							callback('已经收藏这首歌了');
						}
					}
					else {
						var qa = [];
						for(var i=0, l=fieldList.length; i<l;i++) {
							qa.push('?');
						}
						var sql = "INSERT INTO favsong ("+fieldList.join(',')+") VALUES ("+qa.join(',')+")";
						console.log(sql);
						var va = [];
						for(var i=0, l=fieldList.length; i<l;i++) {
							va.push(songInfo[fieldList[i]]);
						}
						
						//replace id field
						va[va.length-1] = getSongId(songInfo);
						
						tx.executeSql(sql, va, function(tx, results){
							if(callback) {
								callback('收藏成功');
							}
						}, function(tx, err) {
							errorcallback(err.message);
						});
					}
				}
				else {
					if(errorcallback) {
						errorcallback("无法获取查询结果");
					}
				}
			});
		});
	}
	
	function getSongId(songInfo) {
		return songId = parseInt("30"+songInfo.mid);
	}
	
	function getTotalCount(cb, errcb) {
		db.transaction(function (tx) {
			var sql = "SELECT count(*) as row_count FROM favsong";
			tx.executeSql(sql, [], function(tx, results){
				if(cb) {
					var count = results.rows && results.rows.item(0).row_count || 0;
					cb(count);
				}
			}, function(tx, err){
				if(errcb) {
					errcb(err);
				}
			});
		})
	}
	
	function getFavSongList(page, pageLimit, cb, errcb) {
		db.transaction(function (tx) {
			var sql = "SELECT * FROM favsong Limit ?,?";
			var start = (page - 1) * pageLimit;
			tx.executeSql(sql, [start, pageLimit], function(tx, results) {
				if(cb) {
					cb(results);
				}
			}, function(tx, err){
				if(errcb) {
					errcb(err);
				}
			});
		});
	}
	
	return {
		init : initDb,
		favSong : favSong,
		getFavSongList : getFavSongList,
		getTotalCount: getTotalCount
	}
})();