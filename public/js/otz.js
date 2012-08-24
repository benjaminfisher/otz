var socket = io.connect(location); // Use "peterwooley.com:4242" to play on the live server
var world;

socket.on('game-enter', function(data) {
  world = data;
  renderMap(world.map);
  renderPlayers(world.others);
  renderPlayer(world.player, true);
});

socket.on('player-moved', function(data) {
  var you = false;
  if(data.player.id === world.player.id) {
    world.player.location = data.player.location;
    world.player.dir = data.player.dir;
    you = true;
  }
  renderPlayer(data.player, you);
});

socket.on('bullet-moved', function(data) {
  renderBullet(data.bullet);
});
socket.on('bullet-destroyed', function(data) {
  removeBullet(data.bullet);
});

socket.on('player-killed', function(data) {
  killPlayer(data.player, data.killer);
  console.log(data.player.nick + " has bit the big one.");
  toast(data.player.nick + " has snuffed it!");
});

socket.on('player-joined', function(data){
	toast(data.player.nick + " has entered ThunderDome!");
});

/* Movement methods */
jwerty.key('w', function(){
	$($('div.you')[0]).removeClass('left down right').addClass('up');
	  socket.emit('player-move', { dir: "up" });
});

jwerty.key('a', function(){
	$($('div.you')[0]).removeClass('up down right').addClass('left');
	  socket.emit('player-move', { dir: "left" });
});

jwerty.key('s', function(){
	$($('div.you')[0]).removeClass('up left right').addClass('down');
	  socket.emit('player-move', { dir: "down" });
});

jwerty.key('d', function(){
	$($('div.you')[0]).removeClass('up down left').addClass('right');
	  socket.emit('player-move', { dir: "right" });
});

/* Shooting Methods */
jwerty.key('space', function(){
	  socket.emit('player-shoot');
});

/* Turn Methods */
jwerty.key('j', function(){
	$($('div.you')[0])
		.removeClass('up down left right')
		.addClass('left');
	socket.emit('player-turn', { dir: "left" })
});

jwerty.key('i', function(){
	$($('div.you')[0])
		.removeClass('up down left right')
		.addClass('up');
	socket.emit('player-turn', { dir: "up" })
});

jwerty.key('k', function(){
	$($('div.you')[0])
		.removeClass('up down left right')
		.addClass('down');
	socket.emit('player-turn', { dir: "down" })
});

jwerty.key('l', function(){
	$($('div.you')[0])
		.removeClass('up down left right')
		.addClass('right');
	socket.emit('player-turn', { dir: "right" })
});


/* Helper Methods */

var renderMap= function(map) {
  $world = $(".world");
  $world.empty();
  for(var i = 0; i < map.length; i++) {
    $row = $("<div>").addClass("row");
    $world.append($row);
    for(var j = 0; j < map[i].length; j++) {
      var $cell = $("<div>").addClass('cell');
      $row.append($cell.addClass(map[i][j].material));
    }
  }
};

var renderPlayer = function(player, you) {
  var move = true;
  var $el = $("#"+player.id);
  if(!$el.length) {
    $el = $("<div>").attr('id', player.id).addClass('player').hide().appendTo('.world');
    if(you) $el.addClass('you');
    move = false;
  }
  var offset = $(".row:eq("+player.location.y+") .cell:eq("+player.location.x+")").position();
  if(move) {
	  
	// turn other players
	if(!you) $el.removeClass('up down left right');
    $el.animate(offset, 500/player.speed, "linear");
    
    if(!you) $el.addClass(player.dir);
  } else {
    $el.css(offset).fadeIn();
  }
};

var renderPlayers = function(players) {
  for(var i = 0; i < players.length; i++) {
    renderPlayer(players[i]);
  }
};

var killPlayer = function(player, killer) {
  var $el = $("#"+player.id);
  $el.fadeOut(500, function() { $(this).remove() });
};

var removePlayer = function(player) {
  $("#"+player.id).remove();
};

var renderBullet = function(bullet) {
  var move = true;
  var $el = $("#"+bullet.id);
  if(!$el.length) {
    $el = $("<div>").attr('id', bullet.id).addClass('bullet').hide().appendTo('.world');
    move = false;
  }
  var offset = $(".row:eq("+bullet.location.y+") .cell:eq("+bullet.location.x+")").position();
  if(move) {
    $el.animate(offset, 100, "linear");
  } else {
    $el.css(offset).show();
  }
};

var removeBullet = function(bullet) {
  $("#"+bullet.id).remove();
}

var toast = function(message) { $().toastmessage('showNoticeToast', message); };
