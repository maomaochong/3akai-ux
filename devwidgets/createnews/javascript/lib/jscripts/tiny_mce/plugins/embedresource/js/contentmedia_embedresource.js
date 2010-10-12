/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $, Config, fluid, AIM, window, doPaging, get_cookie, Querystring */

var sakai = sakai || {};

sakai.pickresource = function(){
  
    ////////////////////
    // Help variables //
    ////////////////////

    var options = {};                // Contains the different search options
    var globaldata = {};            // Contains the data of the files for the current page
    var selectedFiles = {};            // Object with the files that are currently selected
    var basicUploadFilename = "";    // The filename when you use the basic upload
    var enableFolder = false;        // Enable seeing folder or not

    // Paging
    var pageCurrent = 0;            // The page you are currently on
    var pageSize = 1000;            // How many items you want to see on 1 page

    // Search URL mapping
    var searchURLmap = {
        allfiles : sakai.config.URL.SEARCH_ALL_FILES_SERVICE,
        mybookmarks : sakai.config.URL.SEARCH_MY_BOOKMARKS,
        mycontacts : sakai.config.URL.SEARCH_MY_CONTACTS,
        myfiles : sakai.config.URL.SEARCH_MY_FILES,
        mysites : sakai.config.URL.SEARCH_MY_SITES
    };


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var jqPagerClass = ".jq_pager";

    var contentmediaId = "#contentmedia";

    var contentmediaFilesContainer = contentmediaId + "_files_container";
    var contentmediaUploaderBasicSuccessful = contentmediaId + "_uploader_basic_successful";
    
    
    var resourceDetailsContainer = "#resource_details_container";

    // Class
    var contentmediaAccordionListClass = "contentmedia_accordion_list";
    var contentmediaDisabledClass = "contentmedia_disabled";
    var contentmediaDropActiveClass = "contentmedia_drop_active";
    var contentmediaDropHoverClass = "contentmedia_drop_hover";
    var contentmediaHiddenClass = "contentmedia_hidden";
    var contentmediaFileClass = "contentmedia_file";
    var contentmediaFileSelectedClass = "contentmedia_file_selected";
    var contentmediaSelectedItemClass = "contentmedia_selecteditem";
    var contentmediaViewClass = "contentmedia_view";
    var contentmediaViewThumbnailClass = contentmediaViewClass + "_thumbnail";
    var contentmediaHoverClass = "contentmedia_hover";

    // Template
    var contentmediaAccordionListSiteTemplate = "contentmedia_accordion_list_site_template";
    var contentmediaDragTooltipTemplate = "contentmedia_drag_tooltip_template";
    var contentmediaDropMessageTemplate = "contentmedia_drop_message_template";
    var contentmediaDialogRemoveListTemplate = "contentmedia_dialog_remove_list_template";
    var contentmediaFilesContainerTemplate = "contentmedia_files_container_template";
    var contentmediaListTitleTemplate = "contentmedia_list_title_template";
    var contentmediaUploaderBasicSuccessfulTemplate = "contentmedia_uploader_basic_successful_template";
    var resourceDetailsContainerTemplate = "resource_details_container_template";

    // Accordion
    var contentmediaAccordion = contentmediaId + "_accordion";
    var contentmediaAccordionList = contentmediaAccordion + "_list";
    var contentmediaAccordionListSite = contentmediaAccordionList  + "_site";
    var contentmediaAccordionListSiteBookmarks = contentmediaAccordionListSite + "_bookmarks";
    var contentmediaAccordionListTag =  contentmediaAccordionList  + "_tag";

    // Actions
    var contentmediaActionsEdit = contentmediaId + "_actions_edit";
    var contentmediaActionsRemove = contentmediaId + "_actions_remove";
    var contentmediaActionsView = contentmediaId + "_actions_view";
    var contentmediaActionsViewList = contentmediaActionsView + "_list";
    var contentmediaActionsViewThumbnail = contentmediaActionsView + "_thumbnail";

    // Context
    var contentmediaContextFilter = contentmediaId + "_context_filters";
    var contentmediaContextFilterMyfiles = contentmediaContextFilter + "_myfiles";

    // Dialogs
    var contentmediaDialog = contentmediaId + "_dialog";
    var contentmediaDialogAssociations = contentmediaDialog + "_associations";
    var contentmediaDialogAssociationsMove = contentmediaDialogAssociations + "_move";
    var contentmediaDialogAssociationsMoveAll = contentmediaDialogAssociationsMove + "_all";
    var contentmediaDialogAssociationsMoveSelected = contentmediaDialogAssociationsMove + "_selected";
    var contentmediaDialogAssociationsSelect = contentmediaDialogAssociations + "_select";
    var contentmediaDialogAssociationsSelectAll = contentmediaDialogAssociationsSelect + "_all";
    var contentmediaDialogAssociationsSelectSelected = contentmediaDialogAssociationsSelect + "_selected";
    var contentmediaDialogAssociationsTrigger = contentmediaDialogAssociations + "_trigger";
    var contentmediaDialogEdit = contentmediaDialog + "_edit";
    var contentmediaDialogPermissions = contentmediaDialog + "_permissions";
    var contentmediaDialogPermissionsTrigger = contentmediaDialogPermissions + "_trigger";
    var contentmediaDialogRemove = contentmediaDialog + "_remove";
    var contentmediaDialogRemoveConfirm = contentmediaDialogRemove + "_confirm";
    var contentmediaDialogRemoveDecline = contentmediaDialogRemove + "_decline";
    var contentmediaDialogRemoveList = contentmediaDialogRemove + "_list";
    var contentmediaDialogUploader = contentmediaDialog + "_uploader";

    // Drag Drop
    var contentmediaDragTooltipClass = "contentmedia_drag_tooltip";
    var contentmediaDrop = contentmediaId + "_drop";
    var contentmediaDropMessage = contentmediaDrop + "_message";

    // Folders
    var contentmediaFolders = contentmediaId + "_folders";
    var contentmediaFoldersTrigger = contentmediaFolders + "_trigger";

    // List
    var contentmediaListTitle = contentmediaId + "_list_title";

    // Pop up
    var contentmediaContent = ".contentmedia_content";
    var contentmediaContentWrapper = contentmediaContent + "_wrapper";

    // Search
    var contentmediaSearch = contentmediaId + "_search";
    var contentmediaSearchButton = contentmediaSearch + "_button";

    // Uploader
    var contentmediaUploader = contentmediaId + "_uploader";
    var contentmediaUploaderBasic = contentmediaUploader + "_basic";
    var contentmediaUploaderBasicName = contentmediaUploaderBasic + "_name";
    var contentmediaUploaderTrigger = contentmediaUploader + "_trigger";

    // File Ownership
    var searchMyFiles = "#search_my_files";
    var searchAllFiles = "#search_all_files";

    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Method to sort a select element with different option elements
     * @param {Object} element The select element that needs to be sorted
     */
    var sortOptions = function(element){
        var sortedVals = $.makeArray($(element + ' option')).sort(function(a,b){
            return $(a).text() > $(b).text() ? 1: -1;
        });
        $(element).empty().html(sortedVals);
    };

    /**
     * Returns a formated file size
     * @param {Int} bytes Number of bytes you want to show
     * @param {Array} suffixes Array of suffixes used to show the formated filesize
     */
    var filesizeFormat = function(bytes, suffixes){
        var b = parseInt(bytes, 10);
        var s = suffixes || ['byte', 'bytes', 'KB', 'MB', 'GB'];
        if (isNaN(b) || b === 0) { return '0 ' + s[0]; }
        if (b == 1)              { return '1 ' + s[0]; }
        if (b < 1024)            { return  b.toFixed(2) + ' ' + s[1]; }
        if (b < 1048576)         { return (b / 1024).toFixed(2) + ' ' + s[2]; }
        if (b < 1073741824)      { return (b / 1048576).toFixed(2) + ' '+ s[3]; }
        else                     { return (b / 1073741824).toFixed(2) + ' '+ s[4]; }
    };

    /**
     * Format the date for a file
     * @param {String} date_input Date that needs to be formatted
     */
    var dateFormat = function(date_input){
        var date = new Date(date_input);
        return $.L10N.transformDate(date);
    };

    /**
     * Add the session id to the url so the user is authenticated.
     * This is to solve the flash cookie bug.
     * @param {String} url The url where you want to add the session to
     */
    var getServerUrl = function(url){
        return url + ";jsessionid=" + encodeURIComponent(get_cookie("JSESSIONID"));
    };


    /**
     *
     * @param {Object} data  JSON object with all of the files to be displayed on the
     * screen. An example of the data model can be found in /devwidgets/contentmedia/json/files.json
     */
     
    var doFileRenderFiltered = function(data) {
        resultWrapper = {};
        resultWrapper.results = data;
        resultWrapper.total = data.length;
        // Set the globaldata variable
        globaldata = resultWrapper;

        // only display embeddable types of resources
        filteredResults = [];
        for (var i = 0; i < globaldata.results.length; i++) {
            var contentType = globaldata.results[i]["Content-Type"];
            if (contentType.split("/")[0] == "image") {
                if (contentType.split("/")[1] != 'tiff' && contentType.split("/")[1] != 'vnd.microsoft.icon') {
                    filteredResults.push(globaldata.results[i]);
                }
            } else if (contentType.split("/")[0] == "video") {
                filteredResults.push(globaldata.results[i]);
            }
        }

        globaldata.results = filteredResults;

        // Set the formatted file size and format the date
        for (var i = 0; i < globaldata.results.length; i++) {
            if (globaldata.results[i].filesize) {
                globaldata.results[i].formattedFilesize = filesizeFormat(globaldata.results[i].filesize);
                globaldata.results[i].formattedDateModified = dateFormat(sakai.api.Util.parseSakaiDate(globaldata.results[i]["jcr:lastModified"]));
            }
        }

        // Render files;
        $(contentmediaFilesContainer).html($.TemplateRenderer(contentmediaFilesContainerTemplate, globaldata));
        $(resourceDetailsContainer).html($.TemplateRenderer(resourceDetailsContainerTemplate, globaldata));

    };
     
    var doFileRender = function(data){
      resultWrapper = {};
      resultWrapper.results = data;
      resultWrapper.total = data.length;
      // Set the globaldata variable
      globaldata = resultWrapper;

       // Set the formatted file size and format the date
       for(var i = 0; i < globaldata.results.length; i++){
          if(globaldata.results[i].filesize){
              globaldata.results[i].formattedFilesize = filesizeFormat(globaldata.results[i].filesize);
              globaldata.results[i].formattedDateModified = dateFormat(sakai.api.Util.parseSakaiDate(globaldata.results[i]["jcr:lastModified"]));
          }
       }
      

      // Render files
      $(contentmediaFilesContainer).html($.TemplateRenderer(contentmediaFilesContainerTemplate, globaldata));
      $(resourceDetailsContainer).html($.TemplateRenderer(resourceDetailsContainerTemplate, globaldata));
    };

    /**
     *
     * @param {Object} options  identifier for the current context, initial search
     *   query and initial tag filter
     *   {
     *        "context" : "myfiles", "allfiles", ...,
     *        "site": false or ["/sites/test"]
     *        "search" : false or "searchquery",
     *        "tag" : false or ["tag1","tag2","tag3"],
     *        "page" : 0
     *    }
     */
    var doFileSearch = function(_options){

        // Make sure we have actual values
        options.context = _options.context || "myfiles";
        options.search = _options.search || "*";
        options.tag = _options.tag || false;
        options.site = _options.site || false;

        // Set the title of the file list
        //$(contentmediaListTitle).html($.Template.render(contentmediaListTitleTemplate, options));

        var url = "";

        // Check if there is a site defined, if so we need to change the url to all files
        if(options.site.length > 0){
            url = searchURLmap.allfiles;
        }else {
            url = searchURLmap[options.context];

            if(options.context === "myfiles"){
                $(contentmediaContextFilterMyfiles).addClass(contentmediaSelectedItemClass);
            }
        }

        var usedIn = [];
        if(options.site[0]){
            usedIn = options.site[0].path;
        }

        // Until search service is fixed we attach a star to the options
        if (options.search !== "*") {
            options.search = options.search + "*";
        }

        // Request the file data
        $.ajax({
            url: url,
            data: {
                "q" : options.search,
                "context" : options.context,
                "page" : pageCurrent,
                "items" : pageSize,
                "sakai:tags" : options.tag,
                "usedin" : usedIn
            },
            cache: false,
            success: function(data){
                doFileRenderFiltered(data);
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occured");
            }
        });
    };



    /**
     * Set the context filter to a specific term
     * @param {String} term The term that needs to be searched
     */
    var setContextFilter = function(term){
        // Set the value of the context filter to the term passed by the function
        options.context = term;
    };

    /**
     * Set the site filter for the site
     * @param {String} site The site that needs to be set
     */
    var setSiteFilter = function(sitepath, sitename){

        // Set the site object to an empty array
        options.site = [];

        // Construct the site object with a path and name
        var site = {
            path : sitepath,
            name : sitename
        };

        // Set the site filter
        options.site.push(site);
    };

    /**
     * Remove the context filter
     */
    var removeContextFilter = function(){

        // Set the value of the context filter to an empty string
        options.context = "";

        // Remove the selected status of the current selected context and site
        $(contentmediaContextFilter + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
        //$(contentmediaAccordionListSite + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
    };

    /**
     * Remove the site filter
     */
    var removeSiteFilter = function(){

        // Set the value of the site filter to an empty array
        options.site = [];

        // Remove the selected status of the current selected context and site
        //$(contentmediaContextFilter + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
        $(contentmediaAccordionListSite + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
    };

    /**
     * Remove the context site filter
     */
    var removeContextSiteFilter = function(){

        removeContextFilter();
        removeSiteFilter();
    };


    /**
     * Run over all the files in the selected files and check if there is
     */
    var updateMaintainerSelectedFiles = function(){

        selectedFiles.maintainer = false;

        // Only run over the array if there are any files in it
        // otherwise the user can not edit or remove the files
        if(selectedFiles.items.length > 0){
            for(var i = 0; i <= selectedFiles.items.length; i++){
                if(i === selectedFiles.items.length){
                    selectedFiles.maintainer = true;
                    break;
                }
                if(selectedFiles.items[i].maintainer === false){
                    break;
                }
            }
        }

        enableDisableEditDelete();
    };

    /**
     * Add a file to the selected files
     * @param {Integer} index The index of the selected file
     */
    var addToSelectedFiles = function(index){

        // Add the file to the selected files array
        selectedFiles.items.push(globaldata.results[index]);

        updateMaintainerSelectedFiles();
    };

    /**
     * Remove a file from the selected files
     * @param {Object} index The index of the file that needs to removed from the list
     */
    var removeFromSelectedFiles = function(index){

        // Run across files in the selected files array
        // and remove the file where the URL is the same as the globaldata index file
        // (the URL is the only unique thing)
        for(var i = 0; i < selectedFiles.items.length; i++){
            if(selectedFiles.items[i].URL === globaldata.results[index].URL){
                selectedFiles.items.splice(i, 1);
                break;
            }
        }

        updateMaintainerSelectedFiles();
    };

    /**
     * Set the view for listing the files
     * @param {Object} view
     */
    var setView = function(view){

        // Set the class name
        var className = contentmediaViewClass + "_" + view;

        // Check if the files container already has that class
        if(!$(contentmediaFilesContainer).hasClass(className)){

            // If not, remove all classes
            $(contentmediaFilesContainer).removeClass();

            // Add the new class
            $(contentmediaFilesContainer).addClass(className);
        }
    };


    ////////////////////
    // Event Handlers //
    ////////////////////
    /**
     * Search by file owner
     */
    $(searchMyFiles).live("click", function(ev) {
      options.context = "myfiles";
      options.search = "*";
      options.site = [];
      doFileSearch(options);
    });
    
    $(searchAllFiles).live("click", function(ev) {
      options.context = "allfiles";
      options.search = "*";
      options.site = [];
      doFileSearch(options);
    });


    /**
     * This will select / deselect files when clicked
     */
    $("." + contentmediaFileClass).live("click", function(ev){

        // Get the index of the file
        var splitId = this.id.split("_");
        var index = parseInt(splitId[splitId.length -1], 10);
        $("." + contentmediaFileSelectedClass).removeClass(contentmediaFileSelectedClass);
        $(this).addClass(contentmediaFileSelectedClass);
        $(".contentmedia_fileinfo").hide();
        $("#contentmedia_fileinfo_" + index).show();
        $(".mceActionPanel input").removeAttr('disabled');
    });

    /**
     * Set or remove the context filter
     */
    $("#contentmedia_accordion_list_site a").live("click", function(){
        if ($(this).hasClass(contentmediaSelectedItemClass)){

            // Remove the context/site filter
            removeContextSiteFilter();
        }else{

            // Remove the context/site filter
            removeContextSiteFilter();

            // Add the selected class to the site you selected
            $(this).addClass(contentmediaSelectedItemClass);

            // Set the site filter
            var allText = $(this).text();
            var pathText = $("." + contentmediaHiddenClass, this).text();
            setSiteFilter(pathText, allText.replace(pathText, ""));
        }
        options.context = "allfiles"; // always search within allfiles instead of myfiles
        options.search = "*";
        // Fetch the files with or without a context filter
        doFileSearch(options);
    });


    /**
     * When the search input gets focus from the cursor, add the
     * selected class and empty the input box
     */
    $(contentmediaSearch + " input").focus(function(){
        if (!$(this).hasClass("selected")){
            $(this).addClass("selected");

            // Empty the input box
            $(this).val("");
        }
    });

    /**
     * Hide/show the permission tab
     */
    $(contentmediaDialogPermissionsTrigger).live("click", function(){
        $(contentmediaDialogAssociations).hide();
        $(contentmediaDialogPermissions).show();
    });

    /**
     * Hide/show the associations tab
     */
    $(contentmediaDialogAssociationsTrigger).live("click", function(){
        $(contentmediaDialogPermissions).hide();
        $(contentmediaDialogAssociations).show();
    });

    /**
     * Enable/disable the buttons when you change your selection
     */
    $(contentmediaDialogAssociationsSelectAll).change(function(){
        enableDisableMoveButtons();
    });

    /**
     * Enable/disable the buttons when you change your selection
     */
    $(contentmediaDialogAssociationsSelectSelected).change(function(){
        enableDisableMoveButtons();
    });

    /**
     * Button that moves the files from the all box to the selected box
     * when you click it
     */
    $(contentmediaDialogAssociationsMoveSelected).live("click", function(){

        var sitesArray = [];

        $(contentmediaDialogAssociationsSelectAll + " :selected").each(function(i, selected){
            $(contentmediaDialogAssociationsSelectSelected).append(selected);
            sitesArray.push(selected.value);
        });

        enableDisableMoveButtons();

        sortOptions(contentmediaDialogAssociationsSelectSelected);

        var movedFiles = {};
        movedFiles.kind = "site";
        // Deep clone the array
        movedFiles.dropped = sitesArray;

        sendTagSitePost(movedFiles, null);

    });

    /**
     * Move the files from the selected box to the all box
     */
    $(contentmediaDialogAssociationsMoveAll).live("click", function(){
        $(contentmediaDialogAssociationsSelectSelected + " :selected").each(function(i, selected){
            $(contentmediaDialogAssociationsSelectAll).append(selected);
        });
        enableDisableMoveButtons();

        sortOptions(contentmediaDialogAssociationsSelectAll);
    });

    ///////////////////////
    // Initial functions //
    ///////////////////////

    /**
     * Initialise the search box
     */
    var initialiseSearch = function(){
        // Catch the search for files
        $(contentmediaSearch + " form").submit(function(){

            // Get the value from the input box
            var searchvalue = $(contentmediaSearch + " form input").val();

            // Check if there is anything in the search box
            if(searchvalue.replace(/ /g,'').length > 0){

                // Set the search option to the value the person entered
                options.search = searchvalue;
                options.site = [];
                options.context = "allfiles"; // because its single-mode, default to allfiles
                // Fetch the list of files
                doFileSearch(options);
            }else {

                // We check if there is a current search keyword or not
                // if there is one, we remove the search filter, otherwise we do nothing
                if(options.search){

                    // Set the search option to false
                    options.search = false;

                    // Fetch the files without the search filter
                    options.site = [];
                    options.context = "allfiles"; // because its single-mode, default to allfiles
                    doFileSearch(options);
                }
            }

            return false;
        });

        /**
         * Bind the search button
         */
        $(contentmediaSearchButton).live("click", function(){

            // Execute the submit event on the parent form
            $(this).parents().filter("form").trigger("submit");
        });

    };

    /**
     * This event is fired at the end of an upload cycle when all the files have either been uploaded,
     * failed to upload, the user stopped the upload cycle,
     * or there was an unrecoverable error in the upload process and the upload cycle was stopped.
     * @param {Array} fileList The list of File objects that "completed" (either succeeded or failed), in this upload.
     */
    var uploadCompleteListener = function(fileList){
        doFileSearch(options);
    };

    /**
     * Set the various settings for the fluid uploader component
     */
    var initialiseUploader = function(){

        // Show the Uploader's markup immediately, since we're not using progressive enhancement.
        $(".fl-progEnhance-basic").hide();
        $(".fl-progEnhance-enhanced").show();

        var myUpload = fluid.progressiveEnhanceableUploader(".flc-uploader", ".fl-progEnhance-basic", {
            uploadManager: {
                type: "fluid.swfUploadManager",

                options: {
                    // Set the uploadURL to the URL for posting files to your server.
                    uploadURL: getServerUrl(Config.URL.UPLOAD_URL),

                    // This option points to the location of the SWFUpload Flash object that ships with Fluid Infusion.
                    flashURL: "/dev/_lib/Fluid/fluid-components/swfupload/swfupload.swf"

                    // Hide the postparams because we do not need to create a link (for now) -- if we upload files into sites, we do
                    /*var linkUrl = "/sites/test/_files";
                    var siteUrl = "/sites/test";
                    postParams: {
                        "link" : linkUrl,
                        "site" : siteUrl
                    }*/
                }
            },
            decorators: [{
                type: "fluid.swfUploadSetupDecorator",
                options: {
                     // This option points to the location of the Browse Files button used with Flash 10 clients.
                    flashButtonImageURL: "/dev/_images/uploader/browse.png"
                }
            }],
            listeners: {
                //afterFileQueued: myQueueListenerFunc
                afterUploadComplete : uploadCompleteListener
            }

        });

        // Set the settings for when the users uses the single file uploader (without flash)
        /*$(".fl-progEnhance-basic").submit(function() {
            if($(contentmediaUploaderBasicName).val().length > 3){
                basicUploadFilename = $(contentmediaUploaderBasicName).val();
                $(contentmediaUploaderBasicName).attr("name", basicUploadFilename);
            }

            return AIM.submit(this, {'onStart' : startUpload, 'onComplete' : completeUpload});
        });*/
    };




    /**
     * Parse the querystring from the browser
     */
    var parseQueryString = function(){
        var querystring = new Querystring();

        // Check if the querystring contains the site id of a site
        if(querystring.contains("siteid")){
            var siteid = querystring.get("siteid");

            $.ajax({
                url: sakai.config.URL.SITE_CONFIGFOLDER.replace("__SITEID__", siteid) + ".json",
                cache: false,
                success: function(data){
                    var parsedData = data;
                    setSiteFilter(Config.URL.SITE_CONFIGFOLDER.replace("__SITEID__", siteid), parsedData.name);

                    // Fetch the initial list of files
                    doFileSearch(options);
                },
                error: function(xhr, textStatus, thrownError) {
                    //alert("An error has occured");
                }
            });
        }else{
            // Fetch the initial list of files
            doFileSearch(options);
        }
    };

    /**
     * Load sites for the current user
     * @param {Object} sites Object response from JSON
     */
    var loadSites = function(sites){
        var jsonSites = {};
        jsonSites.items = sites;
        // Render the template with the selected files
        $.TemplateRenderer(contentmediaAccordionListSiteTemplate, jsonSites, $(contentmediaAccordionListSite));
    };

    /**
     * Initialise the sites tab
     */
    var initialiseSites = function(){
        $.ajax({
            url: sakai.config.URL.SITES_SERVICE,
            cache: false,
            success: function(data){
                data = data.results;
                loadSites(data);
            }
        });
    };

    /**
     * Initialise the pickresource
     * @param {Object} _options  identifier for the current context, initial search
     *   query and initial tag filter
     *   {
     *        "context" : "All Files" or "/sites/siteid",
     *        "search" : false or "searchquery",
     *        "tag" : false or ["tag1","tag2","tag3"],
     *         "page" : 0
     *    }
     */
    sakai.pickresource.initialise = function(_options){
        // Save options object
        options = _options;

        // Initialize the selected files object
       // resetSelectedFiles();

        // Disable the edit and delete link on startup
        //updateMaintainerSelectedFiles();

        // Show the lightbox
        $(contentmediaContent).show();

        // Set the view to thumbnails
        setView("list");

        // Parse the querystring in the browser
        parseQueryString();

        // Check if we have the enableFolder function on or not
        if (!enableFolder) {

            // Hide the contentmedia folders tab if the enableFolder is false
            // We have to use the remove event, otherwise you'll see a big gap on the bottom
            $(contentmediaFolders).remove();
            $(contentmediaFoldersTrigger).remove();
        }else{

            // Initialise the tree for folder
            //initialiseTree();
        }

        // Initialise the uploader
        //initialiseUploader();

        // Accordion functionality
        $(contentmediaAccordion).accordion({
            //fillSpace: true
            autoHeight: false
        });

        // Initialise search
        initialiseSearch();

        // Initialise the sites tab
        initialiseSites();
        
        
    };
    
    sakai.pickresource.initialise({
        "context" : "myfiles",
        "q" : "*",
        "tag" : [],
        "site" : []
    });
};

sakai.api.Widgets.Container.registerForLoad("sakai.pickresource");