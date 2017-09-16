/* Engine.js
* 这个文件提供了游戏循环玩耍的功能（更新敌人和渲染）
 * 在屏幕上画出初始的游戏面板，然后调用玩家和敌人对象的 update / render 函数（在 app.js 中定义的）
 *
 * 一个游戏引擎的工作过程就是不停的绘制整个游戏屏幕，和小时候你们做的 flipbook 有点像。当
 * 玩家在屏幕上移动的时候，看上去就是图片在移动或者被重绘。但这都是表面现象。实际上是整个屏幕
 * 被重绘导致这样的动画产生的假象

 * 这个引擎是可以通过 Engine 变量公开访问的，而且它也让 canvas context (ctx) 对象也可以
 * 公开访问，以此使编写app.js的时候更加容易
 */

var Engine = (function(global) {
    /* 实现定义我们会在这个作用于用到的变量
     * 创建 canvas 元素，拿到对应的 2D 上下文
     * 设置 canvas 元素的高/宽 然后添加到dom中
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* 这个函数是整个游戏的主入口，负责适当的调用 update / render 函数 */
    function main () {
        /* 如果你想要更平滑的动画过度就需要获取时间间隙。因为每个人的电脑处理指令的
         * 速度是不一样的，我们需要一个对每个人都一样的常数（而不管他们的电脑有多快）
         * 就问你屌不屌！
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* 调用我们的 update / render 函数， 传递事件间隙给 update 函数因为这样
         * 可以使动画更加顺畅。
         */
        update(dt);
        render();

        /* 设置我们的 lastTime 变量，它会被用来决定 main 函数下次被调用的事件。 */
        lastTime = now;

        /* 在浏览准备好调用重绘下一个帧的时候，用浏览器的 requestAnimationFrame 函数
         * 来调用这个函数
         */
        if(global.win) {
          gameWin();
          return;
        }
        if(global.collapse) { 
          gameOver(); 
          return 
        }
        else win.requestAnimationFrame(main);
    }

    function init() {
        renderBackground();
        choosePlayer();     
    }

    //背景
    function renderBackground() {

        ctx.clearRect(0,0,canvas.width,canvas.height);
        var rowImages = [
                'images/water-block.png',   // 这一行是河。
                'images/stone-block.png',   // 第一行石头
                'images/stone-block.png',   // 第二行石头
                'images/stone-block.png',   // 第三行石头
                'images/grass-block.png',   // 第一行草地
                'images/grass-block.png'    // 第二行草地
            ],
        numRows = 6,
        numCols = 5,
        row, col;

        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

    }

    //选择人物
    function choosePlayer() {

        //start按钮
        var start = document.createElement('div');
        start.id = 'start';
        start.innerHTML = 'START!';
        doc.body.appendChild(start);


        start.addEventListener('click',function() {
          //删除start按钮
          this.parentNode.removeChild(this);

          var div = document.createElement('div');
          div.id = 'choose-div';
          div.innerHTML = '<P>请选择人物：</p><img src="images/char-boy.png" /><img src="images/char-cat-girl.png" />'
                      + '<img src="images/char-horn-girl.png" /><img src="images/char-princess-girl.png" />';
          doc.body.appendChild(div);

          var players = document.querySelectorAll('#choose-div img');
        
        //给每个图片添加点击事件
          players.forEach(function(el) {
              el.addEventListener('click',function() {
                
                //显示用户选中的人物,创建Player对象
                var src = this.src;
                Resources.load(src, [function(src) {             
                  div.parentNode.removeChild(div);

                  ctx.drawImage(Resources.get(src),200,400);
                  counter(gameStart.bind(null,src));
                }]);
              });
          });
        });
    }

    //倒计时
    function counter(callback) {
        var newNode = document.createElement('div');
        newNode.setAttribute('class','info-wrap');
        newNode.innerHTML = '<div>3</div>';
        doc.body.appendChild(newNode);

        var timeDiv = newNode.childNodes[0];
            con = ['2','1','GO!'],
            i = 0;

        var timer = setInterval(function() {
            if(i === con.length) { 
                clearInterval(timer); 
                newNode.parentNode.removeChild(newNode);
                //倒计时结束，调用回调函数
                callback();
                return;
            }
            timeDiv.innerHTML = con[i++];
        },1000);
    }

    //游戏开始
    function gameStart(src) {
        global.collapse = false;
        global.player = new Player(src);
        global.allEnemies = [];
        //有间隔地生成敌人
        for(let i=0;i<10;i++) {
            (function(i){
                setTimeout(function(){
                    global.allEnemies.push(new Enemy());
                },i*800);
            })(i);
        }

        lastTime = Date.now();
        main();
    }

    /* 这个函数被 main 函数（我们的游戏主循环）调用，它本身调用所有的需要更新游戏角色
     * 数据的函数，取决于你怎样实现碰撞检测（意思是如何检测两个角色占据了同一个位置，
     * 比如你的角色死的时候），你可能需要在这里调用一个额外的函数。现在我们已经把这里
     * 注释了，你可以在这里实现，也可以在 app.js 对应的角色类里面实现。
     */
    function update(dt) {
        updateEntities(dt);
        global.win = checkIfWin();
        global.collapse = checkCollisions();
    }

    /* 这个函数会遍历在 app.js 定义的存放所有敌人实例的数组，并且调用他们的 update()
     * 函数，然后，它会调用玩家对象的 update 方法，最后这个函数被 update 函数调用。
     * 这些更新函数应该只聚焦于更新和对象相关的数据/属性。把重绘的工作交给 render 函数。
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update(dt);
    }

    /* 这个函数做了一些游戏的初始渲染，然后调用 renderEntities 函数。记住，这个函数
     * 在每个游戏的时间间隙都会被调用一次（或者说游戏引擎的每个循环），因为这就是游戏
     * 怎么工作的，他们就像是那种每一页上都画着不同画儿的书，快速翻动的时候就会出现是
     * 动画的幻觉，但是实际上，他们只是不停的在重绘整个屏幕。
     */
    //重绘背景和人
    function render() {
        renderBackground();
        renderEntities();
    }

    /* 这个函数会在每个时间间隙被 render 函数调用。他的目的是分别调用你在 enemy 和 player
     * 对象中定义的 render 方法。
     */
    function renderEntities() {
        /* 遍历在 allEnemies 数组中存放的作于对象然后调用你事先定义的 render 函数 */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* 这个函数现在没干任何事，但是这会是一个好地方让你来处理游戏重置的逻辑。可能是一个
     * 从新开始游戏的按钮，也可以是一个游戏结束的画面，或者其它类似的设计。它只会被 init()
     * 函数调用一次。
     */
    function reset() {
        global.player = null;
        global.allEnemies = [];    
    }

    function gameOver() {
        //game over几个字
        var newNode = document.createElement('div');
        newNode.setAttribute('class','info-wrap');
        newNode.innerHTML = '<div style="font-size: 70px;">Game Over!</div>';
        doc.body.appendChild(newNode); 

        //1秒后弹出对话框
        setTimeout(function(){
          Pop.dialog({
              title: 'Game Over',
              content: '你已经输了，是否重新开始？',
              conVal: '是',
              canVal: '否',
              conCallback: function() {
                  var url = player.sprite;
                  newNode.parentNode.removeChild(newNode);
                  reset();
                  counter(gameStart.bind(null,url));           
              },
              canCallback: function() {
                  var url = player.sprite;
                  newNode.parentNode.removeChild(newNode);              
                  reset();
                  init();            
              },
            });
        },1000);
    }

    function gameWin() {
       var newNode = document.createElement('div');
        newNode.setAttribute('class','info-wrap');
        newNode.innerHTML = '<div style="font-size: 70px;">You Win!</div>';
        doc.body.appendChild(newNode);  

        //1秒后弹出对话框
        setTimeout(function(){
          Pop.dialog({
              title: 'You Win',
              content: '恭喜你，胜利了！',
              conVal: '再玩一次',
              canVal: '不玩了',
              conCallback: function() {
                  var url = player.sprite;
                  newNode.parentNode.removeChild(newNode);
                  reset();
                  counter(gameStart.bind(null,url));           
              },
              canCallback: function() {
                  var url = player.sprite;
                  newNode.parentNode.removeChild(newNode);              
                  reset();
                  init();            
              },
            });
        },1000);             
    }

    /* 把 canvas 上下文对象绑定在 global 全局变量上（在浏览器运行的时候就是 window
     * 对象。从而开发者就可以在他们的app.js文件里面更容易的使用它。
     */
    global.ctx = ctx;

    /* 紧接着我们来加载我们知道的需要来绘制我们游戏关卡的图片。然后把 init 方法设置为回调函数。
     * 那么当这些图片都已经加载完毕的时候游戏就会开始。
     */
    Resources.load([
        'images/water-block.png',   // 河。
        'images/stone-block.png',   // 石头
        'images/grass-block.png',   // 草地
        'images/enemy-bug.png',  //敌人
    ],[init]);
})(this); //这里this就是window
