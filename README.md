# Timeline Application

At its current state the application allows to search for documents related to a particular patient in a chronological order. 
Currently you have to manually enter the ID of the desired patient, however, it is expected that in the future the application
is going to be instantiated for a previously specified patient without ability to change it in the runtime.

**NOTE**: There are two main branches of the application, **slam_staging** and **mimic_data**. They are configured to run on 
SLAM staging environment and on the Rosalind cluster respectively. Please clone the appropriate branch.

## Cogstack

It is assumed that the desired documents were run through the cogstack pipeline described in the following: <https://github.com/CogStack/cogstack>
It is expected the documents had PDFs and thumbnails generated as well as they were inserted into an appropriate ElasticSearch index.

#### Configuring the Application
The application can be configured and adjusted by modifying the following file: 
```
js/config.js
``` 

The options available include:

* `elasticSearchURL`
    + **Purpose**: This URL allows specifying the address of the *ElasticSearch* cluster which the application is using for accessing the data.
     When changed, make sure the cluster is formed correctly, all nodes have the same version of the ElasticSearch, etc. 
     Consider creating a dedicated client node for the application to decrease the burden on your master nodes.


* `thumbnailSource`
    + **Purpose**: This URL allows specifying the address of the server hosting thumbnails and PDFs of the indexed documents.
     Make sure the files have the correct paths according to data indexed in the ElasticSearch cluster.
     For example, if *ElasticSearch* query returns the following result:
    
    ```json
    {
        "patientid" : "12345",
        "tikaOutput" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "tlprimarykeyfieldname" : "DocumentID",
        "tlsrccolmnfieldname" : "Attachment_File_Body",
        "tlsrctablename" : "tblAttachment",
        ...
        "documentid" : "67890",
        "documenttimestamp" : "1970-01-01T00:00:00.000"
    }
    ```
    
    Make sure the following files are available:
    `$thumbnailSource/tblAttachment/pdf/tblAttachment_Attachment_File_Body_67890.pdf` 
    and
    `$thumbnailSource/tblAttachment/thumbnail/tblAttachment_Attachment_File_Body_67890.png` 
    
    Generally the documents follow the following structure:
    `$thumbnailSource/$tlsrctablename/pdf/$tlsrctablename_$tlsrccolumnfieldname_$documentid.pdf`
    and
    `$thumbnailSource/$tlsrctablename/thumbnail/$tlsrctablename_$tlsrccolumnfieldname_$documentid.png`

* `elasticSearchLogURL`
    + **Purpose**: This URL allows specifying the address of the *ElasticSearch* cluster to which the application uploads logging
    information regarding application usage, such as downloading particular document, making queries and so on. This feature has 
    not been extensively tested, however, in principle should work.

* `kibanaURL`
    + **Purpose**: This URL allows specifying the address of the *Kibana* server that is connected to the same ElasticSearch cluster.
    This allows for displaying document distribution histograms giving better view into patient history.

* `ES_TYPE`
    + **Default Value**: `""`
    + **Purpose**: Optional setting allowing searching through only a single document type. In the case of mimic_data, 
    this should be set to `eprdoc` as there are unrelated documents in the same index.
    For slam_staging, this can be left blank as all documents (with different types) serve the same purpose.
    
* `ES_INDEX`
    + **Purpose**: Name of the ElasticSearch index with the patient documents.

* `ES_TIME_FIELD`
    + **Purpose**: Name of the field in the ElasticSearch index specifying the documents date. For example, using sample json from `thumbnailSource`,
    it can be `documenttimestamp`.

* `ES_PATIENT_ID_FIELD`
    + **Purpose**: Name of the field in the ElasticSearch index corresponding to the patients' id. For example, using sample json from `thumbnailSource`,
   it can be `patientid`.

* `ES_VERSION`
    + **Purpose**: Version of the REST Api used to query ElasticSearch. It should not be changed unless you understand what you are trying to achieve.

* `KIBANA_INDEX_PATTERN`
    + **Purpose**: Name of the index pattern set in Kibana for accessing the documents.

* `MAX_KIBANA_WIDTH`
    + **Purpose**: Maximum width of the screen on which the Kibana histogram is going to be displayed.

* `debug`
    + **Default value**: `false`
    + **Purpose**: Flag specifying whether additional debug information should be printed to the browser's console.

* `SHORT_SNIPPET_LENGTH` and `LONG_SNIPPET_LENGTH`
    + **Default value**: `200` and `500` (chars)
    + **Purpose**: Length of the text snippets displayed on timeline (SHORT and LONG versions are changed upon double click)
    
* `DEFAULT_THUMBNAIL_HEIGHT`
    + **Default value**: `250` (px)
    + **Purpose**: When thumbnail of a document is pulled from the server, it is resized in order to keep consistency among different documents. This variable specifies initial height of the thumbnail that is modified by `scalingTicks` explained below.

* `scalingTicks`
    + **Default value**: `[0.75, 1.25, 2.0, 3.0]`
    + **Purpose**: Values used by "Thumbnail Size" slider. They represent ratio by which the image will be scaled (using `DEFAULT_THUMBNAIL_HEIGHT`)


#### Searching the Data

Currently, at the first major iteration of the application, user must specify the following information when searching for documents:
* ID of the patient (to be removed when the application is integrated with epjs frontend)
* Start Date; default: 2000-01-01
* End Date; default: date when the search was performed; dates later than that are by default disabled, if necessary it can be changed inside `js/pageControl.js` by modifying or removing:

```javascript
var setFormProperties = function() {
    ...
	datePickerToHandle.datetimepicker({
        ...
		maxDate: new Date(), // this needs modifying/removing
        ...
	});
	...
}
```
* Number of Results per Page; default: 5; options available are: 5, 10, 20 and 50. User testing is required to adjust those values.
* (Optional) Containing; default: empty; free text search on ElasticSearch index. It supports logical operators such as `OR`, `AND`, etc.
For example, one might want to list all documents including word "male" and one of the following "HIV" or "AIDS" using: `male AND (HIV OR AIDS)`
* Thumbnail Size;

### Additional Features

* It is possible to collapse all documents from given month by clicking on given month tag, such as 'Nov 2015'
* You can use arrow up and arrow down to quickly move between the documents
* (Minor, yet helpful) You can press the return key when inside `patient ID` or `Containing` box to initialise search rather than having to click the search button
* Clicking on thumbnail opens it in the centre of the screen

### Known Issues and Solutions:

##### Internet Explorer is not displaying all of the icons and the console logs errors css3111 and css3114.
The issue is due to Internet Explorer blocking 'untrusted fonts'. The problem so far only occured on a Windows 10 machine, however, not much testing on different versions of OS have been performed yet.

In order to solve the issue one must edit *Local Group Policy* appropriately. On Windows 10 the procedure is as follows: 

Run gpedit.msc to open the Local Group Policy Editor and navigate to the following setting:


Computer Configuration > Administrative Templates > System > Mitigation Options.


Untrusted Font Blocking -> Enable -> Do **not** block untrusted fonts