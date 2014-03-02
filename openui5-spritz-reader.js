sap.ui.core.Control.extend("open.m.SpritzReader", {
    metadata : {
        properties : {
            "text": "string",
            "highlightColor" : "string",
            "wordsPrMin": {type : "int", defaultValue : 250},
        },aggregations: {
            items: {type : "open.m.SpritzReaderItem", multiple : true},
        },events: {
            itemRead:{},
        },
    },

    init: function() {

    },

    start:function(){
        var that=this;
        
        //TODO: Check if we are using text or multiple items
        //that.fireItemRead


        //clearTimeout(currentTimer);
        var currentWord = 0;
        var text = that.getText();
        var words = text.split(/\s+/).map(that._processWord);

        var displayNextWord = function(){
            //refactor out of this method
            var readerEl = $(".spritzreader");
            var currentTimer = null;


            
            

            var wpm = that.getWordsPrMin();
            var delay = 60000 / parseInt(wpm, 10);
            //end refactor


            var word = words[currentWord++];
            // WTB> nlp.js...
            var hasPause = /^\(|[,\.\)]$/.test(word);
            
            // XSS?! :(.
            readerEl.children().first().html(word);
            that._positionWord();
            
            if (currentWord !== words.length){
                currentTimer = setTimeout(displayNextWord, delay * (hasPause ? 2 : 1));
            }
        };
        
        displayNextWord();    
    },

    _positionWord:function(){
        var readerEl = document.querySelector('.spritzreader');
        var wordEl = readerEl.firstElementChild;
        var highlight = wordEl.firstElementChild;
    
        var centerOffsetX = (highlight.offsetWidth / 2) + highlight.offsetLeft;
        var centerOffsetY = (highlight.offsetHeight / 2) + highlight.offsetTop;
    
        wordEl.style.left = ((readerEl.clientWidth / 2) - centerOffsetX) + 'px';
        wordEl.style.top = ((readerEl.clientHeight / 2) - centerOffsetY) + 'px';

        /*jquery based calculations are off
        var readerEl = $(".spritzreader");
        var wordEl = readerEl.children().first();

        var highlight = wordEl.children().first();
        
        var centerOffsetX = (highlight.outerWidth() / 2) + highlight.offset().left;
        var centerOffsetY = (highlight.outerHeight() / 2) + highlight.offset().top;
        

        var wordPosLeft = ((readerEl.width() / 2) - centerOffsetX) + 'px';
        var wordPosTop = ((readerEl.height() / 2) - centerOffsetY) + 'px';

        wordEl.css({left:wordPosLeft});*/
    },

    _processWord:function(word){
        var center = Math.floor(word.length / 2);
        var letters = word.split('');
        var result = [];
        return letters.map(function(letter, idx){
            if (idx === center){
                return '<span class="spritzhighlight">' + letter + '</span>';
            }
            return letter;
        }).join('');
    },
    
    renderer : function(oRm, oControl) {
        oRm.write("<div"); 
        oRm.writeControlData(oControl);
        oRm.addClass("spritzreader"); 
        oRm.writeClasses();
        oRm.write(">");

        oRm.write("<div class=\"spritzword\"/>");
        oRm.write("</div>");
    },
});

sap.ui.core.Control.extend("open.m.SpritzReaderItem", {
    metadata : {
        properties : {
            "text" : "string"
        }
    },
});





