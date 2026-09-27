(function(G){
 "use strict";
 // Canonical input order. Existing alternate output colors are provisional;
 // Dark outputs and ALL companion backgrounds are established owner values.
 // These are output preferences, never the canonical PNG validation palette.
 G.config.DISPLAY_PALETTES=Object.freeze([
  {id:'canonical',outside:'#6d8508',name:'CANONICAL',colors:['#9bbc0f','#8bac0f','#306230','#0f380f']},
  {id:'hardware',outside:'#9bb393',name:'GAME BOY / TUNABLE',colors:['#d5dcc0','#9aab83','#536951','#23392e']},
  {id:'blue',outside:'#a0b9be',name:'BLUE',colors:['#dbe8ef','#90afc8','#49617d','#202d45']},
  {id:'red',outside:'#a27070',name:'RED',colors:['#f0d9d1','#c39287','#854f53','#402b37']},
  {id:'purple',outside:'#927d99',name:'PURPLE',colors:['#e6dbed','#b09bbb','#715c86','#342b48']},
  {id:'amber',outside:'#c7b17a',name:'AMBER',colors:['#f2dfb2','#c5a266','#80643a','#392e24']},
  {id:'gray',outside:'#8f8f8f',name:'GRAYSCALE',colors:['#e4e4e4','#aaaaaa','#666666','#242424']},
  {id:'dark',name:'DARK',outside:'#2b2d31',colors:['#242424','#666666','#aaaaaa','#e4e4e4']}
 ].map(p=>Object.freeze({...p,colors:Object.freeze(p.colors)})));
}(window.GBTRPG));
