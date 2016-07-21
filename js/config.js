/**
 * @file File with the configurable variables that might require tweaking.
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */

/**Variable specifying the address of the ElasticSearch server*/
var elasticSearchURL = "http://timeline2016-silverash.rhcloud.com";

/**Variable specifying address of the server to which feedback form is sent*/
var feedbackURL = "TODO"

/**Variable responsible for toggling debug mode for printing debug messages to the console*/
var debug = true;

/**Constant specifying length of the initial text snippet*/
var SHORT_SNIPPET_LENGTH = 100;

/**Constant specifying length of the expanded text snippet*/
var LONG_SNIPPET_LENGTH = 1000;

/**Constant specifying height(in px) of medium thumbnail/icon*/
var DEFAULT_THUMBNAIL_HEIGHT = 250;

/**Constant specifying maximum number of visible pagination pages*/
var MAX_VISIBLE_PAGES = 3;

/**Variable used in the thumbnail size slider. It rescales the original image by those factors. The initial value, i.e. of 1.0 is based on DEFAULT_THUMBNAIL_HEIGHT*/
var scalingTicks = [0.05, 0.5, 1.0, 1.5]; 

