var sakai = sakai || {};

sakai.notice = function(){
    var newsEditID = "";
    var allNews = [];
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
//    vacreateNoticeContainerer = createNews + "_container";
    var createNoticeContainer = "#createnotice_container";
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
    
    var noticeGeneralMessagesDeleted_1 = "#notice_generalmessages_deleted_1";
    
    var messagesForTypeCat;
    var messagesPerPage = 13;// default 13 messages per page
    var currentPage = 1;
    var mceNum = 0;
    var newsall = {};
    var newsID = "";
    var editCounter = 1;

    
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
        $("#title_empty").hide();
        $("#content_empty").hide();
        $("#pic_empty").hide();
        $("#pic_format").hide();
    };
    
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
//            url: "/system/news",
            url: "/system/inform",
            type: "GET",
            data:{
              "action":"allList"
            },
            success: function(data) {
              if(data.success){
                if (data.informList.length === 0) {
                  $(newsTableTR).hide();
                  $("#news_no_news_msg").show();
                }else{
                  allNews = data.informList;
                  newsall = data;
                  messagesForTypeCat = data.informList.length;
                  showPage(currentPage);
                  // showPage(1);
                  $("#news_no_news_msg").hide();
                  
                }
              }
              else{
                $(newsListAllError).show();
              }
            },
            error: function() {
              alert("loadinformall error");
            }
        });
    };
    
    var getAllMessages = function(pageNumber){      
        var data1 = [];
        for (var i = 0, j=0; i < messagesForTypeCat; i++) {
          if (!data1[j]) {
            data1[j] = $.parseJSON('{"success":"true","informList": []}');
          }
            data1[j].informList[i] = newsall.informList[i];
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
    var loadNewsByID = function(informid) {
        $.ajax({
            //url: "/devwidgets/news/pages/data/onenews.json",
            url: "/system/inform",
            type: "GET",
            data:{
                "action":"get",
                "id":informid,
            },
            success: function(data) {
                var inform = data.inform;
                if(data.success === true){
                    $(newsDetailContent).html($.TemplateRenderer(newsDetailContentTemplate, inform));
                    $(newsDetailContent).show();
                    $("#no_news_error").hide();
                }else{
                    $("#news_detail_content").show();
                    $("#no_news_error").show();
                }
            },
            error: function(xhr, textStatus, thrownError) {
                alert("数据连接错误，无法读取通知");
            }
        });
    };
    
    sakai.notice.getEditorID = function() {
        return 'mce_' + (mceNum*2 - 1);
    };
    
    var getEditNews = function(id){
        $.ajax({
//            url: "/system/news",
            url: "/system/inform",
            data: {
                "action":"get",
                "id":id,
            },
            type: "GET",
            success: function(data){
                if(data.success == true)
                {
                    var inform = data.inform;
                    // alert(news.title+";;;;"+news.content);
                    $(createNewsAddTitle).val(inform.title);
                    tinyMCE.getInstanceById(sakai.notice.getEditorID()).getBody().innerHTML = inform.content;
                }else {
                    alert("通知不存在，或已被删除");
                    $(createNoticeContainer).jqmHide();
                }
            },
            error: function(data){
                alert("getEditNews error");
            }
        });
    };
    
    var saveEditNews = function(id,title,content,pictureURI){
        $.ajax({
//            url: "/system/news",
            url: "/system/inform",
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
                    showProcess(false);
                    showSuccess(true);
                    loadnewsall();
                    $(createNoticeContainer).jqmHide();
                }
            },
            error: function(data){
                alert("saveEditInform error");
            },
        });
    };
    
    var saveNewNews = function(title,content,pictureURI){
        $.ajax({
//            url: "/system/news",
            url: "/system/inform",
            data: {
                "action":"add",
                "title":title,
                "content":content,
                "pictureURI":pictureURI,
            },
            type: "POST",
            success: function(data){
                showProcess(false);
                if(data.success === true){
                   showSuccess(true);
                   loadnewsall();
                   $("#createnotice_container").jqmHide();
                }
            },
            error: function(data){
                alert("saveNewInform error");
            },
        });
    };

    
    
    /////////////////
    // Delete news //
    /////////////////
    var deleteNews = function(newsid){
        $.ajax({
//            url: "/system/news",
            url: "/system/inform",
            type: "POST",
            data: {
                "action": "delete",
                "id": newsid
            },
            success: function(data) {
                if(data.success === true)
                {
//                    alert("ok");
                    showGeneralMessage($(noticeGeneralMessagesDeleted_1).text(), false);
                    loadnewsall();
                    showContainer("list");
                }else {
                    if($(newsDetailContainer).is(":visible")) {
                        // showAlert("detail_cannt_delete");
                    }else {
                        // showAlert("list_cannt_delete");
                    }
                    alert("此新闻已被删除！");
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
        $(createNoticeContainer).jqmShow();
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
        $(createNoticeContainer).jqmShow();
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
        var Content = tinyMCE.getInstanceById(sakai.notice.getEditorID()).getBody().innerHTML;
        if(Title === ""){
            showAlert("title_empty");
        }else if(tinyMCE.getInstanceById(sakai.notice.getEditorID()).getContent() === ""){
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
//        $(createNoticeContainer).jqmShow();
        $(createNoticeContainer).jqmShow();
        $(createNewsTipEdit).hide();
        $(createnewsAddSaveEdit).hide();
        $(createNewsTipNew).show(); 
        $(createnewsAddSaveNew).show(); 
        $(createnewsAddSaveCancel).show(); 
        $(createNewsAddTitle).val("");
    });
    
    $(createnewsAddSaveNew).live("click", function(ev){
        var newTitle = $(createNewsAddTitle).val();
        var newContent = tinyMCE.getInstanceById(sakai.notice.getEditorID()).getBody().innerHTML;
        var pictureURI = "";
        if(newTitle === ""){
            showAlert("title_empty");
        }else if(tinyMCE.getInstanceById(sakai.notice.getEditorID()).getContent() === ""){
            showAlert("content_empty");
        }else{
            showProcess(true);
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

sakai.api.Widgets.Container.registerForLoad("sakai.notice");