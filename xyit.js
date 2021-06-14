// xyit.js
//
// A canvas toy
// Craig Fitzgerald
//
// This started out as a re-implementation of tixy (https://tixy.land/) by Martin Kleppe @aemkei
//  it now has a lot more stuff

//todo:
// click= cycle samples (and button highlight)
// help

var INITIAL_STATES = [
   {x:32, y:32 , r:'*', m:0, e:'sin((y-16)*t*.3)+cos((x-16)*t*.3)'                       , d: 'pulsing checkerboard @craig'           },
   {x:32, y:'*', r:'*', m:0, e:'-.4/(hypot(x-t%20,y-t%16)-t%2*12)'                       , d: 'blink @aemkei'                         },
   {x:32, y:32 , r:'*', m:0, e:'t/y<(x+=t*8,(y-x^y+x)%29+y)'                             , d: 'modified train ride by @ntsutae'       },
   {x:32, y:32 , r:'*', m:0, e:'sin(t+atan2(y-=16,x-=16)+hypot(y,x))'                    , d: 'slow spiral @aemkei'                   },
   {x:48, y:'*', r:'*', m:0, e:'sin(y*t*.1)+(x-y)/10'                                    , d: 'ribbon @craig'                         },
   {x:48, y:48 , r:'*', m:1, e:'sin((t*sqrt((x-24)**2+(y-24)**2)))'                      , d: 'psychadelic circles @craig'            },
   {x:32, y:'*', r:'*', m:0, e:'1-((x*x-y+t*(1+x*x%5)*3)%16)/16'                         , d: 'matrix rain by @P_Malin'               },
   {x:32, y:32 , r:'*', m:0, e:'sin(t*3-sqrt((x-16)**2+(y-16)**2))'                      , d: 'expanding circles @aemkei'             },
   {x:24, y:24 , r:'*', m:0, e:'d=y*y%5.9+1,!((x+t*50/d)&15)/d'                          , d: '3d starfield by @P_Malin'              },
   {x:24, y:'*', r:15 , m:0, e:'[2014447,173345,1752289,1221921,2008367][y+t*9&7]&1<<x-1', d: 'scrolling \"Craig\" idea by @atesgoral'},
   {x:64, y:'*', r:'*', m:0, e:'4 * t & i & x & y'                                       , d: 'serpinski @aemkei'                     },
   {x:32, y:32 , r:'*', m:0, e:'t%=5,sin(atan2(y-=16,x-=16)+t*hypot(y,x))'               , d: 'quick spiral @craig'                   },
   {x:32, y:32 , r:'*', m:0, e:'tan(y/8+t+3-x)+sin(t)'                                   , d: 'sliding pattern  @freyfogle'           },
   {x:16, y:16 , r:'*', m:0, e:'hypot(x-=t*5,y-=8)<6&(x<y|y<-x)'                         , d: 'hungry pac man by @p_malin and @aemkei'},
   {x:48, y:'*', r:'*', m:1, e:'i%6 - (floor(y+t*5))%8'                                  , d: 'scrolling patttern @craig'             },
   {x:16, y:16 , r:'*', m:0, e:'1+sin((y-8)*t*.53)+cos((x-8)*t*.53)'                     , d: 'twinkle dots @craig'                   },
   {x:16, y:16 , r:'*', m:0, e:'(((x-8)/y+t*5)&1^1/y*8&1)*y/5'                           , d: 'checker board by @P_Malin'             },
   {x:16, y:16 , r:'*', m:0, e:'x&y<9&y>4+sin(8*t+x*x)+x/4'                              , d: 'spectrum analyser by @joeytwiddle'     },
   {x:16, y:16 , r:'*', m:0, e:'([62,85,93,62][y/2]||65)>>x%9&1'                         , d: 'duo by @cocopon'                       },
   {x:16, y:16 , r:'*', m:0, e:'i%4 - y%4'                                               , d: '-training- @aemkei'                    },
   {x:16, y:16 , r:'*', m:0, e:'-(t=t*2%8, x>t & y>t & x<15-t & y<15-t)'                 , d: 'shrinking box @aemkei'                 },
]

$(function() {
   var scene = new PageHandler("#field", {});
});

function PageHandler(canvas, options){
   var self = this;

   this.Init = function(canvas, options){
      self.InitAttributes(canvas, options);
      self.StateToInputs();
      self.InitEvents();
      self.InitView();
   };

   this.InitAttributes = function(canvas, options){
      self.canvas  = $(canvas).get(0);
      self.ctx     = self.canvas.getContext('2d');
      self.storeId = "xyit";
      self.sample  = 0;
      self.states  = [];
      self.state   = {};
      self.metrics = {};
      self.info    = 0;
      self.time    = 0;

      self.LoadStates();
      let s = self.state = Object.assign({...self.states[0]}, options || {});
      ['x','y','r','e','m','d'].map(n => s[n] = self.UrlParam(n, s[n]))
   };

   this.InitEvents = function(){
      document.oncontextmenu = function(){return false};
      $(window).resize(self.CalcMetrics);
      $("input").on("input", self.InputChange);
      $("#save").click(self.SaveState);
      $("#m").click(self.ToggleMethod);
      $("#state-buttons").on("click contextmenu", "button", self.RestoreState);
      $('form').on('submit', self.MakeUrl);
      $('#info').click(self.ToggleInfo);
      $('#time').click(self.ToggleTime);
   };

   this.InitView = function(){
      self.CalcMetrics();
      requestAnimationFrame(self.Step);
   };

   this.StateToInputs = function(s = self.state){
      ['x','y','r','e','d'].map(n => $(`#${n}`).val(s[n]).text(s[n]));
      self.SetMethod(s.m - 0);
   };

   this.InputsToState = function(s = self.state){
      ['x','y','r','e'].map(n => s[n] = $(`#${n}`).val());
      s.d = $('#d').text();
      s.m = $('#m').data('m'); // todo
   };

   this.CalcMetrics = function(){
      let x = $(window).width() ;
      let y = $(window).height();
      $('body').width (x);
      $('body').height(y);
      $(self.canvas).width (x);
      $(self.canvas).height(y);
      self.canvas.width  = x;
      self.canvas.height = y;

      self.InputsToState();
      let s = self.state;
      let m = self.metrics;
      let iv = self.InputVal;
      [m.xCount, m.yCount, m.radius] = [iv(s.x), iv(s.y), iv(s.r)];
      [m.expr  , m.method, m.gap   ] = [s.e, s.m, 3];
      m.date = new Date;

      m.xCount = Math.max(0, Math.min(64, m.xCount));
      m.yCount = Math.max(0, Math.min(64, m.yCount));

      if (m.radius == 0){
         if (m.xCount == 0 && m.yCount == 0) m.xCount = m.yCount = 16;
         let sx = m.xCount > 0 ? (x-25)/m.xCount : 255;
         let sy = m.yCount > 0 ? (y-150)/m.yCount : 255;
         m.radius = Math.round(Math.max(1, Math.min(sx, sy)/2 - m.gap) * 100)/100;
      }
      if (m.xCount == 0) m.xCount = Math.floor((x-25)/(m.radius*2+m.gap));
      if (m.yCount == 0) m.yCount = Math.floor((y-150)/(m.radius*2+m.gap));

      m.count   = m.xCount * m.yCount;
      m.xOffset = (x - m.xCount * (2 * m.radius + m.gap)) / 2;
      m.yOffset = 50;

      let code = `try{with(Math){return ${m.expr}}} catch(e){return e}`;
      m.xyit = new Function("x","y","i","t", code);
      //console.log(`xc:${m.xCount}, yc:${m.yCount}, r:${m.radius}, x:${x}, y:${y}, gap:${m.gap}`);
   };

   this.InputVal = function(val){
      return !val.length || val == "*" ? 0 : Number(val);
   };

   this.InputChange = function(e){
      e.preventDefault();
      if ($("#e").val() != self.metrics.e){
         $("#d").text("");
      }
      self.CalcMetrics();
   };

   this.ToggleMethod = function(e){
      self.SetMethod(2);
   };

   this.SetMethod = function(i){
      let node = $("#m");
      let m = i > 1 ? 1 - node.data('m') : i;
      node.text(m ? "Color" : "Radius").data('m', m);
      self.CalcMetrics();
   };

   this.IndexToLoc = function(i){
      let m = self.metrics;
      let xIndex = i % m.xCount;
      let yIndex = Math.floor(i / m.xCount);
      let x = m.xOffset + m.radius + xIndex * (2 * m.radius + m.gap);
      let y = m.yOffset + m.radius + yIndex * (2 * m.radius + m.gap);
      return {x,y,xIndex,yIndex};
   };

   this.Step = function(){
      self.DrawBackground();

      let m = self.metrics;
      let t = (new Date - m.date) / 1000;
      if (self.time) $("#time").text(t);
      for (let i=0; i<m.count; i++){
         let loc = self.IndexToLoc(i);
         let val = self.metrics.xyit(loc.xIndex, loc.yIndex, i, t);
         self.DrawDot(loc, val);
      }
      requestAnimationFrame(self.Step);
   };

   this.DrawDot = function(pos, val){
      let m = self.metrics;
      let ctx = self.ctx;

      let r, hue;
      if (m.method){
         r = m.radius;
         hue = Math.max(0, Math.min(240, 120 + val * 120));
         ctx.fillStyle = `hsl(${hue},75%,40%)`;
      } else {
         r = Math.min(m.radius, Math.abs(val) * m.radius);
         ctx.fillStyle = val > 0 ? "#FFF" : "#F00";
      }
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
      ctx.fill();
   };

   this.DrawBackground = function(){
      self.ctx.fillStyle = "#000";
      self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
   };

   this.SaveState = function() {
      self.states.push(JSON.parse(JSON.stringify(self.state)));
      localStorage.setItem(self.storeId, JSON.stringify(self.states));
      self.GenStateButtons();
   };

   this.LoadStates = function() {
      self.states = JSON.parse(localStorage.getItem(self.storeId));
//
// --while in development ...
//
//      if (!self.states || !self.states.length) self.states = [...INITIAL_STATES];
//
self.states = [...INITIAL_STATES];


      self.GenStateButtons();
   };

   this.RestoreState = function(ev) {
      ev.preventDefault();
      let idx = +$(this).data("i");
      if (ev.which == 3) return self.DeleteState(idx);
      let state = JSON.parse(JSON.stringify(self.states[idx]))
      self.StateToInputs(state);
      self.InitView();
   };

   this.DeleteState = function(idx) {
      self.states.splice(idx,1);
      if (!self.states || !self.states.length) self.states = [...INITIAL_STATES];
      localStorage.setItem(self.storeId, JSON.stringify(self.states));
      self.GenStateButtons();
   };

   this.GenStateButtons = function() {
      let div = $("#state-buttons").empty();
      let i=0;
      for (let state of this.states) {
         let label = ("" + i).padStart(2,"0");
         div.append($("<button>").text(label).attr("id", `s${i}`).attr("data-i", i++));
      }
   };

   this.MakeUrl = function(e){
      e.preventDefault();
      let s = self.state;
      let url = new URL(document.location);
      ['x','y','r','m','e'].map(n => url.searchParams.set(n, s[n]));
      history.replaceState(null, "", url);
   };

   this.ToggleInfo = function() {
      let d = $('#docs');
      (self.info = 1 - self.info) ? d.show() : d.hide();
   };

   this.ToggleTime = function(e) {
      self.time = 1 - self.time;
      $(e.target).text('-time-');
   };

   this.UrlParam = function(name, defaultVal){
      var results = new RegExp('[\\?&]' +name+ '=([^&#]*)', 'i').exec(location.href);
      return results ? decodeURIComponent(results[1]) : defaultVal;
   };

   this.Init(canvas, options);
};
