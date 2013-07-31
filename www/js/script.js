//System objects
var canvas, ctx;
//Game settings
var allowHideKeyboard = 1;
var screen_width = 480;//default:384
var screen_height = 300;//default:216
var statusbarheight = 22;
var linewidth = 20;
var FPS = 30;
var interval = parseInt( 1000/FPS, 10);//Calculated FPS value
//color scheme
bgcolor = "black";
fgcolor = "blue";
fg2color = "red";
linecolor = "lightblue";
var fontsize = 20;
var colorscheme = 0;
//virtual controller trigger angle settings
/*defaults:
 var vca1=22.5;
 var vca2=67.5;
 var vca3=112.5;
 var vca4=157.5;
 var vca5=202.5;
 var vca6=247.5;
 var vca7=292.5;
 var vca8=337.5;*/
var vca1 = 15;
var vca2 = 75;
var vca3 = 105;
var vca4 = 165;
var vca5 = 195;
var vca6 = 255;
var vca7 = 285;
var vca8 = 345;
var vcaToggleLength = 15; //Minimum length that toggles a gesture
var vcaNextGestureLength = 20; //Minimum length that toggles a new gesture

//Variables during game
var disableCollision = 0;
var exit = 0;
var handle;//timer handler
var highscore = 0;
var globalhighscore = window.localStorage.getItem("highscore");
if (globalhighscore === undefined){globalhighscore = 0;}
var gamestatus = 0;//0=before 1=start 2=over 3=paused
var score = 0;

//vmouse events
var ismousedown = 0;
var downX;
var downY;
var mouse=[0,0];//left-1/right1;up-1/down1

//Game objects
var player;
var target;
var lines = [];
var linecount = 0;
var linespeed = 2;

//Object definition
function OPlayer() {
    this.x = screen_width / 2;
    this.y = screen_height / 2;
    this.size = 5;
    this.speed = 2;
}
function OTarget() {
    this.x = screen_width / 2;
    this.y = screen_height / 4;
    this.size = 10;
}
function OLine(left, top, orientation, direction) {
    this.x = left;
    this.y = top;
    this.o = orientation;
    this.d = direction;
}
//Basic math function
function random(under, over) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * under + 1, 10);
        case 2:
            return parseInt(Math.random() * (over - under + 1) + under, 10);
        default:
            return 0;
    }
}

//Draw objects
function drawLine(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function drawCircle(x, y, size, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
}
function drawStatusBar(score, textcolor, linecolor) {
    ctx.strokeStyle = linecolor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, statusbarheight);
    ctx.lineTo(screen_width, statusbarheight);
    ctx.stroke();
    ctx.fillStyle = textcolor;
    ctx.font = fontsize + "px serif";
    ctx.fillText("Score: " + score, 2, fontsize - 5);
}

//Draw welcome message
function draw_home() {
//Background
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, screen_width, screen_height);

//Text
    ctx.fillStyle = fg2color;
    ctx.font = fontsize + "px serif";
    ctx.fillText("Aspirin Port by James Swineson", 1, fontsize + 1);
    ctx.fillText("Hold your phone in landscape mode to start game", 1, fontsize + 20);
    ctx.fillText("and turn back to pause.", 1, fontsize + 40);
    //ctx.fillText("OPTN to change color scheme", 1, fontsize + 40);
    //ctx.fillText("EXE to start game", 1, fontsize + 60);

//Player
    ctx.strokeStyle = fgcolor;
    ctx.beginPath();
    ctx.arc(50, 100, 5, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();

//Target
    ctx.strokeStyle = fg2color;
    ctx.beginPath();
    ctx.arc(170, 150, 10, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();

//Line
    ctx.strokeStyle = linecolor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1, 120);
    ctx.lineTo(20, 120);
    ctx.stroke();
}

//select color scheme
function select_color() {
    colorscheme = colorscheme + 1;
    if (colorscheme === 5) {
        colorscheme = 0;
    }
    if (colorscheme === 0) {
        bgcolor = "black";
        fgcolor = "blue";
        fg2color = "red";
        linecolor = "lightblue";
    }
    if (colorscheme === 1) {
        bgcolor = "black";
        fgcolor = "hotpink";
        fg2color = "violet";
        linecolor = "magenta";
    }
    if (colorscheme === 2) {
        bgcolor = "black";
        fgcolor = "limegreen";
        fg2color = "blue";
        linecolor = "lightblue";
    }
    if (colorscheme === 3) {
        bgcolor = "white";
        fgcolor = "black";
        fg2color = "red";
        linecolor = "blue";
    }
    if (colorscheme === 4) {
        bgcolor = "purple";
        fgcolor = "hotpink";
        fg2color = "white";
        linecolor = "magenta";
    }
    draw_home();
}
//Button show/hide animation
function hidebutton(){
    if (allowHideKeyboard){
    $( "#keyboard" ).hide();
    }
}
function showbutton(){
    if (allowHideKeyboard){
    $( "#keyboard" ).show();
    }
}
function hidebutton2(){
    if (allowHideKeyboard){
        $( "#keyboard2" ).hide();
    }
}
function showbutton2(){
    if (allowHideKeyboard){
        $( "#keyboard2" ).show();
    }
}
//Process Button event
function optn() {
    //if (gamestatus === 0) {
        select_color();
    //}
}
function exe() {
    if (gamestatus === 2) {
        gamestatus = 1;
        gameloop();
        hidebutton2();
    }
    if (gamestatus === 0) {
        gameloop();
        hidebutton2();
    }
}
//Document loaded
function load() {
    canvas = document.getElementById("cv");
    ctx = canvas.getContext("2d");
    draw_home();
}

//Game over
function resetGame() {
    exit = 0;
    if (score > highscore) {
        highscore = score;
    }
    if (score > globalhighscore){
        globalhighscore = score;
        window.localStorage.setItem("highscore", score);
    }
    lines=[];
    linecount = 0;
//Background
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, screen_width, screen_height);

//Text
    ctx.fillStyle = fg2color;
    ctx.font = fontsize + "px serif";
    ctx.fillText("GAME OVER", 1, fontsize);
    ctx.fillText("SCORE:" + score, 1, fontsize + 20);
    ctx.fillText("SESSION HIGH SCORE:" + highscore, 1, fontsize + 40);
    ctx.fillText("ALL-TIME HIGH SCORE: " + globalhighscore, 1, fontsize + 60);
    //ctx.fillText("F1: Play Again", 1, fontsize + 80);
    //ctx.fillText("F6: Exit", 1, fontsize + 100);

    score = 0;
    mouse=[0,0];
    showbutton2();
}

function refresh() {
    if (exit === 1) {
        clearInterval(handle);
        gamestatus = 2;
        //showbutton();
        resetGame();
        return;
    }
    
//Draw background
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, screen_width, screen_height);
    //drawStatusBar(score, fg2color, fgcolor);
//Process gesture and movement
    if (mouse[0]===-1 && player.x>0) {
        player.x=player.x-player.speed;
    }
    else if (mouse[0]===1 && player.x<screen_width) {
            player.x=player.x+player.speed;
        }

    if (mouse[1]===-1 && player.y>statusbarheight) {
        player.y=player.y-player.speed;
    }
    else if (mouse[1]===1 && player.y<screen_height) {
            player.y=player.y+player.speed;
        }

//Calculations
//Check collision with target
    if (player.x - player.size < target.x + target.size && player.x + player.size > target.x - target.size && player.y - player.size < target.y + target.size && player.y + player.size > target.y - target.size) {
        target.x = random(statusbarheight, screen_width);
        target.y = random(statusbarheight, screen_height);
        score = score + 100;

//Create lines
        if (player.y > screen_height / 2) {
            lines[linecount] = new OLine(random(0, screen_width / 2), random(statusbarheight + 1, screen_height / 2 - player.size), 1, 0);
        } else {
            lines[linecount] = new OLine(random(0, screen_width / 2), random(screen_height / 2 + player.size, screen_height), 1, 0);
        }
        linecount = linecount + 1;

        if (player.x > screen_width / 2) {
            lines[linecount] = new OLine(random(0, screen_width / 2 - player.size), random(statusbarheight + 1, screen_height / 2 - player.size), 1, 1);
        } else {
            lines[linecount] = new OLine(random(screen_width / 2 + player.size, screen_width), random(statusbarheight + 1, screen_height / 2 - player.size), 1, 1);
        }
        linecount = linecount + 1;

//Acceleration
        if (player.speed < 6) {
            linespeed = Math.floor(linecount / 20 + 2);
            player.speed = Math.floor(linecount / 20 + 2);
        }
    }
    //lines
    for (var i = 1; i < linecount; i++) {
        //if horizontal
        if (lines[i].d === 0) {
            //reverse direction if hit edge
            if (lines[i].x > screen_width - linewidth || lines[i].x < 0) {
                lines[i].o = lines[i].o * -1;
            }
            //check collisions
            if(disableCollision===0){
            if (lines[i].x + linewidth > player.x - player.size && lines[i].x < player.x + player.size && lines[i].y > player.y - player.size && lines[i].y < player.y + player.size) {
                exit = 1;
            }
            }
            //move it along
            lines[i].x = lines[i].x + linespeed * lines[i].o;
            //draw it
            drawLine(lines[i].x, lines[i].y, lines[i].x + linewidth, lines[i].y, linecolor);
        }

        //if vertical
        if (lines[i].d === 1) {
            //reverse direction if hit edge
            if (lines[i].y > screen_height - linewidth || lines[i].y < statusbarheight) {
                lines[i].o = lines[i].o * -1;
            }
            //check collisions
            if(disableCollision===0){
            if (lines[i].y + linewidth > player.y - player.size && lines[i].y < player.y + player.size && lines[i].x > player.x - player.size && lines[i].x < player.x + player.size) {
                exit = 1;
            }
            }
            //move it along
            lines[i].y = lines[i].y + linespeed * lines[i].o;
            //draw it
            drawLine(lines[i].x, lines[i].y, lines[i].x, lines[i].y + linewidth, linecolor);
        }
    }
    //display
    drawCircle(player.x, player.y, player.size, fgcolor);
    drawCircle(target.x, target.y, target.size, fg2color);
    drawLine(0, statusbarheight, screen_width, statusbarheight, fgcolor);
//Draw status bar
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, screen_width, statusbarheight-1);
    drawStatusBar(score, fg2color, fgcolor);

}
//Game start
function gameloop() {
    gamestatus = 1;
//Draw background
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, screen_width, screen_height);
    drawStatusBar(score, fg2color, fgcolor);
//Create Objects
    player = new OPlayer();
    target = new OTarget();
    drawCircle(player.x, player.y, player.size, fgcolor);
    drawCircle(target.x, target.y, target.size, fg2color);
    handle = self.setInterval("refresh()", interval);
}//function
/*Obsoleted
function gesture_old (e) { //Gesture recognization(old one)
    var length;
    var angle;
    length=parseInt(Math.sqrt(Math.pow(e.pageX-downX,2)+Math.pow(e.pageY-downY,2)),10);
    angle=Math.atan2(e.pageY-downY,e.pageX-downX);
    if (angle<0) {angle=2*Math.PI+angle;}
    angle=angle*180/Math.PI;
    //$("#msg").html(e.pageX+","+e.pageY+","+length+","+angle+","+mouse[0]+","+mouse[1]);
    if (ismousedown===1){
        if (length>=vcaToggleLength){
            if (angle>vca1 && angle<vca4){
                mouse[1]=1;
            }else if(angle>vca5 && angle<vca8){
                mouse[1]=-1;
            }else{
                mouse[1]=0;
            }//if (angle>vca1 && angle<vca4)
            if (angle>vca3 && angle<vca6){
                mouse[0]=-1;
            }else if(angle<vca2 || angle>vca7){
                mouse[0]=1;
            }else{
                mouse[0]=0;
            }//if (angle>vca3 && angle<vca6)
        }//if (length>=vcaToggleLength)
    }//if (ismousedown===1)
}//function gesture
*/
function gesture(e){
    var length;
    var angle;
    length=parseInt(Math.sqrt(Math.pow(e.pageX-downX,2)+Math.pow(e.pageY-downY,2)),10);
    angle=Math.atan2(e.pageY-downY,e.pageX-downX);
    if (angle<0) {angle=2*Math.PI+angle;}
    angle=angle*180/Math.PI;
    if (ismousedown===1){
        if (length>=vcaToggleLength){
            if (angle>vca1 && angle<vca4){
                mouse[1]=1;
            }else if(angle>vca5 && angle<vca8){
                mouse[1]=-1;
            }else{
                mouse[1]=0;
            }//if (angle>vca1 && angle<vca4)
            if (angle>vca3 && angle<vca6){
                mouse[0]=-1;
            }else if(angle<vca2 || angle>vca7){
                mouse[0]=1;
            }else{
                mouse[0]=0;
            }//if (angle>vca3 && angle<vca6)
        }//if (length>=vcaToggleLength)
        if (length >= vcaNextGestureLength){
            downX = e.clientX;
            downY = e.clientY;
            downLength = 0;
        }
    }//if (ismousedown===1)    
}
/* Not working yet
function saveGameStatus (){
    function GSObj(){
        this.score=score;
        this.color.bgcolor=bgcolor;
        this.color.fgcolor=fgcolor;
        this.color.fg2color=fg2color;
        this.color.linecolor=linecolor;
        this.highscore=highscore;
        this.lines=lines;
        this.player=player;
        this.target=target;
        this.linespeed=linespeed;
        this.linecount=linecount;
        this.version=1;
    }
    var GS = GSObj();
    window.localStorage.setItem("Gamestatus",JSON.stringify(GS));
    alert(JSON.stringify(GS));
}
function restoreGameStatus (){
    alert(window.localStorage.getItem("Gamestatus"));
    var GSi=JSON.parse(window.localStorage.getItem("Gamestatus"));
    if(GSi.version=1){
    score = GSi.score;
    bgcolor = GSi.color.bgcolor;
    fgcolor = GSi.color.fgcolor;
    fg2color = GSi.color.fg2color;
    linecolor = GSi.color.linecolor;
    highscore = GSi.highscore;
    lines = GSi.lines;
    player = GSi.player;
    target = GSi.target;
    linespeed = GSi.linespeed;
    linecount = GSi.linecount;
    }
}
*/
function pause(){
    if (gamestatus===1){
    gamestatus=3;
    clearInterval(handle);
    //saveGameStatus();
        ctx.fillStyle = fg2color;
        ctx.font = fontsize + "px serif";
        ctx.fillText("PAUSED", 100, fontsize - 5);
    }
}
function resume(){
    if (gamestatus===3){
    gamestatus=1;
    //restoreGameStatus();
    handle = setInterval("refresh()", interval);
    }
}
function orient() {
    if (window.orientation == 0 || window.orientation == 180) {
        //$('body').attr('class', 'portrait');
        //orientation = 'portrait';
        $('#cv').attr('class', 'canvas_portrait');
        pause();
        showbutton();
        hidebutton2();
        if(gamestatus===2){draw_home();}
        return false;
    }
    else if (window.orientation == 90 || window.orientation == -90) {
        //$('body').attr('class', 'landscape');
        //orientation = 'landscape';
        $('#cv').attr('class', 'canvas_landscape');
        resume();
        exe();
        hidebutton();
        if(gamestatus===2){showbutton2();}
        return false;
    }
}
//initialize game
function init() {
    //navigator.standalone
    if (window.screen.height >= window.screen.width) {
        screen_width = window.screen.height;// / window.devicePixelRatio;
        screen_height = window.screen.width;// / window.devicePixelRatio;
    } else {
        screen_width = window.screen.width;
        screen_height = window.screen.height;
    }
    //screen_width=$(window).width;
    //screen_height=$(window).height;
    $("body").on("touchmove", function(e){e.preventDefault();}); //Disable page scrolling
    $("#optn").on("touchstart",optn);
    $("#exe").on("touchstart",exe);
    $("#about").on("touchstart",function(){
                   if (gamestatus==3){if (confirm("You're going to lost your progress.Sure?")){window.location.assign("about.html");}} else {window.location.assign("about.html");}
                   })
    $("#cv").attr({width: screen_width, height: screen_height});
    $( "#cv" ).on("vmousedown", function(e) {
                  ismousedown=1;
                  downX=e.pageX;
                  downY=e.pageY;
                  });
    $( "#cv" ).on("vmouseup", function(e) {
                  ismousedown=0;
                  mouse=[0,0];
                  });
    $( "#cv" ).on("vmousemove", gesture);
    /*
     $( "#pause" ).on("touchstart",function(e){
                     if (gamestatus===3){resume();}else if (gamestatus===1){pause();}
                     });
     */
    orient();
    $(window).bind( 'orientationchange', function(e){
                   orient();
                   });
    
    load();
}
$(init);