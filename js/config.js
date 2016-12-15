/**
 * @file File with the configurable variables that might require tweaking.
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */

/**Variable specifying the address of the ElasticSearch server*/
var elasticSearchURL = "http://localhost:9200/"; //"http://192.168.99.47:9200";

/**Variable specyfying address of the server with the thumbnails and PDFs of the documents*/
// var thumbnailSource = "http://192.168.99.42:8080/thumbs/"
var thumbnailSource = "tempdummy/";//"http://localhost:8114/";

/**Address of ES instance responsible for getting log data*/
var elasticSearchLogURL = "http://localhost:9200/"

/**Variable specifying address of the server receiving answers from the feedback form*/
var feedbackURL = "http://localhost:81";

/**Variable specyfing address of a Kibana Server (that is connected to the ElasticSearch instance) */
var kibanaURL = "http://localhost:5601";

/**Variable responsible for toggling debug mode for printing debug messages to the console*/
var debug = false;

/**Constant specifying length of the initial text snippet*/
var SHORT_SNIPPET_LENGTH = 100;

/**Constant specifying length of the expanded text snippet*/
var LONG_SNIPPET_LENGTH = 500;

/**Constant specifying height(in px) of medium thumbnail/icon*/
var DEFAULT_THUMBNAIL_HEIGHT = 250;

/**Constant specifying maximum number of visible pagination pages*/
var MAX_VISIBLE_PAGES = 3;

/**Constant specyfing maximum width of screen for which the Kibana graph is allowed to be displayed*/
var MAX_KIBANA_WIDTH = 768; // 768 seems to be safe for tablets that are apparently popular among clinitians

/**Variable used in the thumbnail size slider. It rescales the original image by those factors. The initial value, i.e. of 1.0 is based on DEFAULT_THUMBNAIL_HEIGHT*/
var scalingTicks = [0.5, 1.25, 2.0, 3.0];

/**Variable specifying the text used for the snippet in case the processing have failed*/
var PROCESSING_ERROR_TEXT = "Unfortunately this document was not processed successfully and it is impossible to display in on the timeline. Try to view it using the legacy application instead and please contact us about it, so we could try to fix it.";