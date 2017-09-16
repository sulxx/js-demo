// 这是我们的玩家要躲避的敌人 
var Enemy = function() {
    this.x = 0;
    this.y = Math.random() * 2 * 100 + 30; // 
    this.v = Math.random() * 100 + 150; //100~200
    this.appear = true;

    // 敌人的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = 'images/enemy-bug.png';
};

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function(dt) {
    if(!this.appear) return;

    this.x += this.v * dt;
    if(this.x > 500) { 
        this.appear = false;
        let i = Math.random() * 90 + 30,
            _this = this;
        setTimeout(function() {
            _this.x = 0;
            _this.y = Math.random() * 2 * 90 + 43;
            _this.appear = true;
        },i*100);
    }
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
};

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.info = function() {
    console.log(Resources.get(this.sprite).width+' '+Resources.get(this.sprite).height);
};


// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数,render() 函数和一个 handleInput()函数
var Player = function(url) {
    this.x = 200;
    this.y = 400;
    this.v = 800;
    this.direction = 'stay';
    this.sprite = url;

    var _this = this;
    document.addEventListener('keydown', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        _this.handleInput(allowedKeys[e.keyCode]);
    });
}

Player.prototype.update = function(dt) {
    var _this = this;
    
    var move = {
      'left' : function() {
        _this.x -= _this.v * dt; 
        _this.direction = 'stay';
        },
      'right': function() {_this.x += _this.v * dt; _this.direction = 'stay';},
      'up'   : function() {_this.y -= _this.v * dt; _this.direction = 'stay';},
      'down' : function() {_this.y += _this.v * dt; _this.direction = 'stay';},
      'stay' : function() {},
      'undefined': function() {_this.direction = 'stay';}
    };

    move[this.direction]();

    console.log(this.x + "," + this.y);
}

Player.prototype.handleInput = function(direction) {
    this.direction = direction;   
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//碰撞检测
function checkCollisions() {
    var collapse = false,
        x = player.x,
        y = player.y;
        enemyWidth = 60, //图片本身带了透明边，图片的大小比敌人/玩家真正大小要大
        enemyHeight = 57,
        playerWidth = 60, 
        playerHeight = 67;

    allEnemies.forEach(function(enemy) {
        if(x > enemy.x && x < enemy.x + enemyWidth
        && y > enemy.y && y < enemy.y + enemyHeight) //94和62本来应该是敌人的宽和高，但由于原图的宽高是包括了透明部分，实际敌人部分的宽高是94和62
            { collapse = true;}
        else if(x > enemy.x && x < enemy.x + enemyWidth
             && y + playerHeight > enemy.y && y + playerHeight < enemy.y + enemyHeight)
             { collapse = true;}
    });
    return collapse;
}

//是否赢检测
function checkIfWin() {
    var win = false;
        x = player.x,
        y = player.y,
        playerWidth = 60,
        playerHeight = 67;

    if(y < 0)
        win = true;

    return win;
}

// 现在实例化你的所有对象
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
// 把玩家对象放进一个叫 player 的变量里面


// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。

