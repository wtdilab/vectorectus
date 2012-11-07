(function ($, Raphael) {
    $.fn.extend({      
        /*
		   	Function: vectorectus
		   
		   	Library for svg graphics that extends
		   	Raphael.js and is styled with typical css
		   	
		   	Support for:
		   		IE 10+
		   		Firefox 3.6+
		   		Chrome
		   		Opera
		   			
		   	Parameters:
		    	urls        -  a url String or Array of url Strings
		    	extend      -  an object to extend options
		      
		    Options: 
		   		data        -  the data attribute tied to shape name
		   		prefix      -  the id prefix for elements without id's assigned
		   		shapes      -  an object that holds key/pair svg strings
		   		errorshape  -  default vectorectus shape if error or misconfigured
		
		   	Returns: 
		   	  jquery object (this)
		   
		*/
    
        vectorectus : function (urls, extend) {
            if (typeof Raphael === 'undefined') {
                console.error("Vectorectus is dependent on Raphael.js to run, make sure that is properly installed");
                return this;
            }
            
            var that = this, //make the calling jquery object global to the function
            
            options = $.extend({            	
                data       : 'vectorectus',
                prefix     : 'vectorectus-',
                
                shapes     : {},
                count      : 0,
                
                baseClass  : 'base',
                layerClass : 'layer',
                
                errorshape : [
                	"M26.774,0 0,0 0,20.753 4.129,61.713 23.863,61.713 26.774,20.753 z",
                	"M13.242,70.159c6.821,0,12.348,5.531,12.348,12.348 c0,6.821-5.527,12.348-12.348,12.348c-6.82,0-12.349-5.526-12.349-12.348C0.893,75.689,6.422,70.159,13.242,70.159z"
                ]
            }, extend);
            
            
            
            /*
            	Function: ParseForKeywords
            	
            	Search string for keywords such as:
            		- Circle
            		- Ellipse
            		- Rect
            
            	Parameters: 
            		str - path string
            	
            	Returns:
            		Raphael object
            */
            ParseForKeywords = function (str) {
	           	var obj,
	           		type,
	           		args,
		           	estr = str.toLowerCase().replace(/\s/g, '');
	           	
	            if (estr.indexOf('circle:') == -1 && estr.indexOf('ellipse:') == -1 && estr.indexOf('rect:') == -1) 
	            	return false;
	            
	            obj  = estr.split(':');
	            type = obj[0];
	            args = obj[1].split(',');
	            
	            $.each(args, function(index, value) {
		        	args[index] = parseInt(args[index]);
	            });
	            
	            return {type:type, args:args};
            },
            
                
            /* 
            	Function: SelectorToPaths 
            	
            	takes selector, found in data attributes,
            	and converts them to a list of svg pahts.
            	
            	Parameters:
            		selector - a string name of defined path groups
            		
            	Returns:
            		PathList - an array of svg paths
            	
            */        
            SelectorToPaths = function (selector) {
            	if (options.shapes[selector] === undefined) 
            		return [];
     
            	return (typeof options.shapes[selector] === 'string') ? [options.shapes[selector]] : options.shapes[selector];        
            },
            
            
            
            /*
            	Function: DrawVector
            	
            	Draws and layers svgs on a raphael.js paper
            	by cycling through the jquery object looking 
            	for data tags
            	
            	Parameters:
            		element - the container for the vector
            		vector  - the vector key
            		
            	Returns:
            		false on failure (with console.error)
            			
            */
            DrawVector = function (element) {
                if ($(element).attr('id') === undefined)
                    $(element).attr('id', options.prefix + $(element).data(options.data) + "-" + (options.count++));
            
                var id     = $(element).attr('id'),
                	shape  = $(element).data(options.data),
                    vector = Raphael (id, "100%", "100%"),
                	boxes  = [],
                	layers = [],
                	bound  = {},
                	path;
                	
                $.each(SelectorToPaths(shape), function(index, string) {	            	 
	            	 if ((path = ParseForKeywords(string)) != false) {	            	 
	            	 	switch (path.type) {
		            	 	case 'rect':
			            	 	layers[index] = vector.rect (path.args[0], path.args[1], path.args[2], path.args[3]);
			            	 	break;
			            	 	
		            	 	case 'circle':
			            	 	layers[index] = vector.circle (path.args[0], path.args[1], path.args[2]);
			            	 	break;
			            	 	
		            	 	case 'ellipse':
			            	 	layers[index] = vector.ellipse (path.args[0], path.args[1], path.args[2], path.args[3]);
			            	 	break;
	            	 	}
	            	 } else {
		            	 layers[index] = vector.path (string);
	            	 }
		            	 
					 // VML fallback, if UserAgent is IE8 or lower
					 if (Raphael.vml) 
					    path.attr({ 'stroke-width': '0','stroke-opacity': '0', 'fill': 'black' });

					 //box sizing and class assignment
	            	 boxes[index] = layers[index].getBBox();
	            	 layers[index].node.setAttribute("class", "layer" + (index+1).toString());
	            	 
	            	 if (index == 0) {
		            	 bound = boxes[index];
	            	 } else { 
		            	 bound.x  = (boxes[index].x  < bound.x)  ? boxes[index].x  : bound.x;
		            	 bound.x2 = (boxes[index].x2 > bound.x2) ? boxes[index].x2 : bound.x2;
		            	 bound.y  = (boxes[index].y  < bound.y)  ? boxes[index].y  : bound.y;
		            	 bound.y2 = (boxes[index].y2 > bound.y2) ? boxes[index].y2 : bound.y2;
		            	 
		            	 
	            	 }        	 
                });
                
                vector.setViewBox(bound.x, bound.y, bound.x2 - bound.x, bound.y2 - bound.y, true);
            },
            
            /*
            	Function: InterateElements
	            
	            
            */
            
            InterateElements = function () {
	        	$(that).each(function() {
		        	DrawVector(this);
	        	});
            },
                
            
          
          
            /*
				Function: QueueFileRequests
				
				Loads a list of data files and exectutes 
				draw function when all files have loaded
				
				Parameters:
			   		urlList - Array of urls
			
			*/
            QueueFileRequests = function (urlList) {
	            $.each(urlList, function(index, url) {
	                $.getJSON(url, function (data) {
		               	$.extend(options.shapes, data);
		               	
		               	if (index >= urlList.length - 1) 
		                	InterateElements();
		                
			        }).error(function(e) { 
	                    console.error('Vectorectus error: usually poorly formatted JSON files');
	                    console.error(e);  
	                });
	            });
            };
    
    
            if (typeof urls === "string") 	
            	QueueFileRequests([urls]);
            else if (typeof urls === "object" && (urls.constructor === Array))
            	QueueFileRequests(urls);
            	   	
            return this;
        }       
    })
})(jQuery, Raphael);