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

/**
 * @name sakai.api.UI.entity
 *
 * @class entity
 *
 */
sakai.api.UI.entity = sakai.api.UI.entity || {};
sakai.api.UI.entity.data = sakai.api.UI.entity.data || {};
sakai.api.UI.entity.render = sakai.api.UI.entity.render || {};

/**
 * @name sakai.entity
 *
 * @class entity
 *
 * @description
 * Initialize the entity widget - this widget provides person / space and content information
 * http://jira.sakaiproject.org/browse/SAKIII-371
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.entity = function(tuid, showSettings){


    /////////////////////////////
    // CONFIGURATION VARIABLES //
    /////////////////////////////

    // Chat status
    var availableStatus = "chat_available_status_";
    var availableStatus_online = availableStatus + "online";
    var availableStatus_busy = availableStatus + "busy";
    var availableStatus_offline = availableStatus + "offline";

    var entitymodes = ["myprofile", "profile", "group", "content"];
    var entityconfig = {
        mode: entitymodes[0], // Set the default entity mode
        data: {
            profile: "",
            count: {
                messages_unread: 0,
                contacts_accepted: 0,
                contacts_invited: 0,
                contacts_pending: 0,
                groups: 0,
                contents: 0
            }
        }
    };
    var profile_dummy_status;

    ///////////////////
    // CSS SELECTORS //
    ///////////////////

    var $rootel = $("#" + tuid);

    // Container
    var $entity_container = $("#entity_container", $rootel);
    var $entity_container_template = $("#entity_container_template", $rootel);
    var $entity_container_actions = $("#entity_container_actions", $rootel);

    // Profile
    var $entity_profile_status;
    var $entity_profile_status_input;
    var entity_profile_status_input_dummy = "entity_profile_status_input_dummy";
    var $entity_profile_status_input_dummy;
    var $entity_profile_status_input_saving;
    var $entity_profile_status_input_saving_failed;

    // Chat status
    var entityProfileChatstatus = "#entity_profile_chatstatus";
    var profileChatStatusClass = ".myprofile_chat_status";
    var profileChatStatusID = "#myprofile_chat_status_";

    // Tags Link
    var tagsLink = "#entity_tags_link";
    var tagsLinkMenu = tagsLink + "_menu";
    //var tagsLinkMenuLink = tagsLink + "_menu" + " a";

    // Locations Link
    var locationsLink = "#entity_locations_link";
    var locationsLinkMenu = locationsLink + "_menu";
    //var locationsLinkMenuLink = locationsLink + "_menu" + " a";

    // Group buttons
    var entityGroup = "#entity_group";
    var entityGroupLeave = entityGroup + "_leave";
    var entityGroupJoin = entityGroup + "_join";
    var entityGroupJoinRequest = entityGroupJoin + '_request';

    // Content buttons
    var entityContentDownload = "#entity_content_download";

    var authprofileURL;

    ////////////////////
    // UTIL FUNCTIONS //
    ////////////////////

    /**
     * Removes the seperated and the add contacts link
     * @param {Object} user The user object we get from the addcontact widget.
     */
    var removeAddContactLinks = function(user) {
         $('#entity_add_to_contacts').hide();
    };

    /**
     * Show or hide the tags link menu
     * @param {String} menuBox menu box we want to display
     * @param {String} menuLink link the user clicked to display the menu box
     * @param {Boolean} hideOnly
     *  true: Hide the menu only
     *  false: Show or hide the menu depending if it's already visible
     */
    var showHideListLinkMenu = function(menuBox, menuLink, hideOnly){
        if ($(menuBox).is(":visible") || hideOnly) {
            $(menuBox).hide();
            $(menuLink).removeClass("entity_list_open");
        } else {
            if ($(tagsLinkMenu).is(":visible") || $(locationsLinkMenu).is(":visible")) {
                // hide other menus if they are open
                $(tagsLinkMenu).hide();
                $(tagsLink).removeClass("entity_list_open");
                $(locationsLinkMenu).hide();
                $(locationsLink).removeClass("entity_list_open");
            }
            $(menuBox).css("left", Math.round($(menuLink).offset().left) + "px");
            $(menuBox).css("top", (Math.round($(menuLink).offset().top) + $(menuLink).height() + 11) + "px");
            $(menuLink).addClass("entity_list_open");
            $(menuBox).show();
        }
    };

    /**
     * Convert a file size to a human readable format (4 MB)
     * @param {Integer} filesize The filesize you want to convert into a human readable one
     * @return {String} A human readable file size
     */
    var convertToHumanReadableFileSize = function(filesize){

        // Divide the length into its largest unit
        var units = [[1024 * 1024 * 1024, 'GB'], [1024 * 1024, 'MB'], [1024, 'KB'], [1, 'bytes']];
        var lengthunits;
        for (var i = 0, j=units.length; i < j; i++) {

            var unitsize = units[i][0];
            var unittext = units[i][1];

            if (filesize >= unitsize) {
                filesize = filesize / unitsize;
                // 1 decimal place
                filesize = Math.ceil(filesize * 10) / 10;
                lengthunits = unittext;
                break;
            }
        }

        // Return the human readable filesize
        return filesize + " " + lengthunits;

    };

    /**
     * Render the main entity template
     */
    var renderTemplate = function(){
        $.TemplateRenderer($entity_container_template, entityconfig, $entity_container);
        $entity_container.show();
    };

    /**
     * Check whether there is a valid picture for the user
     * @param {Object} profile The profile object that could contain the profile picture
     * @return {String}
     * The complete URL of the profile picture
     * Will be an empty string if there is no picture
     */
    var constructProfilePicture = function(profile){

        // if (profile.basic.elements.picture && profile["rep:userId"]) {
        // profile.basic.elements object does not have picture information
        // if there is profile picture and userId
        // return the picture links
        if(profile.picture && profile["rep:userId"]) {

            //change string to json object and get name from picture object
            var picture_name = $.parseJSON(profile.picture).name;

            //return "/~" + profile["rep:userId"] + "/public/profile/" + profile.basic.elements.picture.value.name;
            return "/~" + profile["rep:userId"] + "/public/profile/" + picture_name;
        }
        else {
            return "";
        }

    };

    /**
     * Change the chat status for the current user
     * @param {String} chatstatus The chatstatus you want to update the chatstatus with
     * @param {Function} [callback] A callback function that gets fired after the request
     */
    var changeChatStatus = function(chatstatus){
        sakai.data.me.profile = $.extend(true, sakai.data.me.profile, {"chatstatus": chatstatus});

        if (sakai.data.me.profile.activity)
            delete sakai.data.me.profile.activity;

        if (sakai.data.me.profile["rep:policy"])
            delete sakai.data.me.profile["rep:policy"];

        sakai.api.Server.saveJSON(authprofileURL, sakai.data.me.profile, function(success, data) {
            if (success) {
                $(window).trigger("chat_status_change", chatstatus);
            } else {
                fluid.log("Entity widget - An error occured when sending the status to the server.");
            }
        });
    };

    /**
     * Change the selected value of the dropdown list to the current chat status
     * @param {Object} chatstatus status which has to come up in the dropdown list
     */
    var updateChatStatusElement = function(chatstatus){
        for (var i in $(entityProfileChatstatus)[0].options){
            if ($(entityProfileChatstatus)[0].options[i].value === chatstatus){
                $(entityProfileChatstatus)[0].selectedIndex = i;
                break;
            }
        }
    };

    /**
     * Gets the number of managers in a group
     * @return {String}
     */
    var getGroupManagers = function(){
        $.ajax({
            url: "/system/userManager/group/" + entityconfig.data.profile.authprofile["sakai:group-id"] + "-managers.members.json",
            async: false,
            success: function(data){
                var groupManagers = data;
                entityconfig.data.profile["managerCount"] = groupManagers.length;
                $.each(groupManagers, function(i, val) {
                    if (val["userid"] === sakai.data.me.user.userid) {
                        entityconfig.data.profile["role"] = "manager";
                    }
                });
            }
        });
    };
    
    /**
     * Gets the number of members in a group
     * @return {String}
     */
    var getGroupMembers = function(){
        $.ajax({
            url: "/system/userManager/group/" + entityconfig.data.profile.authprofile["sakai:group-id"] + ".members.json",
            async: false,
            success: function(data){
                var groupMembers = data;
                entityconfig.data.profile["memberCount"] = groupMembers.length;
                $.each(groupMembers, function(i, val) {
                    if (val["userid"] === sakai.data.me.user.userid) {
                        entityconfig.data.profile["role"] = "member";
                    }
                });
            }
        });
    };

    /**
     * Joins the specific group as a member
     * @param {String} Type tells us which button to show
     */
    var showGroupMembershipButton = function(type){
        if (type === 'join') {
            if (entityconfig.data.profile.authprofile["sakai:group-joinable"] === "People can automatically join")
                $(entityGroupJoin).show();
            else if (entityconfig.data.profile.authprofile["sakai:group-joinable"] === "People request to join")
                $(entityGroupJoinRequest).show();
            $(entityGroupLeave).hide();
        } else if (type === 'leave') {
            $(entityGroupJoin).hide();
            $(entityGroupJoinRequest).hide();
            $(entityGroupLeave).show();
        }
    };

    /**
     * Sends a request to the group managers for the user to join as a member
     */
    requestJoinGroup = function(){
        // todo
    };

    /**
     * Joins the specific group as a member
     */
    var joinGroup = function(){
        // add user to group
        $.ajax({
            url: "/system/userManager/group/" + entityconfig.data.profile.authprofile["sakai:group-id"] + ".update.json",
            data: {
                "_charset_":"utf-8",
                ":member": sakai.data.me.user.userid
            },
            type: "POST",
            success: function(data){
    	        sakai.api.Util.notification.show("Group Membership", "You have been added successfully to the Group.");
                showGroupMembershipButton('leave');
            }
        });
    };

    /**
     * Leaves the specific group as a member
     */
    var leaveGroup = function(){
        // remove user from group
        $.ajax({
            url: "/system/userManager/group/" + entityconfig.data.profile.authprofile["sakai:group-id"] + ".update.json",
            data: {
                "_charset_":"utf-8",
                ":member@Delete": sakai.data.me.user.userid
            },
            type: "POST",
            success: function(data){
    	        sakai.api.Util.notification.show("Group Membership", "You have been successfully removed from the Group.");
                showGroupMembershipButton('join');
            }
        });
    };

    /////////////
    // BINDING //
    /////////////

    /**
     * Add binding to the profile status elements
     */
    var addBindingProfileStatus = function(){

        // We need to reinitialise the jQuery objects after the rendering
        $entity_profile_status = $("#entity_profile_status", $rootel);
        $entity_profile_status_input = $("#entity_profile_status_input", $rootel);
        $entity_profile_status_input_dummy = $("#entity_profile_status_input_dummy", $rootel);
        $entity_profile_status_input_saving = $("#entity_profile_status_input_saving", $rootel);
        $entity_profile_status_input_saving_failed = $("#entity_profile_status_input_saving_failed", $rootel);

        // Add the focus event to the profile status status
        $entity_profile_status_input.bind("focus", function(){

            // If we don't have the dummy status (e.g. What are you doing) variable set yet, set it now.
            if (!profile_dummy_status) {
                profile_dummy_status = $entity_profile_status_input_dummy.text();
            }

            // Check whether the status field has the dummy class
            if ($entity_profile_status_input.hasClass(entity_profile_status_input_dummy)) {

                // Clear the current value for the input box and remove the dummy class
                $entity_profile_status_input.val("");
                $entity_profile_status_input.removeClass(entity_profile_status_input_dummy);
            }

        });

        // Add the blur event to the profile status
        $entity_profile_status_input.bind("blur", function(){

            // Check if it still has a dummy
            if (!$entity_profile_status_input.hasClass(entity_profile_status_input_dummy) && $.trim($entity_profile_status_input.val()) === "") {

                // Add the dummy class
                $entity_profile_status_input.addClass(entity_profile_status_input_dummy);

                // Set the input value to the dummy status (e.g. What are you doing)
                $entity_profile_status_input.val(profile_dummy_status);

            }
        });

        // Add the submit event to the status form
        $entity_profile_status.bind("submit", function(){

            var originalText = $("button span", $entity_profile_status).text();
            $("button span", $entity_profile_status).text(sakai.api.Security.saneHTML($entity_profile_status_input_saving.text()));

            // Get the correct input value from the user
            var inputValue = $entity_profile_status_input.hasClass(entity_profile_status_input_dummy) ? "" : $.trim($entity_profile_status_input.val());

            sakai.data.me.profile = $.extend(true, sakai.data.me.profile, {"status": inputValue});

            if (sakai.data.me.profile.activity)
                delete sakai.data.me.profile.activity;

            if (sakai.data.me.profile["rep:policy"])
                delete sakai.data.me.profile["rep:policy"];

            //trigger chat_status_message_change to update the status message on chat widget.
            $(window).trigger("chat_status_message_change", inputValue);

            sakai.api.Server.saveJSON(authprofileURL, sakai.data.me.profile, function(success, data) {
               if (success) {
                   // Set the button back to it's original text
                   $("button span", $entity_profile_status).text(sakai.api.Security.saneHTML(originalText));

                   // Create an activity item for the status update
                   var nodeUrl = authprofileURL;
                   var activityMsg = "Status: " + inputValue;

                   var activityData = {
                       "sakai:activityMessage": activityMsg
                   };
                   sakai.api.Activity.createActivity(nodeUrl, "status", "default", activityData);
               } else {
                   // Log an error message
                   fluid.log("Entity widget - the saving of the profile status failed");

                   // Show the message about a saving that failed to the user
                   $("button span", $entity_profile_status).text(sakai.api.Security.saneHTML($entity_profile_status_input_saving_failed.text()));

                   // Show the origin text after 5 min
                   window.setTimeout(function(){
                       $("button span", $entity_profile_status).text(sakai.api.Security.saneHTML(originalText));
                   }, 5000);
               }
            });
        });

    };

    /**
     * Add binding to elements related to chat status
     */
    var addBindingChatStatus = function(){
        // Add the change event to the chatstatus dropdown
        $(entityProfileChatstatus).bind("change", function(ev){
            changeChatStatus($(ev.target).val());
        });
    };

    /**
     * Add binding to elements related to tag drop down
     */
    var addBindingTagsLink = function(){
        // Add the click event to the tagsLink link
        $(tagsLink).bind("click", function(){
            showHideListLinkMenu(tagsLinkMenu, tagsLink, false);
        });
    };

    /**
     * Add binding to elements related to locations drop down
     */
    var addBindingLocationsLink = function(){
        // Add the click event to the locationsLink link
        $(locationsLink).bind("click", function(){
            showHideListLinkMenu(locationsLinkMenu, locationsLink, false);
        });
    };

    /**
     * Remove contact button after contact request is sent
     */
    var removeAddContactLinks = function(user){
        $('#entity_add_to_contacts').hide();
    };

    /**
     * Add binding to add contact button
     */
    var addBindingAddContact = function(){
        // A user want to make a new friend
        $('#entity_add_to_contacts').live("click", function() {
            var contactclicked = entityconfig.data.profile["rep:userId"];
            sakai.addtocontacts.initialise(contactclicked, sakai.entity.removeAddContactLinks);
        });
    };

    /**
     * Add binding to elements related to tag drop down
     */
    var addBindingGroup = function(){
        // Add the click event to the leave group button
        $(entityGroupLeave).bind("click", function(){
            leaveGroup();
        });

        // Add the click event to the join group button
        $(entityGroupJoin).bind("click", function(){
            joinGroup();
        });

        // Add the click event to the join group request button
        $(entityGroupJoinRequest).bind("click", function(){
            requestJoinGroup();
        });

        if (entityconfig.data.profile.role === "member")
            showGroupMembershipButton('leave');
        else if (entityconfig.data.profile.role !== "manager")
            showGroupMembershipButton('join');
    };

    /**
     * Add binding to various elements on the entity widget
     */
    var addBinding = function(){
        if(entityconfig.mode === "profile" || entityconfig.mode === "myprofile"){
            // Add binding to the profile status elements
            addBindingProfileStatus();

            // Add binding related to chat status
            addBindingChatStatus();
        }

        if(entityconfig.mode === "profile"){
            // Add binding to add contact button
            addBindingAddContact();

            // Add binding to available to chat link
            $('#entity_available_to_chat').live("click", function() {
                // todo
            });
        }

        if(entityconfig.mode === "group"){
            // Add binding to group related buttons
            addBindingGroup();

            // Add binding to locations box
            addBindingLocationsLink();
        }

        if(entityconfig.mode === "content"){
            // Add binding to content related buttons
            $(entityContentDownload).bind("click", function(){
                window.open(entityconfig.data.profile.path);
            });

            // Add binding to locations box
            addBindingLocationsLink();
        }

        // Add binding to elements related to tag drop down
        addBindingTagsLink();
    };

    /**
     * Set the profile data for the user such as the status and profile picture
     */
    var setProfileData = function(){
        // Set the profile picture for the user you are looking at
        // /~admin/public/profile/256x256_profilepicture
        entityconfig.data.profile.picture = constructProfilePicture(entityconfig.data.profile);

        // Set the status for the user you want the information from
        if (entityconfig.data.profile.basic && entityconfig.data.profile.basic.elements.status) {
            entityconfig.data.profile.status = entityconfig.data.profile.status;
        }

        // set the url to POST the status updates to
        authprofileURL = "/~" + entityconfig.data.profile["rep:userId"] + "/public/authprofile";

        if (!entityconfig.data.profile.chatstatus) {
            entityconfig.data.profile.chatstatus = "online";
        }
    };

    /**
     * Set the data for the content object information
     * @param {Object} data The data we need to parse
     */
    var setContentData = function(data){
        if(!data){
            fluid.log("Entity widget - setContentData - the data parameter is invalid:'" + data + "'");
            return;
        }

        var filedata = data.data;
        var jcr_content = filedata["jcr:content"];
        var jcr_access = filedata["rep:policy"];

        entityconfig.data.profile = {};

        // Check whether there is a jcr:content variable
        if (jcr_content) {

            // Set the person that last modified the resource
            if (jcr_content["jcr:lastModifiedBy"]) {
                entityconfig.data.profile.lastmodifiedby = jcr_content["jcr:lastModifiedBy"];
            }
            // Set the last modified date
            if (jcr_content["jcr:lastModified"]) {
                entityconfig.data.profile.lastmodified = $.timeago(new Date(jcr_content["jcr:lastModified"]));
            }
            // Set the size of the file
            if (jcr_content[":jcr:data"]) {
                entityconfig.data.profile.filesize = convertToHumanReadableFileSize(jcr_content[":jcr:data"]);
            }
            // Set the mimetype of the file
            if (jcr_content["jcr:mimeType"]) {
                entityconfig.data.profile.mimetype = jcr_content["jcr:mimeType"];
            }
        }

        // Check if user is a manager or viewer
        entityconfig.data.profile["role"] = "viewer";
        if (jcr_access) {
            // check if user is a manager
            $.each(jcr_access, function(index, resultObject) {
                if (resultObject["rep:principalName"] === sakai.data.me.user.userid) {
                    if ($.inArray("jcr:all", resultObject["rep:privileges"]) != 1) {
                        entityconfig.data.profile["role"] = 'manager';
                    }; 
                }
            });
        }

        // Set the created by and created (date) variables
        if (filedata["jcr:createdBy"]) {
            entityconfig.data.profile.createdby = filedata["jcr:createdBy"];
        }
        if (filedata["jcr:created"]) {
            entityconfig.data.profile.created = $.timeago(new Date(filedata["jcr:created"]));
        }

        // Set the filename of the file
        if(filedata["sakai:pooled-content-file-name"]){
            entityconfig.data.profile.name = filedata["sakai:pooled-content-file-name"];
        }
        // e.g. http://localhost:8080/~admin/private/3739036439_2418af9b4d_o.jpg
        // to 3739036439_2418af9b4d_o.jpg
        else if(data.url){
            var splitslash = data.url.split("/");
            entityconfig.data.profile.name = splitslash[splitslash.length -1];
        }

        // Set the path of the resource
        if(data.url){
            entityconfig.data.profile.path = data.url;
        }
        // Set the contentpath of the resource
        if(data.url){
            entityconfig.data.profile.contentpath = data.contentpath;
        }

        // Set the description of the resource
        if (filedata["sakai:description"]) {
            entityconfig.data.profile.description = filedata["sakai:description"];
        }

        // Set the tags of the resource
        if (filedata["sakai:tags"]) {
            entityconfig.data.profile['sakai:tags'] = filedata["sakai:tags"].toString();
        }

        // Set the copyright of the file
        if (filedata["sakai:copyright"]) {
            entityconfig.data.profile.copyright = filedata["sakai:copyright"];
        }
    };

    /**
     * Get the data for a specific mode
     * @param {String} mode The mode you want to get the data for
     * @param {Object} [data] The data you received from the page that called this (can be undefined)
     * @param {Function} [callback] A callback function that will be fired it is supplied
     */
    var getData = function(mode, data){

        switch (mode) {
            case "profile":
                entityconfig.data.profile = $.extend(true, {}, data);
                // Set the correct profile data
                setProfileData();
                break;
            case "myprofile":
                // Set the profile for the entity widget to the personal profile information
                // We need to clone the sakai.data.me.profile object so we don't interfere with it
                entityconfig.data.profile = $.extend(true, {}, sakai.data.me.profile);
                //get data from sakai.data.me object and set in the entityconfig
                setData();
                // Set the correct profile data
                setProfileData();
                break;
            case "group":
                entityconfig.data.profile = data;
                // determine if user has access to the group and get the count of members
                getGroupMembers();
                // determine if user has access to the manager group and get the count of managers
                getGroupManagers();
                break;
            case "content":
                setContentData(data);
                break;
        }

        if(entityconfig.mode ==="content" && !data){
            return;
        }

        // Render the main template
        renderTemplate();

        // Add binding
        addBinding();

    };

    /**
     * Set data.
     * For example:
     * No. Unread messages
     * No. of Contacts
     * No. invited contacts
     * No. of pending request
     * No. of group
     *
     */
    var setData = function(){
        //no. of unread messages
        entityconfig.data.count.messages_unread = sakai.data.me.messages.unread;

        //no. of contacts
        entityconfig.data.count.contacts_accepted = sakai.data.me.contacts.accepted;

        //no. of contacts invited
        entityconfig.data.count.contacts_invited = sakai.data.me.contacts.invited;

        //no. of pending requests
        entityconfig.data.count.contacts_pending = sakai.data.me.contacts.pending;

        //no. of groups user is memeber of
        entityconfig.data.count.groups = sakai.data.me.groups.length;
    }

    /**
     * Get content data and then call method to get data for the appropriate mode
     * @param {String} mode The mode in which you load the entity widget
     * @param {Object} data A JSON object containing the necessary data - the structure depends on the mode
     * to display Contents: no. Items
     *
     */
    var getContentData = function(mode, data){
        //make an ajax call to get content data
        $.ajax({
            url: "/var/search/pool/me/manager.json?q=*",
            type: "GET",
            success: function(d, textStatus){
                entityconfig.data.count.contents = d.total;

                // Change the mode for the entity widget
                entityconfig.mode = mode;

                // Get the data for the appropriate mode
                getData(entityconfig.mode, data);
            },
            error: function(xhr, textStatus, thrownError){
                alert("An error has occured");
            }
        });
    };

    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Init function for the entity widget
     * @param {String} mode The mode in which you load the entity widget
     * @param {Object} data A JSON object containing the necessary data - the structure depends on the mode
     */

    sakai.api.UI.entity.render = function(mode, data){

        // Clear the previous containers
        $entity_container.empty().hide();
        $entity_container_actions.empty();

        //Get the content data
        getContentData(mode, data);
    };

    $(window).trigger("sakai.api.UI.entity.ready", {});

    // Add binding to update the chat status
    $(window).bind("chat_status_change", function(event, newChatStatus){
        updateChatStatusElement(newChatStatus)
    });

};
sakai.api.Widgets.widgetLoader.informOnLoad("entity");