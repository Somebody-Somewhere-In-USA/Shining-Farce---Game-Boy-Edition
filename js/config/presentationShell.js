(function(G){
 "use strict";
 // Native owner PNGs; right edge y=155 approved after reference comparison.
 G.config.PRESENTATION_SHELLS={
  "1": {
    "width": 600,
    "height": 975,
    "screen": {
      "x": 185,
      "y": 155,
      "width": 300,
      "height": 225
    },
    "components": [
      {
        "id": "top",
        "x": 0,
        "y": 0,
        "width": 600,
        "height": 155,
        "normal": "assets/presentation/game-boy/size-1/top.png",
        "states": {
          "on": "assets/presentation/game-boy/size-1/top-on.png"
        }
      },
      {
        "id": "contrast-wheel",
        "x": 0,
        "y": 155,
        "width": 75,
        "height": 225,
        "normal": "assets/presentation/game-boy/size-1/contrast-wheel.png",
        "states": {
          "scroll": "assets/presentation/game-boy/size-1/contrast-wheel-scroll.png"
        }
      },
      {
        "id": "battery",
        "x": 75,
        "y": 155,
        "width": 110,
        "height": 225,
        "normal": "assets/presentation/game-boy/size-1/battery.png",
        "states": {
          "on": "assets/presentation/game-boy/size-1/battery-on.png"
        }
      },
      {
        "id": "right-of-screen",
        "x": 485,
        "y": 155,
        "width": 115,
        "height": 225,
        "normal": "assets/presentation/game-boy/size-1/right-of-screen.png",
        "states": {}
      },
      {
        "id": "below-screen",
        "x": 0,
        "y": 380,
        "width": 600,
        "height": 159,
        "normal": "assets/presentation/game-boy/size-1/below-screen.png",
        "states": {}
      },
      {
        "id": "left-side",
        "x": 0,
        "y": 539,
        "width": 80,
        "height": 436,
        "normal": "assets/presentation/game-boy/size-1/left-side.png",
        "states": {}
      },
      {
        "id": "bottom",
        "x": 80,
        "y": 727,
        "width": 520,
        "height": 248,
        "normal": "assets/presentation/game-boy/size-1/bottom.png",
        "states": {}
      },
      {
        "id": "d-pad",
        "x": 80,
        "y": 539,
        "width": 310,
        "height": 188,
        "normal": "assets/presentation/game-boy/size-1/d-pad.png",
        "states": {
          "down": "assets/presentation/game-boy/size-1/d-pad-down.png",
          "left": "assets/presentation/game-boy/size-1/d-pad-left.png",
          "right": "assets/presentation/game-boy/size-1/d-pad-right.png",
          "up": "assets/presentation/game-boy/size-1/d-pad-up.png"
        }
      },
      {
        "id": "b-button",
        "x": 390,
        "y": 539,
        "width": 95,
        "height": 188,
        "normal": "assets/presentation/game-boy/size-1/b-button.png",
        "states": {
          "pressed": "assets/presentation/game-boy/size-1/b-button-pressed.png"
        }
      },
      {
        "id": "a-button",
        "x": 485,
        "y": 539,
        "width": 115,
        "height": 188,
        "normal": "assets/presentation/game-boy/size-1/a-button.png",
        "states": {
          "pressed": "assets/presentation/game-boy/size-1/a-button-pressed.png"
        }
      },
      {
        "id": "select-button",
        "x": 80,
        "y": 727,
        "width": 216,
        "height": 141,
        "normal": "assets/presentation/game-boy/size-1/select-button.png",
        "states": {
          "pressed": "assets/presentation/game-boy/size-1/select-button-pressed.png"
        }
      },
      {
        "id": "start-button",
        "x": 296,
        "y": 727,
        "width": 110,
        "height": 141,
        "normal": "assets/presentation/game-boy/size-1/start-button.png",
        "states": {
          "pressed": "assets/presentation/game-boy/size-1/start-button-pressed.png"
        }
      }
    ]
  },
  "2": {
    "width": 780,
    "height": 1105,
    "screen": {
      "x": 185,
      "y": 155,
      "width": 480,
      "height": 360
    },
    "components": [
      {
        "id": "top",
        "x": 0,
        "y": 0,
        "width": 780,
        "height": 155,
        "normal": "assets/presentation/game-boy/size-2/top.png",
        "states": {
          "on": "assets/presentation/game-boy/size-2/top-on.png"
        }
      },
      {
        "id": "contrast-wheel",
        "x": 0,
        "y": 155,
        "width": 75,
        "height": 360,
        "normal": "assets/presentation/game-boy/size-2/contrast-wheel.png",
        "states": {
          "scroll": "assets/presentation/game-boy/size-2/contrast-wheel-scroll.png"
        }
      },
      {
        "id": "battery",
        "x": 75,
        "y": 155,
        "width": 110,
        "height": 360,
        "normal": "assets/presentation/game-boy/size-2/battery.png",
        "states": {
          "on": "assets/presentation/game-boy/size-2/battery-on.png"
        }
      },
      {
        "id": "right-of-screen",
        "x": 665,
        "y": 155,
        "width": 115,
        "height": 360,
        "normal": "assets/presentation/game-boy/size-2/right-of-screen.png",
        "states": {}
      },
      {
        "id": "below-screen",
        "x": 0,
        "y": 515,
        "width": 780,
        "height": 154,
        "normal": "assets/presentation/game-boy/size-2/below-screen.png",
        "states": {}
      },
      {
        "id": "left-side",
        "x": 0,
        "y": 669,
        "width": 80,
        "height": 436,
        "normal": "assets/presentation/game-boy/size-2/left-side.png",
        "states": {}
      },
      {
        "id": "bottom",
        "x": 80,
        "y": 857,
        "width": 700,
        "height": 248,
        "normal": "assets/presentation/game-boy/size-2/bottom.png",
        "states": {}
      },
      {
        "id": "d-pad",
        "x": 80,
        "y": 669,
        "width": 435,
        "height": 188,
        "normal": "assets/presentation/game-boy/size-2/d-pad.png",
        "states": {
          "down": "assets/presentation/game-boy/size-2/d-pad-down.png",
          "left": "assets/presentation/game-boy/size-2/d-pad-left.png",
          "right": "assets/presentation/game-boy/size-2/d-pad-right.png",
          "up": "assets/presentation/game-boy/size-2/d-pad-up.png"
        }
      },
      {
        "id": "b-button",
        "x": 515,
        "y": 669,
        "width": 130,
        "height": 188,
        "normal": "assets/presentation/game-boy/size-2/b-button.png",
        "states": {
          "pressed": "assets/presentation/game-boy/size-2/b-button-pressed.png"
        }
      },
      {
        "id": "a-button",
        "x": 645,
        "y": 669,
        "width": 135,
        "height": 188,
        "normal": "assets/presentation/game-boy/size-2/a-button.png",
        "states": {
          "pressed": "assets/presentation/game-boy/size-2/a-button-pressed.png"
        }
      },
      {
        "id": "select-button",
        "x": 80,
        "y": 857,
        "width": 296,
        "height": 141,
        "normal": "assets/presentation/game-boy/size-2/select-button.png",
        "states": {
          "pressed": "assets/presentation/game-boy/size-2/select-button-pressed.png"
        }
      },
      {
        "id": "start-button",
        "x": 376,
        "y": 857,
        "width": 210,
        "height": 141,
        "normal": "assets/presentation/game-boy/size-2/start-button.png",
        "states": {
          "pressed": "assets/presentation/game-boy/size-2/start-button-pressed.png"
        }
      }
    ]
  }
};
// Shell IDs remain asset identities; mode IDs independently select geometry/sampling.
 G.config.PRESENTATION_MODES=[
  {id:1,label:'SMALL GB - 300x225 SMOOTH',shell:1,screen:{x:185,y:155,width:300,height:225},sampling:'auto'},
  {id:2,label:'LARGE GB - 480x360',shell:2,screen:{x:185,y:155,width:480,height:360},sampling:'pixelated'},
  {id:3,label:'FRAMELESS - RESPONSIVE',shell:null,sampling:'pixelated'}
 ];
 G.config.POWER_SWITCH={x:60,y:0,width:75,height:20};
 G.config.BOOT={frames:Object.fromEntries(Array.from({length:28},(_,i)=>[i+1,'assets/presentation/boot/sega-logo-'+(i+1)+'.png'])),audio:'assets/presentation/boot/sega-chant-game-boy.mp3',audioFallbackMs:1920};
}(window.GBTRPG));
