(function ($) {
    $.fn.extend({
        vectorectus : function (url) {
            var index  = 0,
                that = this,
                shapes = {},
            
            DrawVectors = function(element) {
                if ($(element).attr('id') === undefined)
                    $(element).attr('id', 'vectorectus-' + $(element).data('vectorectus') + "-" + (index++));
                
                
                var id      = $(element).attr('id'),
                    shape   = $(element).data('vectorectus'),
                    
                    data    = SelectorToData(shape),
                    path    = data,
                     
                    color   = $(element).css('color');
                    
                   // options = $(element).data('shape-options');
                    
                var vector = Raphael (id);
                var path   = vector.path(path).attr ({'stroke-width': '0','stroke-opacity': '0','fill': color });
                
                box     = path.getBBox();
                vector.setViewBox (box.x, box.y, box.width, box.height);
                
                
                $(path).data( 'class', 'vectorectus');
                
                
                $(element).mouseenter ( {e: element, p: path}, function (e) { 
                    var fake = $(document.createElement('div')).addClass('vectorectus');
                        fake = $(e.data.e).append($(fake));
                    
                    //console.log( css2json($(fake)) );
                    css2data($(fake))
                    
                    
                        $(e.data.e).remove('vectorectus');
                    //$(e.data.p).attr();
                })
                
                //.mouseleave ( {e: element, p: path}, function (e) {  });
            },
                        
            SelectorToData = function (selector) {
                var names = selector.split('.') || ['', ''];          
                return shapes [names[0]] [names[1]];
            },
        
            loadVectorFile = function (url) {      
                $.getJSON(url, function(data) {
                    shapes = data;
                    
                    that.each(function() {
                        DrawVectors(this);
                    });
                }).error(function(e) { 
                    console.log('vectorectus error: ' + e); 
                });
            },
            
            css2data = function(parent) {
                element = $('.vectorectus', parent);
            
                var jata = [],
                    style = (window.getComputedStyle) ? getComputedStyle($(element).get(0), null) : $(element).get(0).scurrentStyle;
                    
                $.each([
                    "cursors",
                    "fill",
                    "fill-opacity",
                    "opacity",
                    
                    "stroke",
                    "stroke-dasharray",
                    "stroke-linecap",
                    "stroke-linejoin",
                    "stroke-miterlimit",
                    "stroke-opacity",
                    "stroke-width"
                ], function(index, value) { 
                    prop = style.getPropertyValue(value);
                    
                    if (prop != null) {
                        prop.replace(/\-([a-z])/g, function(a, b){
                            return b.toUpperCase();
                        });
                        
                        jata.push({value.toString() : prop});
                    }
                });
                
                console.log(jata);
                
                return jata;
            };
            
            loadVectorFile(url);  
            return this;
        }       
    })
})(jQuery);



"cursors",
"fill",
"fill-opacity",
"opacity",

"stroke",
"stroke-dasharray",
"stroke-linecap",
"stroke-linejoin",
"stroke-miterlimit",
"stroke-opacity",
"stroke-width"