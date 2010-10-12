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

/*global $, Config */

var sakai = sakai || {};

/**
 * @name sakai.createnews
 *
 * @class createnews
 *
 * @description
 * createnews widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.createnews = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var MAX_LENGTH = 30;
    // - ID
    var createnews = "#createnews";
    // Container
    var createnewsContainer = createnews + "_container";
    // template containers
    var createnewsAddTemplate = "#noncourse_template_container";
    // Non course
    var createnewsAdd = createnews + "_add";    
    var createnewsAddContent = createnewsAdd + "_content";    
    var createnewsAddTitle = createnewsAdd + "_title";
    var createnewsAddProcess = createnewsAdd + "_process";
    var createnewsAddSuccess = createnewsAdd + "_success";
       
    var createnewsAddSave = createnewsAdd + "_save";
    var createnewsAddSaveNew = createnewsAddSave + "_new";
    var createnewsAddSaveCancel = createnewsAddSave + "_cancel";
    
    // CSS Classes
    var invalidFieldClass = "invalid";

    ///////////////////////
    // Utility functions //
    ///////////////////////
    
    var hideAllTips = function(){
        $("#createnews_add_process").hide();
        $("#createnews_add_success").hide();
        $("#title_empty").hide();
        $("#content_empty").hide();
        $("#pic_empty").hide();
        $("#pic_format").hide();
    };
    
    var showProcess = function(show){
        hideAllTips();
        if(show){
            $(createnewsAddSaveNew).hide();
            $(createnewsAddSaveCancel).hide();
            $(createnewsAddProcess).show();
        } else {
            $(createnewsAddProcess).hide();
            $(createnewsAddSaveNew).show();
            $(createnewsAddSaveCancel).show();
        }
    };
    
    var showSuccess = function(show){
        hideAllTips();
        if(show){
            $(createnewsAddSuccess).show();
        } else {
            $(createnewsAddSuccess).hide();
        }
    };
    
    var showAlert = function(id){
        hideAllTips();
        $("#" + id).show();
        setTimeout(function() {
            $("#" + id).hide();
        }, 5000);
    };

    var setNull = function(){
        $(createnewsAddTitle).val("");
        // tinyMCE.getInstanceById(sakai.news.getEditorID()).getBody().innerHTML = "";
    };

    ///////////////////
    // Create a news//
    //////////////////
    
    /////////////
    // jqModal //
    /////////////
    
    /**
     * Public function that can be called from elsewhere
     * (e.g. chat and sites widget)
     * It initializes the createnews widget and shows the jqmodal (ligthbox)
     */
    sakai.createnews.initialise = function(){
        $(createnewsContainer).jqmShow();
        $(".content_fields").show();
        tinyMCE.init({
            mode : "textareas",
            theme : "advanced",
            height : "300",
            width : "460"
        });
        $("#createnews_add_title").val("");
    };
    
    var myShow = function(hash) {
        $(".content_fields").show();
        tinyMCE.init({
            mode : "textareas",
            theme : "advanced",
            height : "300",
            width : "460"
        });
        $("#createnews_add_title").val("");
        $("#file").val("");
        hideAllTips();
        
        hash.w.show();
    };
    
    var myClose = function(hash) {
        showSuccess(false);
        showProcess(false);
        
        $(".mceEditor").remove();
        
        hash.o.remove();
        hash.w.hide();
    };

    /*
     * Add jqModal functionality to the container.
     * This makes use of the jqModal (jQuery Modal) plugin that provides support
     * for lightboxes
     */
    $(createnewsContainer).jqm({
        modal: true,
        overlay: 20,
        toTop: true,
        onShow: myShow,
        onHide: myClose
    });
    
    ////////////////////
    // Event Handlers //
    ////////////////////

    /*
     * Add binding to the save button (create the group when you click on it)
     */
    
    
    /////////////////////////////
    // Initialisation function //
    /////////////////////////////
    var uploadInit = function(){
        $(function(){
            $("#upload_pic").ajaxForm({
                beforeSubmit: function(data){
                    if(!$("#file").val()) {
                        showAlert("pic_empty");
                        return false;
                    }else{
                        var split = $("#file").val().split(".");
                        var fileFormat = split[split.length - 1];
                        if(!(fileFormat === "gif" || fileFormat === "png" || fileFormat === "jpg" || fileFormat === "jpeg")){
                            showAlert("pic_format");
                            return false;
                        }
                    }
                },
                success: function(data){
                    var $responseData = $.parseJSON(data.replace("<pre>", "").replace("</pre>", ""));
                    for (var i in $responseData) {
                        if ($responseData.hasOwnProperty(i)) {
                            var insertImg = "<img src=/p/" + $responseData[i] + ">";
                            tinyMCE.getInstanceById(sakai.news.getEditorID()).getBody().innerHTML += insertImg;
                        }
                    }
                },
                error : function(){
                    alert("Upload error!");
                }
            });
            
            $("#upload_pic").submit(function () {
                // validate args
                if($("#file").val()) {
                    return AIM.submit(this, {
                        'onStart' : startCallback,
                        'onComplete' : completeCallback
                    });
                } else {
                    // no input, show error
                    return false;
                }
            });
            
            var startCallback = function() {
                return true;
            };
            
            var completeCallback = function(response) {
            };
            
            var AIM = {
            
                frame : function(c) {
                    var n = 'f' + Math.floor(Math.random() * 99999);
                    var d = document.createElement('DIV');
                    d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="AIM.loaded(\''+n+'\')"></iframe>';
                    document.body.appendChild(d);
            
                    var i = document.getElementById(n);
                    if (c && typeof(c.onComplete) === 'function') {
                        i.onComplete = c.onComplete;
                    }
                    return n;
                },
            
                form : function(f, name) {
                    f.setAttribute('target', name);
                },
            
                submit : function(f, c) {
                    AIM.form(f, AIM.frame(c));
                    if (c && typeof(c.onStart) === 'function') {
                        return c.onStart();
                    } else {
                        return true;
                    }
                },
            
                loaded : function(id) {
                    var i = document.getElementById(id);
                    var d = null;
                    if (i.contentDocument) {
                        d = i.contentDocument;
                    } else if (i.contentWindow) {
                        d = i.contentWindow.document;
                    } else {
                        d = window.frames[id].document;
                    }
                    if (d.location.href === "about:blank") {
                        return;
                    }
            
                    if (typeof(i.onComplete) === 'function') {
                        i.onComplete(d.body.innerHTML);
                    }
                }
            };
            
            $("#upload_pic").attr("action", "/system/pool/createfile");
        });
    };

    var doInit = function(){
        setNull();
        uploadInit();
    };
        
    doInit();
};


sakai.api.Widgets.widgetLoader.informOnLoad("createnews");