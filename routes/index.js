"use strict";

/*
 * GET home page.
 */
 
var fs = require('fs'),
    stylus = require('stylus'),
    jade = require('jade');

exports.index = function(req, res) {
  var generatedHTML, generatedCSS, generatedJSON, generatedHTMLOutput, generatedCSSOutput;
  
  var body = {
    wrapperSelector: req.body.wrapperSelector || 'carouselWrapper',
    containerSelector: req.body.containerSelector || 'carouselContainer',
    paneSelector: req.body.paneSelector || 'pane',
    height: parseFloat(req.body.height) || 100,
    heightUnit: req.body.heightUnit || '%',
    delay: parseInt(req.body.delay || 30),
    moveDelay: parseFloat(req.body.moveDelay || 1.5),
    width: parseFloat(req.body.width) || 100,
    widthUnit: req.body.widthUnit || '%',
    numOfPanes: parseInt(req.body.numOfPanes) || 4,
    imageBaseurl: req.body.imageBaseurl || '/img/test/',
    panels: req.body.panels || [],
    jade: (req.body.jade === 'on'),
    stylus: (req.body.stylus === 'on')
  };
  //~ body.panels = [];
  for (var i = 0; i < body.numOfPanes; i++) {

    body.panels[i] = {
      title: 'panel' + i + ' title', 
      content: 'panel' + i + ' content.<br> this can be html. <a href="#" target="utopia">even links work</a>', 
      imageSrc: 'image-' + i + '.png'
    };
  }

  if (body.widthUnit === '%') {
    body.paneWidth = (100 / body.numOfPanes) + '%';
  } else {
    body.paneWidth = body.width + body.widthUnit;
  }

  
  fs.readFile('_inc/templates/stylus.styl', {encoding: 'utf8'}, function(err, styl) {
    //~ console.log('stylus = ' + styl);
    
    var cssVars = 'wrapperSelector = ' + body.wrapperSelector + '\n' +
                  'containerSelector = ' + body.containerSelector + '\n' +
                  'paneSelector = ' + body.paneSelector + '\n' +
                  'height = ' + body.height + body.heightUnit + '\n' +
                  'width = ' + body.width  + body.widthUnit + '\n' +
                  'delay = ' + body.delay + 's' + '\n' +
                  'numOfPanes = ' + body.numOfPanes + '\n' +
                  'paneWidth = ' + body.paneWidth + '\n' +
                  'containerWidth = ' + (body.numOfPanes * body.width) + body.widthUnit + '\n\n';
               
    var numOfMoves = (body.numOfPanes - 1) * 2,
      percentagePerCycle = 100 / numOfMoves,
      currentPercent = 0,
      currentLeft = 0,
      framesCSSString = '@keyframes movePane \n';
  
    var multiplier = -1;
    //first half of the animation, adding
    for (var i = 0; i < numOfMoves * 2; i++) {
      framesCSSString += '  ' + currentPercent + '%\n' +
                         '    ' + 'left: ' + currentLeft + body.widthUnit + '\n';
      multiplier = -1;
      // move
      if (i % 2) {
        currentPercent += body.moveDelay;

        if ( i > numOfMoves)
          multiplier = 1;

        currentLeft += body.width * multiplier;
      // or wait
      } else {
        currentPercent += parseFloat(percentagePerCycle - body.moveDelay);
      }
    }
    cssVars += framesCSSString + '\n';
    //~ console.log('framesCSSString = ' + framesCSSString);

    if (body.stylus)
      generatedCSS = cssVars + styl;

    stylus.render(cssVars + styl, function (err, generatedCSSOutput) {
      //~ console.log('err = ' + err);
      
      if (!body.stylus)
        generatedCSS = generatedCSSOutput;


      fs.readFile('_inc/templates/jade.jade', {encoding: 'utf8'}, function (err, jadeString) {
        
        
        if (body.jade) {
          generatedHTML = jadeString;
          
          var panelString = '//pass this object into the view of the express app that uses this panel:\n' 
                          + 'var panel = ';
          
          panelString += JSON.stringify(body.panels, null, '  ');

          generatedJSON = panelString.replace(/\\/g, '') + ';';
        }
        body.pretty = true;

        jade.render(jadeString, body, function (err, generatedHTMLOutput) {
          if (!body.jade)
            generatedHTML = generatedHTMLOutput;

          //~ console.log('html = ' + generatedHTMLOutput);
          res.render('index', { body: body,
                                generatedHTML: generatedHTML, 
                                generatedCSS: generatedCSS, 
                                generatedHTMLOutput: generatedHTMLOutput,
                                generatedCSSOutput: generatedCSSOutput,
                                generatedJSON: generatedJSON
                              }); 
        });
      });
    });
  });
  
}
