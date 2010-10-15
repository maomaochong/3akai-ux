var sakai = sakai || {};

sakai.news = function(){    
    var news = "news";
    var newsClass = ".news";
    var newsID = "#news";
    
    var newsTable = newsID + "_table";
    var newsTableTR = newsClass + "_tr";
    var newsListContainer = newsID + "_list_container";
    var newsTableTemplate = newsID + "_" + news + "_template";
    var newsDetailBacktoList = newsID + "_detail_backto_news_list";
    
    var newsTitle = newsClass + "_title";
    var newsDetail = newsID + "_detail";
    var newsDetailTitle = newsDetail + "_title";
    var newsDetailBody = newsDetail + "_body";
    var newsDetailContainer = newsDetail + "_container";
    var newsDetailContent = newsDetail + "_content";
    var newsDetailContentTemplate = newsDetailContent + "_template";
    
    var newsOperation = newsClass + "_operation";
    var newsOperationIconEdit = newsOperation + "_icon_edit";
    var newsOperationIconDelete = newsOperation + "_icon_delete";
    
    var createNews =  "#createnews";
    var createNewsLink = createNews + "_link";
    var createNewsContainer = createNews + "_container";
    var createNewsAdd = createNews + "_add";
    var createNewsAddTitle = createNewsAdd + "_title";
    var createNewsAddContent = createNewsAdd + "_content";
    
    var createnewsAddSuccess = createNewsAdd + "_success";
    var createnewsAddProcess = createNewsAdd + "_process";
    
    var createNewsTipNew = createNews + "_tip_new";
    var createNewsTipEdit = createNews + "_tip_edit";
    var createNewsAddSave = createNewsAdd + "_save";
    var createnewsAddSaveNew = createNewsAddSave + "_new";
    var createnewsAddSaveEdit = createNewsAddSave + "_edit";
    var createnewsAddSaveCancel = createNewsAddSave + "_cancel";
    
    var newsDetailOptionEdit = "#news_detail_option_edit";
    var newsDetailOptionDelete = "#news_detail_option_delete";
    
    var newsGeneralMessagesDeleted_1 = "#news_generalmessages_deleted_1";
    
    var messagesForTypeCat;
    var messagesPerPage = 4;// default 4 messages per page
    var currentPage = 1;
    var mceNum = 0;
    var newsall = {};
    var newsID = "";
    var editCounter = 1;
    var newsEditID = "";
    var allNews = [];

    
    ///////////////////////////
    // Load and display news //
    ///////////////////////////
    var showGeneralMessage = function(msg, isError) {
        // Check whether to show an error type message or an information one
        var type = isError ? sakai.api.Util.notification.type.ERROR : sakai.api.Util.notification.type.INFORMATION;
        // Show the message to the user
        sakai.api.Util.notification.show("", msg, type);
    };
    
    var setID = function(id) { newsID = id; };
    
    var getID = function() { return newsID; };
    
    //judge user's right
    var userRightJudgement = function(){
      var me = sakai.data.me;
      if(sakai.api.Security.saneHTML(sakai.api.User.getProfileBasicElementValue(me.profile, "firstName")) === "Admin"){
        $(".have_right_to_show").show();
      }
    };
    
    var hideAllTips = function(){
        $("#createnews_add_process").hide();
        $("#createnews_add_success").hide();
        $("#createnews_title_empty").hide();
        $("#createnews_content_empty").hide();
        $("#createnews_pic_empty").hide();
        $("#createnews_pic_format").hide();
    };
/*    
    var showProcess = function(show){
        if(show){
            $(createnewsAddSaveNew).hide();
            $(createnewsAddSaveEdit).hide();
            $(createnewsAddSaveCancel).hide();
            $(createnewsAddProcess).show();
        } else {
            $(createnewsAddSaveNew).hide();
            $(createnewsAddProcess).hide();
            $(createnewsAddSaveEdit).show();
            $(createnewsAddSaveCancel).show();
        }
    };
   
    var showSuccess = function(show){
        if(show){
            $(createnewsAddSuccess).show();
        } else {
            $(createnewsAddSuccess).hide();
        }
    };
*/     
    var showAlert = function(id){
        hideAllTips();
        $("#" + id).show();
        setTimeout(function() {
            $("#" + id).hide();
        }, 5000);
    };
    
    var removeAllMessagesOutDOM = function() {
        $("#news_message").remove();
    };
    
    var loadnewsall = function() {
         $.ajax({
//          url: "/devwidgets/news/pages/data/sakainews.json",
            url: "/system/news",
            type: "GET",
            data:{
              "action":"allList"
            },
            success: function(data) {
              if(data.success){
                if (data.newsList.length === 0) {
                  $(newsTableTR).hide();
                }else{
                  allNews = data.newsList;
                  newsall = data;
                  messagesForTypeCat = data.newsList.length;
                  showPage(currentPage);
                  // showPage(1);
                }
              }
              else{
                $(newsListAllError).show();
              }
            },
            error: function() {
              alert("loadnewsall error");
            }
        });
    };
    
    var getAllMessages = function(pageNumber){      
        var data1 = [];
        for (var i = 0, j=0; i < messagesForTypeCat; i++) {
          if (!data1[j]) {
            data1[j] = $.parseJSON('{"success":"true","newsList": []}');
          }
            data1[j].newsList[i] = newsall.newsList[i];
          if (i % messagesPerPage == messagesPerPage - 1) {j++;}
        }
        $("#main_content_container").html($.TemplateRenderer(newsTableTemplate, data1[pageNumber-1]));
        userRightJudgement();
        newsOperationAction();
    };
     
    var showPage = function(pageNumber) {
        // Remove all messages
        // remove previous messages
        removeAllMessagesOutDOM();
        // Set the pager
        pageMessages(pageNumber);
        // Show set of messages
        getAllMessages(pageNumber);
        currentPage = pageNumber;
    };
    
    var pageMessages = function(pageNumber) {
        $("#news_pager").pager({
            pagenumber: pageNumber,
            pagecount: Math.ceil(messagesForTypeCat / messagesPerPage),
            buttonClickCallback: showPage
        });
    };

    // Gets a specific news from the JCR and display
    var loadNewsByID = function(newsid) {
        $.ajax({
            //url: "/devwidgets/news/pages/data/onenews.json",
            url: "/system/news",
            type: "GET",
            data:{
                "action":"get",
                "id":newsid,
            },
            success: function(data) {
                var news = data.news;
                if(data.success === true){
                    $(newsDetailContent).html($.TemplateRenderer(newsDetailContentTemplate, news));
                    $(newsDetailContent).show();
                }
                else{
//                    alert("新闻不存在或已删除");
                    showGeneralMessage($("#news_generalmessages_deleted_x").text(), false);
                }
            },
            error: function(xhr, textStatus, thrownError) {
                alert("loadNewsByID error");
            }
        });
    };
    
    sakai.news.getEditorID = function() {
        return 'mce_' + (mceNum*2 - 1);
    };
    
    var getEditNews = function(id){
        $.ajax({
            url: "/system/news",
            data: {
                "action":"get",
                "id":id,
            },
            type: "GET",
            success: function(data){
                if(data.success == true)
                {
                    var news = data.news;
                    $(createNewsAddTitle).val(news.title);
                    tinyMCE.getInstanceById(sakai.news.getEditorID()).getBody().innerHTML = news.content;
                }else {
                    alert("新闻不存在，或已被删除");
                    $(createNewsContainer).jqmHide();
                }
            },
            error: function(data){
                alert("getEditNews error");
            }
        });
    };
    
    var saveEditNews = function(id,title,content,pictureURI){
        $.ajax({
            url: "/system/news",
            data: {
              "action":"update",
              "id":id,
              "title":title,
              "content":content,
              "pictureURI":pictureURI,
            },
            type: "POST",
            success: function(data){
                if(data.success === true)
                {
//                    showProcess(false);
//                    showSuccess(true);

                    loadnewsall();
                    $(createNewsContainer).jqmHide();
                }
            },
            error: function(data){
                alert("saveEditNews error");
            },
        });
    };
    
    var saveNewNews = function(title,content,pictureURI){
        $.ajax({
            url: "/system/news",
            data: {
                "action":"add",
                "title":title,
                "content":content,
                "pictureURI":pictureURI,
            },
            type: "POST",
            success: function(data){
//                showProcess(false);
                if(data.success === true){
//                   showSuccess(true);
                   loadnewsall();
                   $(createNewsContainer).jqmHide();
                }
            },
            error: function(data){
                alert("saveNewNews error");
            },
        });
    };

    
    
    /////////////////
    // Delete news //
    /////////////////
    var deleteNews = function(newsid){
        $.ajax({
            url: "/system/news",
            type: "POST",
            data: {
                "action": "delete",
                "id": newsid
            },
            success: function(data) {
                if(data.success === true)
                {
//                  alert("ok");
                    showGeneralMessage($(newsGeneralMessagesDeleted_1).text(), false);
                    loadnewsall();
                    showContainer("list");
                }else {
                    if($(newsDetailContainer).is(":visible")) {
                        // showAlert("detail_cannt_delete");
                    }else {
                        // showAlert("list_cannt_delete");
                    }
//                    alert("此新闻已被删除！");
                    showGeneralMessage($("#news_generalmessages_deleted_x").text(), false);
                }
            },
            error: function(xhr, textStatus, thrownError) {
                alert("Cann't delete the news!");
            }
        });
    };
    
    ///////////////////////
    // Utility functions //
    ///////////////////////
    
    var showProcess = function(show, type){
        if(show){
            $(createnewsAddSaveEdit).hide();
            $(createnewsAddSaveNew).hide();
            $(createnewsAddSaveCancel).hide();
            $(createnewsAddProcess).show();
        } else {
            $(createnewsAddProcess).hide();
            if(type === "new"){
                $(createnewsAddSaveCancel).show();
                $(createnewsAddSaveNew).show();
            }else if(type === "edit"){
                $(createnewsAddSaveCancel).show();
                $(createnewsAddSaveEdit).show();
            }
        }
    };
    
    var showSuccess = function(show, type){
        if(show){
            $(createnewsAddSaveEdit).hide();
            $(createnewsAddSaveNew).hide();
            $(createnewsAddSaveCancel).hide();
            $(createnewsAddSuccess).show();
        } else {
            $(createnewsAddSuccess).hide();
            if(type === "new"){
                $(createnewsAddSaveCancel).show();
                $(createnewsAddSaveNew).show();
            }else if(type === "edit"){
                $(createnewsAddSaveCancel).show();
                $(createnewsAddSaveEdit).show();
            }
        }
    };
    
    // Switch to the list or a specific news
    var showContainer = function(type) {
        if(type === "undefined"){return;}
        if(type === "list"){
            $(newsDetailContainer).hide();
            $(newsListContainer).show();
        }else if(type === "detail"){
            $(newsDetailContainer).show();
            $(newsListContainer).hide();
        }
    };
    
    // This function will redirect the user to the login page.
    var redirectToLoginPage = function() {
        document.location = sakai.config.URL.GATEWAY_URL;
    };
    
    ////////////////////
    // Event Handling //
    ////////////////////
    
    //add the edit and delete icon
    var newsOperationAction = function(){
        $(newsTableTR).live("mouseover", function(e){
            $(this).children(newsOperation).children(newsOperationIconEdit).show();
            $(this).children(newsOperation).children(newsOperationIconDelete).show();
        });
        $(newsTableTR).live("mouseout", function(e){
            $(this).children(newsOperation).children(newsOperationIconEdit).hide();
            $(this).children(newsOperation).children(newsOperationIconDelete).hide();
        });
    };
    
    //edit a news
    $(newsOperationIconEdit).live("click", function(ev){
        // sakai.createnews.initialise();
        mceNum++;
        $(createNewsContainer).jqmShow();
        $(createNewsTipEdit).show();
        $(createnewsAddSaveEdit).show();
        $(createNewsTipNew).hide();
        $(createnewsAddSaveNew).hide();
        $(createnewsAddSaveCancel).show(); 
        showProcess(false, "edit");
        
        var title = $(this).parent().siblings("#news_title_td").children()[0].text;
        var id = $(this).parent().siblings("#news_title_td").children()[0].id;
        setID(id);
        if(editCounter == 1){
            getEditNews(id);
            getEditNews(id);
            editCounter = 0;
        }else{
            getEditNews(id);
        }
    });
    
    $(newsDetailOptionEdit).live("click", function(ev){
        // sakai.createnews.initialise();
        mceNum++;
        $(createNewsContainer).jqmShow();
        $(createNewsTipEdit).show();
        $(createnewsAddSaveEdit).show();
        $(createNewsTipNew).hide();
        $(createnewsAddSaveNew).hide();
        $(createnewsAddSaveCancel).show(); 
        showProcess(false, "edit");
        
        var title = $(newsDetailTitle).html();
        var id = $("#news_id").html();
        setID(id);
        if(editCounter == 1){
            getEditNews(id);
            getEditNews(id);
            editCounter = 0;
        }else{
            getEditNews(id);
        }
    });
    
    $(createnewsAddSaveEdit).live("click", function(ev){
        var Title = $(createNewsAddTitle).val();
        var Content = tinyMCE.getInstanceById(sakai.news.getEditorID()).getBody().innerHTML;
        if(Title === ""){
            showAlert("title_empty");
        }else if(Content === ""){
            showAlert("content_empty");
        }else{
            showProcess(true, "edit");
            saveEditNews(getID(),Title,Content,"");
            if($(newsDetailContainer).is(":visible")) {
                loadNewsByID(getID());
            }
        }
        
        showProcess(false, "edit");
        showSuccess(false, "edit");
    });
    
    //add a news
    $(createNewsLink).live("click", function(ev){
        // sakai.createnews.initialise();
        mceNum++;
        $(createNewsContainer).jqmShow();
        $(createNewsTipEdit).hide();
        $(createnewsAddSaveEdit).hide();
        $(createNewsTipNew).show(); 
        $(createnewsAddSaveNew).show(); 
        $(createnewsAddSaveCancel).show(); 
        $(createNewsAddTitle).val("");
    });
    
    $(createnewsAddSaveNew).live("click", function(ev){
        var newTitle = $(createNewsAddTitle).val();
        var newContent = tinyMCE.getInstanceById(sakai.news.getEditorID()).getBody().innerHTML;
        var pictureURI = "";
        if(newTitle === ""){
            showAlert("title_empty");
        }else if(newContent === ""){
            showAlert("content_empty");
        }else{
//            showProcess(true);
            saveNewNews(newTitle,newContent,pictureURI);
        }
    });
    
    // Delete a news
    $(newsOperationIconDelete).live("click", function(){
        var title = $(this).parent().siblings("#news_title_td").children()[0].text;
        var id = $(this).parent().siblings("#news_title_td").children()[0].id;
        deleteNews(id);
        $(this).parent().parent().remove();
        // loadNewsList();
    });
    
    // Show a specific news
    $(newsTitle).live("click", function(e){
        var id = e.target.id;
        loadNewsByID(id);
        showContainer("detail");
    });
    
    // Show news list
    $(newsDetailBacktoList).live("click", function(e){
        showContainer("list");
    });
    
    $(newsDetailOptionDelete).live("click", function(){
        var title = $(newsDetailTitle).html();
        var id = $("#news_id").html();
        deleteNews(id);
    });

    //////////
    // Init //
    //////////
    
    // Initialization
    var init = function(){
        // Check if we are logged in or out.
        var person = sakai.data.me;
        var uuid = person.user.userid;
        if (!uuid || person.user.anon) {
            redirectToLoginPage();
        }else {
            loadnewsall();
            var qs = new Querystring();
            var newsid = qs.get("news");
            if (newsid) {
                loadNewsByID(newsid);
                showContainer("detail");
            } else {
                showContainer("list");
            }
        }
    };
    init();
    
};

sakai.api.Widgets.Container.registerForLoad("sakai.news");