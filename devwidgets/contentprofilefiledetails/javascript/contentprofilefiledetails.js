/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $, Config, fluid, window */

var sakai = sakai || {};

sakai.contentprofilefiledetails = function(tuid, showSettings){


    ///////////////
    // Variables //
    ///////////////

    var anon = false;

    // path variables
    var contentPath = "";

    // Containers
    var contentProfileFileDetailsContainer = "#content_profile_file_details_container";

    // Buttons
    var contentProfileFileDetailsActionDownload= "#content_profile_file_details_action_download";
    var contentProfileFileDetailsActionDelete= "#content_profile_file_details_action_delete";
    var contentProfileFileDetailsActionUpload = "#upload_content";
    var contentProfileFileDetailsViewRevisions = "#content_profile_details_view_revisions";

    var fileRevisions = [];
    var profileData = [];

    var addBinding = function(){
        // Bind the download button
        $(contentProfileFileDetailsActionDownload).bind("click", function(){
            window.open(contentPath + "/" + profileData["sakai:pooled-content-file-name"]);
        });

        // Open the delete content pop-up
        $(contentProfileFileDetailsActionDelete).bind("click", function(){
            sakai.deletecontent.init(profileData);
        });
    };

    /**
     * Convert given date object to readable date string
     * @param {Object} date Date object
     */
    var getFormattedDate = function(date){
        var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        var day = date.getDate();
        var month = months[date.getMonth()];
        var year = date.getFullYear();
        var formattedDate = day + " " + month + " " + year;
        return formattedDate;
    }

    var renderDetails = function(){
        // Construct the JSON object
        // Create a readable data to display
        var lastModified = getFormattedDate(new Date(profileData["jcr:content"]["jcr:lastModified"]));
        var created = getFormattedDate(new Date(profileData["jcr:created"]));
        var json = {
            data: profileData,
            lastModified : lastModified,
            created: created,
            revisions: fileRevisions,
            mode: "content",
            url: contentPath,
            filesize: sakai.api.Util.convertToHumanReadableFileSize(profileData["jcr:content"][":jcr:data"]),
            anon : anon
        };

        // Set the global JSON object (we also need this in other functions + don't want to modify this)
        globalJSON = $.extend(true, {}, json);

        // And render the basic information
        var renderedTemplate = $.TemplateRenderer("content_profile_file_details_template", json);
        var renderedDiv = $(document.createElement("div"));
        renderedDiv.html(renderedTemplate)
        $("#content_profile_file_details_container").html(renderedDiv);
        // Show the file details container
        $("#content_profile_file_details_container").show();

        // Add binding
        addBinding();

        // Add classes
        $(contentProfileFileDetailsActionUpload).data("hashpath", "contentpath_" + contentPath.split("/p/")[1]);
    }

    var loadRevisions = function(){
        $.ajax({
            url: contentPath + ".versions.json",
            success: function(data){
                fileRevisions = [];
                for (var i in data["versions"]) {
                    var item = {
                        "data" : data["versions"][i]
                    }
                    fileRevisions[fileRevisions.length] = item;
                }
                renderDetails();
            },
            error: function(xhr, textStatus, thrownError){
                sakai.api.Util.notification.show("Failed loading revisions", "Failed to load file revision information");
            }
        });
    }

    var loadContentProfile = function(){
        // Check whether there is actually a content path in the URL
        if (contentPath) {
            $.ajax({
                url: contentPath + ".2.json",
                success: function(data){
                    data.path = contentPath;
                    profileData = data;
                    // Load the revisions of this file
                    loadRevisions();
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show("Failed loading data", "Failed to load file information");
                }
            });
        }
    };

    /**
     * Check if the user is a manager or not and set the anon variable accordingly
     */
    var checkFileManager = function(){
        $.ajax({
            url: contentPath + ".members.json",
            success: function(data){
                var managers = $.parseJSON(data).managers;
                if (managers.length !== 0) {
                    for (var i in managers) {
                        if (managers[i].userid === sakai.data.me.user.userid) {
                            anon = false;
                            loadContentProfile();
                            break;
                        }
                        else {
                            anon = true;
                        }
                    }
                }
                else {
                    anon = true;
                    loadContentProfile();
                }
            },
            error: function(xhr, textStatus, thrownError){
                anon = true;
                loadContentProfile();
            }
        });
    };

    var doInit = function(){
        if (sakai.data.me.user.anon) {
            anon = true;
        }
        // Bind an event to window.onhashchange that, when the history state changes,
        // loads all the information for the current resource
        $(window).bind('hashchange', function(e){
            contentPath = e.getState("content_path") || "";

            if (sakai.data.me.user.anon) {
                anon = true;
                loadContentProfile();
            } else {
                checkFileManager();
            }
        });

        // Since the event is only triggered when the hash changes, we need to trigger
        // the event now, to handle the hash the page may have loaded with.
        $(window).trigger('hashchange');
    };

    $(contentProfileFileDetailsViewRevisions).live("click",function(){
        sakai.filerevisions.initialise(profileData);
    });

    $(window).bind("sakai-fileupload-complete", function(){
        doInit();
    })

    doInit();
};
sakai.api.Widgets.widgetLoader.informOnLoad("contentprofilefiledetails");