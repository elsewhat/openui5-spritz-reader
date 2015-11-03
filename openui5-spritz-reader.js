sap.ui.core.Control.extend("open.m.SpritzReader", {
    metadata : {
        properties : {
            "text": "string",
            "highlightColor" : "string",
            "wordsPrMin": {type : "int", defaultValue : 250},
        },aggregations: {
            items: {type : "open.m.SpritzReaderItem", multiple : true},
        },events: {
            readingComplete:{},
            readingStarting:{},
            readingItemStarting:{},
            readingItemComplete:{}
        },
    },

    init: function() {

    },

    start:function(){
        //TODO: Reset if already reading
        var that=this;
        this.fireReadingStarting();
        //TODO: Check if we are using text or multiple items
        var hasItems=false;
        var text;
        var readerItems;
        var readerItemIndex=0;
        //if items aggregation exist use it, if not use text property
        if(that.getItems() && that.getItems().length>0){       
            readerItems = that.getItems();
            console.log("openui5-spritz-reader. Reading " + readerItems.length + " items");
            text= readerItems[readerItemIndex].getText();
            hasItems=true;
        }else {
            text = that.getText(); 
        }

        //clearTimeout(currentTimer);
        var currentWord = 0;
        //var words = text.split(/\s+/).map(that._processWord);
        var words = text.split(/[ ,.\?\(\)\/-]+/).map(that._processWord);

        var displayNextWord = function(){
            //refactor out of this method
            var readerEl = $(".spritzreader");
            var currentTimer = null;

            var wpm = that.getWordsPrMin();
            var delay = 60000 / parseInt(wpm, 10);

            var word = words[currentWord];
            var hasPause = /^\(|[,\.\)]$/.test(word);
            
            // XSS?! :(.
            //TODO: Escape for XSS
            readerEl.children().first().html(word);
            that._positionWord();
            
            //check if we should read more words
            if (currentWord < words.length-1){
                currentWord++
                currentTimer = setTimeout(displayNextWord, delay * (hasPause ? 2 : 1));
            }else if(hasItems){
                if(readerItemIndex < readerItems.length-1){
                    that.fireReadingItemComplete({item:readerItems[readerItemIndex]});
                    currentWord=0;
                    readerItemIndex++;
                    text= readerItems[readerItemIndex].getText();
                    words = text.split(/\s+/).map(that._processWord);
                    currentTimer = setTimeout(displayNextWord, delay * 3);
                    
                    //should we trigger this after the timeout is complete?
                    that.fireReadingItemStarting({item:readerItems[readerItemIndex]}); 
                }else {
                    that.fireReadingItemComplete({item:readerItems[readerItemIndex]});
                    that.fireReadingComplete(); 
                }
            }else {
                that.fireReadingComplete(); 
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
            "text" : "string",
            "url" :"string"
        }
    },

    getData:function(){
        return {text:this.getText(),url:this.getUrl()};
    }
});





