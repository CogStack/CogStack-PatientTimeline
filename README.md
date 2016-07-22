# Timeliner Application

At its current state the application allows to search the database for documents related to particular patient in a chronological order. 

**NOTE**: If you are running it on SLAM machine, make sure you clone **production** branch, **not** **master**. Master will work on local machine, as it pulls data from dummy *ElasticSearch* server and uses placeholder thumbnails.

#### Configuring the Application
The application contains a configurable 
```
/js/config.js
``` 
file that allows adjusting particular settings one might want to change. The following options are available:

* `elasticSearchURL`
    + **Default value**: `"http://192.168.99.47:9200"`
    + **Purpose**: This URL allows specifying the address of the *ElasticSearch* cluster from which the application is pulling the data. When changed, make sure the cluster is initialised correctly, i.e. on the main path has JSON similar to the following:

    ```json
    {
        "status" : 200,
        "name" : "576846b189f5cfe6d70000b1",
        "cluster_name" : "elasticsearch-576846b189f5cfe6d70000b1",
        "version" : {
            "number" : "1.7.1",
            "build_hash" : "b88f43fc40b0bcd7f173a1f9ee2e97816de80b19",
            "build_timestamp" : "2015-07-29T09:54:16Z",
            "build_snapshot" : false,
            "lucene_version" : "4.10.4"
        },
        "tagline" : "You Know, for Search"
    }
    ```

* `thumbnailSource`
    + **Default value**: `"http://192.168.99.42:8080/thumbs"`
    + **Purpose**: This URL allows specifying the address of the server hosting thumbnails and PDF versions of the indexed documents. Make sure the files are on the correct path as indexed on the *ElasticSearch* machine. For example, if *ElasticSearch* query returns the following result:
    
    ```json
    {
        "docId" : "12345",
        "html" : "some xhtml code",
        "patientId" : "67890",
        "srcCol": "Attachment_File_Body",
        "srcTable" : "tblAttachmentFile",
        "thumbnail" : "67890_tblAttachmentFile_12345.png",
        "timestamp" : 0,
        "updateTime" : "1970-01-01 00:00:00"
    }
    ```
    
make sure the appropriate files are available at:
`http://192.168.99.42:8080/thumbs/67890_tblAttachmentFile_12345.png` and `http://192.168.99.42:8080/thumbs/67890_tblAttachmentFile_12345.pdf`

* `feedbackURL`
    + **Default value**: `"TODO"`
    + **Purpose**: This feature is not fully implemented yet due to server not being setup, however, once it is done, the user feedback will be sent to it. The JSON sent will be an array of objects where first of them will contain patientId, startDate, endDate and any keywords inputed (if user decides to send feedback before filling any of those fields, the feedback will contain default data, ex. 1970-01-01 for starting data or today's date for ending date). The next objects will simply contain "question" field and "answer" field for each question in the questionnaire. 

* `debug`
    + **Default value**: `true`
    + **Purpose**: Simple variable specyfing if debug information should be printed to the browser console.

* `SHORT_SNIPPET_LENGTH` and `LONG_SNIPPET_LENGTH`
    + **Default value**: `100` and `1000` (chars)
    + **Purpose**: When data was pulled from a dummy *ElasticSearch* instance, where text field quality did not suffer from the precision of OCR, snippet of content was displayed. Initially it had length of `SHORT_SNIPPET_LENGTH` of chars(but ensured words are completed) and when double clicked it increased to length of `LONG_SNIPPET_LENGTH`

* `DEFAULT_THUMBNAIL_HEIGHT`
    + **Default value**: `250` (px)
    + **Purpose**: When thumbnail of a document is pulled from the server, it is resized in order to keep consistency among different documents. This variable specifies initial height of the thumbnail that is modified by `scalingTicks` explained below.

* `scalingTicks`
    + **Default value**: `[0.05, 0.5, 1.0, 1.5]`
    + **Purpose**: Those values controls the 'Thumbnail Size' slider. The slider has four major 'ticks', i.e. : 'Tiny', 'Small', 'Medium', 'Big' which values are represented by the array. The final height of a thumbnail is simply product of `DEFAULT_THUMBNAIL_HEIGHT` and whatever an user has selected using the slider.

* `MAX_VISIBLE_PAGES`
    + **Default value**: `3`
    + **Purpose**: This constant is directly related to pagination. It controls how many page 'links' can be visible at once.



#### Searching the Data

Currently, at the first iteration of the application, user must specify the following information when searching for documents:
* ID of the patient (to be removed when the application is connected to the CDR)
* Start Date; default: 1970-01-01; there are **no** found issues when searching for documents older than this. Also you cannot choose start date that is bigger than end date.
* End Date; default: date when the search was performed; dates later than that are by default disabled, if neccessary it can be changed inside `/js/pageControl.js` by modifying or removing:

```javascript
var setFormProperties = function() {
    ...
	$('#datePickerTo').datetimepicker({
        ...
		maxDate: new Date(), // this needs modifying/removing
        ...
	});
	...
}
```
Moreover you cannot end date that is smaller than start date.

* Number of Results per Page; default: 5; options available are: 5, 10, 20 and 50. This still requires performance testing on target machines to determine most optimal choices. 
* (Optional) Containing; default: empty; if user specifies any keyword he wants to include in the search conditions, *ElasticSearch* will only return documents that contain that phrase somewhere in their content. 
* Thumbnail Size;

### Additional Features

* It is possible to collapse all documents from given month by clicking on given month tag, such as 'Nov 2015'
* You can use arrow up and arrow down to quickly move between the documents
* (Minor, yet helpful) You can press the return key when inside patientID or Containing box to initialise search rather than clicking the button
* Clicking on thumbnail opens it in the centre of the screen

### Known Issues and Solutions:

##### Internet Explorer is not displaying all of the icons and the console logs errors css3111 and css3114.
The issue is due to Internet Explorer blocking 'untrusted fonts'. The problem so far only occured on a Windows 10 machine, however, not much testing on different versions of OS have been performed yet.

In order to solve the issue one must edit *Local Group Policy* appropriately. On Windows 10 the procedure is as follows: 

Run gpedit.msc to open the Local Group Policy Editor and navigate to the following setting:


Computer Configuration > Administrative Templates > System > Mitigation Options.


Untrusted Font Blocking -> Enable -> Do **not** block untrusted fonts